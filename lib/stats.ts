import type { Tx } from "./types";
import { addDaysISO } from "./plans";

export function netByDay(txs: Pick<Tx, "amount_cents" | "occurred_on">[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of txs) m.set(t.occurred_on, (m.get(t.occurred_on) ?? 0) + t.amount_cents);
  return m;
}
export function currentStreak(m: Map<string, number>, today: string): number {
  let d = (m.get(today) ?? 0) > 0 ? today : addDaysISO(today, -1);
  let n = 0;
  while ((m.get(d) ?? 0) > 0) { n++; d = addDaysISO(d, -1); }
  return n;
}
export function longestStreak(m: Map<string, number>): number {
  const days = [...m.entries()].filter(([, v]) => v > 0).map(([k]) => k).sort();
  let best = 0, run = 0, prev = "";
  for (const d of days) { run = prev && addDaysISO(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}
export function lastDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDaysISO(today, i - (n - 1)));
}
