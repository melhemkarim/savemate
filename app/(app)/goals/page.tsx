import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import { todayISO } from "@/lib/plans";
import type { Goal } from "@/lib/types";
import { GoalCard } from "@/components/GoalCard";

const TABS = [{ id: "active", label: "Active" }, { id: "paused", label: "Paused" }, { id: "completed", label: "Completed" }];

export default async function GoalsPage({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase, profile } = await getSession();
  const status = TABS.some((t) => t.id === searchParams.status) ? searchParams.status! : "active";
  const { data } = await supabase.from("goal_progress").select("*").eq("status", status).order("target_date");
  const goals = (data ?? []) as Goal[];
  const today = todayISO(profile.timezone);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">My goals</h1>
        <Link href="/goals/new" className="btn btn-primary"><Plus size={18} aria-hidden /> New goal</Link></div>
      <nav className="mt-5 flex gap-2" aria-label="Goal status">
        {TABS.map((t) => <Link key={t.id} href={`/goals?status=${t.id}`} aria-current={t.id === status ? "page" : undefined}
          className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-semibold ${t.id === status ? "border-ink bg-ink text-white" : "border-line hover:bg-mint"}`}>{t.label}</Link>)}
      </nav>
      {goals.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{goals.map((g) => <GoalCard key={g.id} goal={g} currency={profile.currency} today={today} />)}</div>
        : <div className="card mt-6 max-w-lg text-center"><p className="text-ink2">{status === "active" ? "No active goals yet. Create one to get started." : `No ${status} goals.`}</p>
          {status === "active" && <Link href="/goals/new" className="btn btn-primary mt-4">Create a goal</Link>}</div>}
    </div>
  );
}
