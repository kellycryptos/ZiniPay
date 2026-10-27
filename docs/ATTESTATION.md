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

## 4. Attestation Status & Relabeling in ZiniPay

> **Current Implementation Status**:  
> `Attestation report received (not independently verified)`

In ZiniPay's multi-agent deliberation engine ([`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts)):
1. **Fresh Nonce Challenge**: The agent generates a 32-byte cryptographic nonce challenge and requests `GET /v1/attestation/report?nonce={nonce}` from `https://cloud-api.near.ai/v1`.
2. **Freshness & Header Check**: The engine verifies that `gateway_attestation` is returned, confirms the presence of `intel_quote`, and ensures the echoed `request_nonce` exactly matches the challenge nonce.
3. **Audit Reference Hash**: It computes `sha256(JSON.stringify(report))` and records the digest in the proposal metadata and description as `[Attestation report received (not independently verified): sha256:...]`.
4. **Honest Boundary**: Full cryptographic verification of the Intel TDX DCAP hardware quote (validating PCK certificate chains against Intel PCS and ensuring `report_data` binds `signing_address`) is not implemented locally in this monorepo build, as it requires Intel DCAP QVL libraries or the `nearai-cloud-verifier` service. Until full DCAP verification is wired in, all code, UI badges, and documentation explicitly state:  
   **"Attestation report received (not independently verified)"**.

### **Fail-Closed Guarantees**
1. **No Fake Quotes**: If `OPENAI_API_KEY` is not provided or live network access to `cloud-api.near.ai` is absent, the agent runs strictly in `--dry-run` simulation mode and outputs explicit `[SIMULATION]` tags. It **never** fabricates fake TEE quotes or synthetic ed25519 signatures.
2. **Tamper Resistance**: If the returned nonce does not match, or if any field of the report is tampered with, deliberation halts immediately and marks `consensusApproved: false`.
3. **Auditability**: The SHA-256 digest of the received attestation report is embedded directly into the Sputnik DAO proposal description (`[Attestation report received (not independently verified): sha256:<digest>]`), enabling council members and auditors to verify the inference proof against NEAR AI Cloud on-chain.
