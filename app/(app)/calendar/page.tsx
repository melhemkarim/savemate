import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { formatDate, todayISO } from "@/lib/plans";
import { netByDay } from "@/lib/stats";
import type { Goal, Tx } from "@/lib/types";

const shift = (m: string, n: number) => { const [y, mo] = m.split("-").map(Number); return new Date(Date.UTC(y, mo - 1 + n, 1)).toISOString().slice(0, 7); };

export default async function CalendarPage({ searchParams }: { searchParams: { m?: string } }) {
  const { supabase, profile } = await getSession();
  const today = todayISO(profile.timezone);
  const m = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.m ?? "") ? searchParams.m! : today.slice(0, 7);
  const [y, mo] = m.split("-").map(Number);
  const count = new Date(Date.UTC(y, mo, 0)).getUTCDate(), lead = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay();
  const days = Array.from({ length: count }, (_, i) => `${m}-${String(i + 1).padStart(2, "0")}`);
  const [{ data: t }, { data: g }] = await Promise.all([
    supabase.from("transactions").select("*").gte("occurred_on", days[0]).lte("occurred_on", days[count - 1]),
    supabase.from("goal_progress").select("*").gte("target_date", days[0]).lte("target_date", days[count - 1]).neq("status", "completed"),
  ]);
  const byDay = netByDay((t ?? []) as Tx[]);
  const due = new Map<string, Goal[]>();
  for (const x of (g ?? []) as Goal[]) due.set(x.target_date, [...(due.get(x.target_date) ?? []), x]);
  const money = (c: number) => formatMoney(c, profile.currency);
  const saved = days.filter((d) => (byDay.get(d) ?? 0) > 0).length;
  const total = days.reduce((s, d) => s + Math.max(0, byDay.get(d) ?? 0), 0);

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold">{formatDate(days[0], { month: "long", year: "numeric" })}</h1>
          <p className="mt-1 text-ink2">{saved} day{saved === 1 ? "" : "s"} with savings · {money(total)} saved</p></div>
        <nav aria-label="Month" className="flex items-center gap-2">
          <Link href={`/calendar?m=${shift(m, -1)}`} aria-label="Previous month" className="btn btn-ghost px-3"><ChevronLeft size={18} /></Link>
          <Link href="/calendar" className="btn btn-ghost">Today</Link>
          <Link href={`/calendar?m=${shift(m, 1)}`} aria-label="Next month" className="btn btn-ghost px-3"><ChevronRight size={18} /></Link>
        </nav>
      </header>
      <section className="card p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink3 sm:gap-2" aria-hidden>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <ol className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: lead }, (_, i) => <li key={`b${i}`} aria-hidden />)}
          {days.map((d) => {
            const c = Math.max(0, byDay.get(d) ?? 0), dueHere = due.get(d) ?? [];
            const label = `${formatDate(d, { weekday: "long", month: "long", day: "numeric" })}: ${c ? `${money(c)} saved` : "nothing saved"}${dueHere.length ? `. Due: ${dueHere.map((x) => x.name).join(", ")}` : ""}`;
            return (
              <li key={d} aria-label={label} aria-current={d === today ? "date" : undefined}
                className={`flex min-h-[58px] flex-col rounded-xl border-[1.5px] p-1.5 text-xs sm:min-h-[88px] sm:p-2 ${c ? "border-brand-mid bg-mint2" : "border-line"} ${d === today ? "ring-2 ring-ink" : ""}`}>
                <span className="font-bold">{Number(d.slice(8))}</span>
                {dueHere.length > 0 && <span className="truncate">🏁<span className="hidden sm:inline"> {dueHere[0].name}</span></span>}
                {c > 0 && <><span className="mt-auto h-2 w-2 rounded-full bg-brand-mid sm:hidden" /><span className="mt-auto hidden font-semibold tabular-nums text-brand-deep sm:block">{money(c)}</span></>}
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-sm text-ink3">Green days have savings. 🏁 marks a goal deadline. Empty days are fine.</p>
      </section>
    </div>
  );
}
