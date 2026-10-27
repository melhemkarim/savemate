import type { Mode } from "./types";

export const MODES: { id: Mode; name: string; factor: number; blurb: string }[] = [
  { id: "chill", name: "Chill", factor: 1.5, blurb: "Smaller amounts, more time. Finishes after your date." },
  { id: "balanced", name: "Balanced", factor: 1, blurb: "Steady and predictable. Finishes on your date." },
  { id: "ambitious", name: "Ambitious", factor: 0.75, blurb: "Higher amounts, finishes earlier." },
  { id: "beast", name: "Beast Mode", factor: 0.5, blurb: "A short sprint at the highest amount. Only if it feels comfortable." },
];

export function todayISO(tz = "UTC"): string {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); }
  catch { return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(new Date()); }
}
const ms = (iso: string) => Date.parse(iso + "T00:00:00Z");
export const diffDays = (a: string, b: string) => Math.round((ms(b) - ms(a)) / 86_400_000);
export const addDaysISO = (iso: string, n: number) => new Date(ms(iso) + n * 86_400_000).toISOString().slice(0, 10);
export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) =>
  new Date(ms(iso)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

export interface Plan { mode: Mode; days: number; dailyCents: number; weeklyCents: number; finishISO: string; deltaDays: number }

/** Suggested contribution per mode. Integer cents, rounded up so the plan always reaches the target. */
export function planFor(mode: Mode, targetCents: number, savedCents: number, targetDate: string, today: string): Plan {
  const factor = MODES.find((m) => m.id === mode)!.factor;
  const remaining = Math.max(0, targetCents - savedCents);
  const daysLeft = Math.max(1, diffDays(today, targetDate));
  const days = Math.max(1, Math.ceil(daysLeft * factor));
  const dailyCents = Math.ceil(remaining / days);
  return { mode, days, dailyCents, weeklyCents: dailyCents * 7, finishISO: addDaysISO(today, days), deltaDays: days - daysLeft };
}
export const allPlans = (t: number, s: number, d: string, today: string) => MODES.map((m) => planFor(m.id, t, s, d, today));
