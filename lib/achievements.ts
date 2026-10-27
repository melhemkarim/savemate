import { formatMoney } from "./money";
import { longestStreak, netByDay } from "./stats";
import type { Goal, Tx } from "./types";

export interface Achievement { id: string; icon: string; title: string; desc: string; earned: boolean }

/** Derived from existing data, so no schema change is needed. */
export function achievements(goals: Goal[], txs: Pick<Tx, "kind" | "amount_cents" | "occurred_on">[], currency: string): Achievement[] {
  const best = Math.max(0, ...goals.map((g) => (g.saved_cents / g.target_cents) * 100));
  const longest = longestStreak(netByDay(txs));
  const total = goals.reduce((s, g) => s + Math.max(0, g.saved_cents), 0);
  return [
    { id: "first", icon: "🌱", title: "First step", desc: "Log your first saving.", earned: txs.some((t) => t.kind === "contribution") },
    { id: "s3", icon: "🔥", title: "3-day streak", desc: "Save 3 days in a row.", earned: longest >= 3 },
    { id: "s7", icon: "⚡", title: "7-day streak", desc: "Save 7 days in a row.", earned: longest >= 7 },
    { id: "s30", icon: "🏅", title: "30-day streak", desc: "Save 30 days in a row.", earned: longest >= 30 },
    { id: "p25", icon: "🪜", title: "Quarter way", desc: "Reach 25% on any goal.", earned: best >= 25 },
    { id: "p50", icon: "⛰️", title: "Halfway there", desc: "Reach 50% on any goal.", earned: best >= 50 },
    { id: "p75", icon: "🚀", title: "Nearly there", desc: "Reach 75% on any goal.", earned: best >= 75 },
    { id: "done", icon: "🏆", title: "Goal reached", desc: "Complete a goal.", earned: goals.some((g) => g.status === "completed") },
    { id: "t100", icon: "💰", title: "First 100", desc: `Save ${formatMoney(10_000, currency)} across all goals.`, earned: total >= 10_000 },
  ];
}
