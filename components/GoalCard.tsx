import Link from "next/link";
import { Progress } from "./Progress";
import { formatMoney } from "@/lib/money";
import { formatDate, planFor } from "@/lib/plans";
import type { Goal } from "@/lib/types";

export function GoalCard({ goal, currency, today }: { goal: Goal; currency: string; today: string }) {
  const pct = (goal.saved_cents / goal.target_cents) * 100;
  const plan = planFor(goal.mode, goal.target_cents, goal.saved_cents, goal.target_date, today);
  return (
    <Link href={`/goals/${goal.id}`} className="card block transition hover:border-brand-mid">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold"><span aria-hidden>{goal.icon}</span> {goal.name}</h3>
        {goal.status !== "active" && <span className="rounded-full bg-mint2 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-deep">{goal.status}</span>}
      </div>
      <p className="mt-1 text-sm text-ink2"><span className="font-semibold text-ink">{formatMoney(goal.saved_cents, currency)}</span> of {formatMoney(goal.target_cents, currency)}</p>
      <div className="mt-3"><Progress pct={pct} /></div>
      <div className="mt-2 flex justify-between text-sm text-ink3">
        <span>{Math.floor(Math.min(100, pct))}% saved</span>
        <span>{goal.status === "active" ? `${formatMoney(plan.dailyCents, currency)}/day · due ${formatDate(goal.target_date, { month: "short", day: "numeric" })}` : `Due ${formatDate(goal.target_date, { month: "short", day: "numeric" })}`}</span>
      </div>
    </Link>
  );
}
