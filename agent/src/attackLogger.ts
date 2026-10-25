import fs from 'fs';
import path from 'path';

export interface AttackLogEntry {
  id: string;
  timestamp: string;
  vector: string;
  caller: string;
  details: string;
  rejectionReason: string;
  blockedBy: string;
  simulated?: boolean;
}

/**
 * Appends a real rejected attack/attempt event to the attack_events.jsonl log file.
 * Used whenever the agent or e2e script rejects an invalid, stolen, replayed, or over-cap request.
 */
export function logAttackEvent(
  entry: Omit<AttackLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): AttackLogEntry {
  const fullEntry: AttackLogEntry = {
    id: entry.id || `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    vector: entry.vector,
    caller: entry.caller,
    details: entry.details,
    rejectionReason: entry.rejectionReason,
    blockedBy: entry.blockedBy,
    simulated: Boolean(entry.simulated),
  };

  const line = JSON.stringify(fullEntry) + '\n';

  // Candidate paths depending on current working directory
  const possiblePaths = [
    path.resolve(process.cwd(), 'frontend', 'public', 'data', 'attack_events.jsonl'),
    path.resolve(process.cwd(), '..', 'frontend', 'public', 'data', 'attack_events.jsonl'),
    path.resolve(process.cwd(), 'attack_events.jsonl'),
  ];

  for (const p of possiblePaths) {
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir) || dir.includes('frontend')) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(p, line, 'utf8');
        break;
      }
    } catch {
      // Ignore write errors to optional fallback paths
    }
  }

  return fullEntry;
}
