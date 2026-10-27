import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { addDaysISO, formatDate, planFor, todayISO } from "@/lib/plans";
import { currentStreak, lastDays, longestStreak, netByDay } from "@/lib/stats";
import type { Goal, Tx } from "@/lib/types";
import { GoalCard } from "@/components/GoalCard";
import { ContributeForm } from "@/components/ContributeForm";

export default async function Dashboard() {
  const { supabase, profile } = await getSession();
  const today = todayISO(profile.timezone);
  const [{ data: g }, { data: t }] = await Promise.all([
    supabase.from("goal_progress").select("*").order("target_date"),
    supabase.from("transactions").select("*").gte("occurred_on", addDaysISO(today, -365)).order("created_at", { ascending: false }),
  ]);
  const goals = (g ?? []) as Goal[], txs = (t ?? []) as Tx[];
  const active = goals.filter((x) => x.status === "active");
  const cur = profile.currency, money = (c: number) => formatMoney(c, cur);

  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: profile.timezone }).format(new Date())) % 24;
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const byDay = netByDay(txs);
  const streak = currentStreak(byDay, today), longest = longestStreak(byDay);
  const savedToday = Math.max(0, byDay.get(today) ?? 0);
  const totalSaved = active.reduce((s, x) => s + x.saved_cents, 0);
  const todayTarget = active.reduce((s, x) => s + (x.saved_cents < x.target_cents ? planFor(x.mode, x.target_cents, x.saved_cents, x.target_date, today).dailyCents : 0), 0);
  const week = lastDays(today, 7).map((d) => ({ d, cents: Math.max(0, byDay.get(d) ?? 0) }));
  const max = Math.max(1, ...week.map((w) => w.cents), todayTarget);
  const goalName = new Map(goals.map((x) => [x.id, x.name]));
  const upcoming = [...active].sort((a, b) => a.target_date.localeCompare(b.target_date)).slice(0, 3);

  if (goals.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold">{greet}{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
        <div className="card mt-8 max-w-xl p-8 text-center">
          <p className="text-5xl" aria-hidden>🎯</p>
          <h2 className="mt-3 text-2xl font-bold">Start with one goal</h2>
          <p className="mt-2 text-ink2">Name something you want, set a target and a date, and SaveMate turns it into a daily amount.</p>
          <Link href="/goals/new" className="btn btn-primary mt-5">Create your first goal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold">{greet}{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
          <p className="mt-1 text-ink2">{streak > 0 ? `You're on a ${streak}-day streak. Keep it going.` : "A small saving today is a good place to start."}</p></div>
        <Link href="/goals/new" className="btn btn-dark hidden sm:inline-flex"><Plus size={18} aria-hidden /> New goal</Link>
      </header>

      {active.length > 0 && streak === 0 && longest > 0 && (
        <section className="card border-brand-mid" aria-labelledby="rec-h">
          <h2 id="rec-h" className="text-lg font-bold">Missed yesterday? No problem.</h2>
          <p className="mb-4 mt-1 text-ink2">Nothing is lost. {todayTarget > 0 ? `Your suggested amount has adjusted to ${money(todayTarget)} a day so you still finish on time. ` : ""}If you did save yesterday, log it here to restore your streak.</p>
          <ContributeForm idp="rec-" date={addDaysISO(today, -1)} goals={active.map((x) => ({ id: x.id, name: x.name }))} />
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Total saved", v: money(totalSaved), s: `across ${active.length} active goal${active.length === 1 ? "" : "s"}` },
          { l: "Today", v: money(savedToday), s: todayTarget > 0 ? `of ${money(todayTarget)} suggested` : "No suggested amount today" },
          { l: "Current streak", v: `${streak} day${streak === 1 ? "" : "s"}`, s: `Longest: ${longest} day${longest === 1 ? "" : "s"}`, icon: true },
        ].map((k) => (
          <div key={k.l} className="border-l-[3px] border-brand py-1 pl-4">
            <p className="text-sm text-ink3">{k.l}</p>
            <p className="flex items-center gap-1.5 font-display text-3xl font-extrabold tracking-tight tabular-nums">{k.v}{k.icon && streak > 0 && <Flame size={22} className="text-brand-mid" aria-hidden />}</p>
            <p className="text-sm text-ink3">{k.s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card" aria-labelledby="add-h">
          <h2 id="add-h" className="mb-3 text-lg font-bold">Log today&apos;s saving</h2>
          {active.length ? <ContributeForm goals={active.map((x) => ({ id: x.id, name: x.name }))} /> : <p className="text-ink2">You have no active goals. Resume or create one to add savings.</p>}
        </section>
        <section className="card" aria-labelledby="wk-h">
          <h2 id="wk-h" className="mb-3 text-lg font-bold">Last 7 days</h2>
          <div className="flex h-36 items-end gap-2" role="img" aria-label={`Savings by day: ${week.map((w) => `${formatDate(w.d, { weekday: "short" })} ${money(w.cents)}`).join(", ")}`}>
            {week.map((w, i) => (
              <div key={w.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div className={`w-full max-w-[34px] rounded-t-lg ${w.cents ? (i === 6 ? "bg-brand" : "bg-brand-mid") : "border-[1.5px] border-dashed border-line"}`} style={{ height: `${w.cents ? Math.max(4, (w.cents / max) * 100) : 6}%` }} />
                <span className={`text-xs ${i === 6 ? "font-bold" : "text-ink3"}`}>{i === 6 ? "Today" : formatDate(w.d, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink3">Days without saving are fine. Pick up whenever you&apos;re ready.</p>
        </section>
      </div>

      <section aria-labelledby="goals-h">
        <div className="mb-3 flex items-center justify-between"><h2 id="goals-h" className="text-xl font-bold">Active goals</h2><Link href="/goals" className="text-sm font-semibold text-brand-deep underline underline-offset-4">View all</Link></div>
        {active.length ? <div className="grid gap-4 md:grid-cols-2">{active.map((x) => <GoalCard key={x.id} goal={x} currency={cur} today={today} />)}</div> : <p className="text-ink2">No active goals right now.</p>}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card" aria-labelledby="up-h">
          <h2 id="up-h" className="mb-3 text-lg font-bold">Upcoming deadlines</h2>
          {upcoming.length ? <ul className="grid gap-2">{upcoming.map((x) => <li key={x.id} className="flex justify-between gap-3"><Link href={`/goals/${x.id}`} className="font-medium hover:underline">{x.icon} {x.name}</Link><span className="text-ink3">{formatDate(x.target_date)}</span></li>)}</ul> : <p className="text-ink3">Nothing coming up.</p>}
        </section>
        <section className="card" aria-labelledby="act-h">
          <h2 id="act-h" className="mb-3 text-lg font-bold">Recent activity</h2>
          {txs.length ? <ul className="grid gap-2">{txs.slice(0, 6).map((x) => (
            <li key={x.id} className="flex justify-between gap-3 text-sm"><span><span className="font-medium">{x.kind === "correction" ? "Correction" : goalName.get(x.goal_id) ?? "Goal"}</span><span className="block text-ink3">{x.kind === "correction" ? `${goalName.get(x.goal_id) ?? "Goal"}, ` : ""}{formatDate(x.occurred_on, { month: "short", day: "numeric" })}</span></span>
              <span className={`font-bold tabular-nums ${x.amount_cents < 0 ? "text-ink3" : "text-brand-deep"}`}>{x.amount_cents < 0 ? "−" : "+"}{money(Math.abs(x.amount_cents))}</span></li>))}</ul> : <p className="text-ink3">Your savings will show up here.</p>}
        </section>
      </div>
    </div>
  );
}
