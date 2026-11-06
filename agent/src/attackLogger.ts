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

  // Candidate paths depending on current working directory.
  // Simulated / dry-run attempts route to a separate git-ignored file so local dry-runs never dirty git trees.
  const fileName = fullEntry.simulated ? 'attack_events_simulated.jsonl' : 'attack_events.jsonl';
  const possiblePaths = [
    path.resolve(process.cwd(), '..', 'frontend', 'public', 'data', fileName),
    path.resolve(process.cwd(), 'frontend', 'public', 'data', fileName),
    path.resolve(process.cwd(), fileName),
  ];

  const targetPath = possiblePaths.find((p) => fs.existsSync(path.dirname(p))) || possiblePaths[1];
  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(targetPath, line, 'utf8');
  } catch {
    // Ignore write errors to optional fallback paths
  }

  return fullEntry;
}
