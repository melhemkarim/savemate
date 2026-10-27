import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { allPlans, formatDate, MODES, todayISO } from "@/lib/plans";
import type { Goal, Tx } from "@/lib/types";
import { Progress } from "@/components/Progress";
import { ContributeForm } from "@/components/ContributeForm";
import { ConfirmForm } from "@/components/ConfirmForm";
import { SubmitButton } from "@/components/SubmitButton";
import { changeMode, deleteGoal, reverseTransaction, setStatus } from "../../actions";

export default async function GoalPage({ params }: { params: { id: string } }) {
  const { supabase, profile } = await getSession();
  const { data } = await supabase.from("goal_progress").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const goal = data as Goal;
  const { data: t } = await supabase.from("transactions").select("*").eq("goal_id", goal.id).order("created_at", { ascending: false });
  const txs = (t ?? []) as Tx[];
  const reversed = new Set(txs.map((x) => x.reverses_id).filter(Boolean));
  const today = todayISO(profile.timezone), money = (c: number) => formatMoney(c, profile.currency);
  const pct = (goal.saved_cents / goal.target_cents) * 100;
  const plans = allPlans(goal.target_cents, goal.saved_cents, goal.target_date, today);
  const remaining = Math.max(0, goal.target_cents - goal.saved_cents);
  const milestone = [100, 75, 50, 25].find((m) => pct >= m);
  const statusBtn = (status: string, label: string, primary = false) => (
    <form action={setStatus}><input type="hidden" name="id" value={goal.id} /><input type="hidden" name="status" value={status} />
      <SubmitButton className={`btn ${primary ? "btn-dark" : "btn-ghost"}`} pendingText="Updating…">{label}</SubmitButton></form>
  );

  return (
    <div className="grid gap-6">
      <div><Link href="/goals" className="text-sm font-semibold text-brand-deep underline underline-offset-4">← My goals</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-3xl font-extrabold"><span aria-hidden>{goal.icon}</span> {goal.name}</h1>
            {goal.description && <p className="mt-1 max-w-xl text-ink2">{goal.description}</p>}</div>
          <span className="rounded-full bg-mint2 px-3 py-1 text-sm font-semibold capitalize text-brand-deep">{goal.status}</span>
        </div>
      </div>

      <section className="card">
        <p className="font-display text-4xl font-extrabold tracking-tight tabular-nums">{money(goal.saved_cents)} <span className="text-lg font-semibold text-ink3">of {money(goal.target_cents)}</span></p>
        <div className="my-3"><Progress pct={pct} /></div>
        <div className="flex flex-wrap justify-between gap-2 text-sm text-ink3"><span>{Math.floor(Math.min(100, pct))}% saved · {money(remaining)} to go</span><span>Target date {formatDate(goal.target_date)}</span></div>
        {goal.status === "completed" && <p className="msg-ok mt-4">You reached this goal. Congratulations!</p>}
        {goal.status !== "completed" && milestone && <p className="msg-ok mt-4">Milestone reached: {milestone}% saved.</p>}
      </section>

      {goal.status === "active" && (
        <section className="card" aria-labelledby="add-h"><h2 id="add-h" className="mb-3 text-lg font-bold">Add savings</h2><ContributeForm goals={[{ id: goal.id, name: goal.name }]} fixedGoalId={goal.id} /></section>
      )}

      {remaining > 0 && goal.status !== "completed" && (
        <section className="card" aria-labelledby="plan-h">
          <h2 id="plan-h" className="text-lg font-bold">Your saving pace</h2>
          <p className="mb-4 text-sm text-ink3">Pick what fits your budget. You can switch any time and your progress stays the same.</p>
          <form action={changeMode} className="grid gap-3">
            <input type="hidden" name="id" value={goal.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              {plans.map((p) => {
                const m = MODES.find((x) => x.id === p.mode)!;
                return (
                  <label key={p.mode} className="cursor-pointer">
                    <input type="radio" name="mode" value={p.mode} defaultChecked={goal.mode === p.mode} className="peer sr-only" />
                    <span className="block rounded-xl border-[1.5px] border-line p-3 peer-checked:border-ink peer-checked:shadow-[0_0_0_3px_rgba(2,223,113,.4)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-brand-deep">
                      <b>{m.name}</b>
                      <span className="block font-display text-2xl font-extrabold tracking-tight tabular-nums">{money(p.dailyCents)}<span className="text-sm font-medium text-ink3">/day</span></span>
                      <span className="block text-sm text-ink3">{money(p.weeklyCents)}/week · {p.deltaDays > 0 ? `${p.deltaDays} days after your date` : p.deltaDays < 0 ? `${-p.deltaDays} days early` : "on your date"}</span>
                      <span className="mt-1 block text-sm text-ink2">{m.blurb}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <div><SubmitButton className="btn btn-dark" pendingText="Saving…">Use this pace</SubmitButton></div>
          </form>
        </section>
      )}

      <section className="card" aria-labelledby="hist-h">
        <h2 id="hist-h" className="mb-3 text-lg font-bold">History</h2>
        {txs.length === 0 ? <p className="text-ink3">No savings logged yet.</p> : (
          <ul className="divide-y divide-line">
            {txs.map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className={reversed.has(x.id) ? "text-ink3 line-through" : ""}>
                  <p className="font-medium">{x.kind === "correction" ? "Correction" : x.note || "Savings"}</p>
                  <p className="text-sm text-ink3 no-underline">{formatDate(x.occurred_on)}{reversed.has(x.id) ? " (corrected)" : ""}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold tabular-nums ${x.amount_cents < 0 ? "text-ink3" : "text-brand-deep"}`}>{x.amount_cents < 0 ? "−" : "+"}{money(Math.abs(x.amount_cents))}</span>
                  {x.kind === "contribution" && !reversed.has(x.id) && (
                    <ConfirmForm small action={reverseTransaction} id={x.id} label="Undo" title="Undo this entry?" message={`This adds a correction of −${money(x.amount_cents)}. The original entry stays in your history.`} confirmLabel="Undo entry" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap gap-3" aria-label="Goal actions">
        <Link href={`/goals/${goal.id}/edit`} className="btn btn-ghost">Edit goal</Link>
        {goal.status === "active" && <>{statusBtn("paused", "Pause")}{statusBtn("completed", "Mark complete", true)}</>}
        {goal.status === "paused" && statusBtn("active", "Resume", true)}
        {goal.status === "completed" && statusBtn("active", "Reopen")}
        <ConfirmForm action={deleteGoal} id={goal.id} label="Delete goal" title="Delete this goal?" message="This permanently removes the goal and all of its savings history. This can't be undone." confirmLabel="Delete goal" />
      </section>
    </div>
  );
}
