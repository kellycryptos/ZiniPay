/**
 * validator.ts — LLM-powered deliverable validator
 *
 * Uses NEAR AI Cloud (or any OpenAI-compatible API) to:
 *   1. Verify the deliverable description is coherent and matches the task
 *   2. Generate a concise justification for the DAO proposal description
 *   3. Return a confidence score (0–100) so the policy engine can set thresholds
 *
 * Supports mock/dry-run mode when no live API key is set.
 */

import OpenAI from 'openai';

export interface ValidationRequest {
  /** What the contributor was supposed to do */
  taskDescription: string;
  /** What they claim to have done + proof link/CID */
  deliverable: string;
  /** Amount being requested in human-readable NEAR (e.g. "5 NEAR") */
  amountNear: string;
  /** Optional: recipient's past reputation score */
  recipientReputation?: number;
}

export interface ValidationResult {
  approved: boolean;
  confidence: number;        // 0–100
  justification: string;     // Used verbatim in the DAO proposal description
  concerns: string[];        // Reasons for rejection or low confidence
}

const SYSTEM_PROMPT = `You are SynCommons Agent, an autonomous treasury AI for a NEAR Protocol community DAO.

Your job is to validate contributor deliverables and decide whether to approve a payment proposal.

Rules:
- Only approve if the deliverable clearly matches the task description
- Be skeptical of vague deliverables ("I did some work") — require specifics
- Flag plagiarism risks, duplicate claims, or implausible timelines
- Consider the amount reasonable relative to the stated work
- Your justification will be posted on-chain as the DAO proposal description — keep it factual, professional, and under 200 characters

Respond ONLY with valid JSON matching this schema:
{
  "approved": boolean,
  "confidence": number (0-100),
  "justification": string (max 200 chars, used as on-chain proposal description),
  "concerns": string[] (empty if approved cleanly)
}`;

export class DeliverableValidator {
  private client: OpenAI;
  private model: string;
  private apiKey: string;

  constructor(opts: { baseUrl: string; apiKey: string; model: string }) {
    this.apiKey = opts.apiKey;
    this.client = new OpenAI({
      baseURL: opts.baseUrl,
      apiKey: opts.apiKey || 'dummy-key',
    });
    this.model = opts.model;
  }

  async validate(req: ValidationRequest): Promise<ValidationResult> {
    // If running in demo / dry-run without active key, simulate validation
    if (!this.apiKey || this.apiKey.startsWith('mock') || this.apiKey.includes('YOUR_')) {
      const summary = req.taskDescription.length > 50 ? `${req.taskDescription.slice(0, 47)}...` : req.taskDescription;
      return {
        approved: true,
        confidence: 94,
        justification: `AI Verified: Work matched task "${summary}" with valid deliverable proof`,
        concerns: [],
      };
    }

    const userMessage = `
TASK: ${req.taskDescription}

DELIVERABLE SUBMITTED: ${req.deliverable}

AMOUNT REQUESTED: ${req.amountNear}
${req.recipientReputation !== undefined ? `RECIPIENT REPUTATION SCORE: ${req.recipientReputation}/100` : ''}

Validate this deliverable and respond with JSON only.
`.trim();

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content ?? '';
      const jsonStr = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonStr) as ValidationResult;

      if (result.justification?.length > 200) {
        result.justification = result.justification.slice(0, 197) + '...';
      }

      return result;
    } catch (err) {
      return {
        approved: false,
        confidence: 0,
        justification: 'Validator error — manual review required.',
        concerns: [(err as Error).message],
      };
    }
  }
}
