# NEAR AI Cloud — Verifiable Confidential Inference & Attestation Specification

This document details the architecture, REST endpoints, payload schemas, and cryptographic verification procedures for **NEAR AI Cloud** verifiable confidential inference inside Trusted Execution Environments (TEEs).

Official URLs:
- **NEAR AI Cloud API Endpoint**: `https://cloud-api.near.ai/v1`
- **Official Documentation**: [https://docs.near.ai/cloud/verification](https://docs.near.ai/cloud/verification)
- **Official Verifier Codebase**: [https://github.com/nearai/nearai-cloud-verifier](https://github.com/nearai/nearai-cloud-verifier)
- **Open-Source API Backend**: [https://github.com/nearai/cloud-api](https://github.com/nearai/cloud-api)

---

## 1. Verifiable Confidential Inference Architecture

Traditional cloud AI providers require complete trust in the host operator: inputs, system prompts, and responses can be intercepted, logged, or tampered with.

NEAR AI Cloud executes inference workloads inside hardware-enforced **Trusted Execution Environments (TEEs)**:
- **Gateway Proxy**: Runs inside an **Intel TDX Confidential VM (CVM)**. It terminates client TLS connections, verifies model attestations, and signs responses.
- **Model Workers**: Run open-weight LLMs (e.g. `meta-llama/Llama-3.3-70B-Instruct`, `Qwen/Qwen2.5-72B-Instruct`, `deepseek-ai/DeepSeek-V3`) on **NVIDIA Hopper/Blackwell GPUs** protected by NVIDIA Confidential Computing and Intel TDX.
- **Hardware Attestation**: The CPU and GPU generate cryptographically signed hardware quotes showing that the firmware, boot measurements (RTMRs), and Docker container images match expected values.

---

## 2. Attestation REST API Endpoint

Clients request cryptographic attestation reports before or alongside inference to prove enclave authenticity:

### **Endpoint**
```http
GET https://cloud-api.near.ai/v1/attestation/report
```

### **Query Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `nonce` | `string` | **Yes** | 32-byte cryptographic challenge encoded as 64 hex characters (`[0-9a-f]{64}`). Enforces freshness and prevents replay attacks. |
| `signing_algo` | `string` | No | Signature algorithm to use for response signing (e.g. `ecdsa` or `ed25519`). Default is `ecdsa`. |
| `model` | `string` | No | Identifier of the LLM to inspect (e.g. `meta-llama/Llama-3.3-70B-Instruct`). Fetches model worker TEE evidence. |
| `include_tls_fingerprint` | `boolean` | No | When `true`, binds the gateway TLS certificate SHA-256 fingerprint into the TEE report data. |

---

## 3. Attestation Report Schema

The response is a JSON object containing cryptographic hardware quotes and identity bindings:

```json
{
  "gateway_attestation": {
    "intel_quote": "<hex-encoded Intel TDX DCAP quote>",
    "request_nonce": "<64-character hex nonce supplied by client>",
    "signing_address": "0x3a9fB06B9229eE9f430D4e2aFe2D76020c29a8a3",
    "signing_algo": "ecdsa",
    "event_log": [
      {
        "pcr": 3,
        "event_type": "EV_EVENT_TAG",
        "digest": "<hex-digest>",
        "event_data": "<docker-manifest-digest>"
      }
    ],
    "tcb_info": {
      "app_compose": "<sha256 hash of docker-compose enclave config>",
      "version": "1.0.0"
    }
  },
  "model_attestations": [
    {
      "provider": "near",
      "model": "meta-llama/Llama-3.3-70B-Instruct",
      "intel_quote": "<hex-encoded Intel TDX quote for worker node>",
      "gpu_attestation": {
        "nras_token": "<signed JWT token from NVIDIA Remote Attestation Service>",
        "evidence": "<encoded GPU measurements and driver signatures>"
      },
      "nonce": "<64-character hex nonce>"
    }
  ],
  "tls_certificate": {
    "tls_cert_fingerprint": "sha256:7b1d...6a2f"
  }
}
```

### **Field Definitions**
- **`intel_quote`**: The Intel TDX DCAP hardware quote. Contains the TEE's measurement registers (MRTD, RTMR0–RTMR3) and user-supplied `report_data` signed by Intel's Provisioning Certification Key (PCK).
- **`request_nonce`**: Echo of the client's challenge nonce, verifying that the quote was generated dynamically for this deliberation and is not a replayed cached proof.
- **`signing_address`**: The public key / Ethereum-style address bound inside the enclave's memory. The private key never leaves the TEE and is used to sign inference responses.
- **`gpu_attestation`**: Verification token issued by NVIDIA Remote Attestation Service (NRAS), cryptographically certifying that GPU memory encryption is active and no untrusted code has accessed weights.

---

## 4. Hardware Attestation & Response Signature Verification with `@nearai/inference-sdk@0.2.1`

ZiniPay integrates the official [`@nearai/inference-sdk`](https://github.com/nearai/inference-sdk) (`v0.2.1`) to turn unverified inference reports into cryptographically checked execution proofs:

> [!IMPORTANT]
> **On-Chain Record Status (Proposal #5)**: The proposal on record in `verified.json` (Proposal #5 on `zinipay-demo.sputnikv2.testnet`) was generated during initial testnet deployment in simulation mode (`[SIMULATION]`) prior to NEAR AI Cloud credit funding. Its attestation status is strictly recorded as **`Simulated run (attestation report received, not independently verified)`**. ZiniPay makes **no claim of verified Intel TDX hardware quotes** for Proposal #5 until a live funded run is executed. The `@nearai/inference-sdk@0.2.1` client is dynamically loaded to verify quotes whenever a funded key and supported Node runtime (>= 24.22.1) are present.

### **What the SDK is Designed to Verify**

According to the official SDK verification guide:
1. **Gateway Attestation Preflight**: Before sending an inference request, `InferenceClient` verifies the NEAR AI Cloud Gateway's Intel TDX DCAP hardware quote against Intel's Provisioning Certification Service (PCS). In Node.js, it captures the gateway's TLS SPKI fingerprint and pins all subsequent model metadata and inference requests to that attested identity.
2. **Model Worker Hardware Proof**: For attested models (e.g. `providerType: 'vllm'` such as `z-ai/glm-5.3-flash`), the SDK verifies every returned model attestation report—including the Intel TDX CPU quote and NVIDIA Remote Attestation Service (NRAS) GPU token—before selecting the public key for model-routing.
3. **Response Body & Signature Verification (`verifyResponse`)**: After receiving a completion, calling `await client.verifyResponse(completion.id)` verifies that:
   - For `signatureKind: 'provider_tee'`: The model-serving TEE signer signed the exact request and response body bytes.
   - For `signatureKind: 'gateway'`: The verified Gateway signer signed the exact client-visible request and response body bytes.

### **Fail-Closed Integration in Deliberation**

In [`agent/src/deliberation.ts`](../agent/src/deliberation.ts):
```typescript
// Inspector and Risk Arbiter execution:
const completion = await client.chat.completions.create({ model, messages, ... });
const verifiedReceipt = await client.verifyResponse(completion.id);
// If verifyResponse throws: proposal is immediately REJECTED (fail closed).
```

### **Attestation Wording Rules**

- **When `verifyResponse` passes**: The proposal description and audit trail record:  
  `[Gateway and model attestation checked, response signature verified (SDK 0.2.1): kind=<signatureKind>, id=<completionId>]`
- **When `verifyResponse` was not run** (simulation mode, local dry run, or mock): The honest label is preserved:  
  `[Attestation report received (not independently verified)]`
- **When `verifyResponse` throws**: Deliberation fails closed, rejects the proposal, and logs the verification error.

---

## 5. Fail-Closed Guarantees & Verification Matrix

| Mode | Key & Credits | Gateway Attestation | Model Attestation | Response Signature (`verifyResponse`) | Attestation Wording |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Live Verified** | Funded NEAR AI key | Checked via SDK | Checked via SDK (`vllm`) | Checked (`provider_tee`) | `"gateway and model attestation checked, response signature verified (SDK 0.2.1)"` |
| **Simulation / Dry-Run** | Unset or mock key | Simulated | Simulated | Skipped | `"Attestation report received (not independently verified)"` |
| **Failed Signature** | Any | Mismatch / Thrown | Mismatch / Thrown | Throws `VerificationError` | Proposal REJECTED (Fail Closed) |

### **Reviewer Inspection**

Reviewers can verify both the on-chain proposal and its attached model review receipt at any time:
```bash
npm run verify:proposal -- 5
```
This queries Sputnik DAO RPC and displays the verified completion ID and `signatureKind` alongside the on-chain multi-sig execution record.
