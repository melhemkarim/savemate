import { getSession } from "@/lib/session";
import { achievements } from "@/lib/achievements";
import type { Goal, Tx } from "@/lib/types";

export default async function AchievementsPage() {
  const { supabase, profile } = await getSession();
  const [{ data: g }, { data: t }] = await Promise.all([
    supabase.from("goal_progress").select("*"),
    supabase.from("transactions").select("kind,amount_cents,occurred_on").order("occurred_on", { ascending: false }),
  ]);
  const list = achievements((g ?? []) as Goal[], (t ?? []) as Pick<Tx, "kind" | "amount_cents" | "occurred_on">[], profile.currency);
  const earned = list.filter((a) => a.earned).length;
  return (
    <div className="grid gap-6">
      <header><h1 className="text-3xl font-extrabold">Achievements</h1>
        <p className="mt-1 text-ink2">{earned} of {list.length} earned. Every one starts with a small saving.</p></header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <li key={a.id} className={`card flex items-start gap-3 ${a.earned ? "border-brand-mid bg-mint" : "border-dashed"}`}>
            <span className="text-3xl" aria-hidden>{a.earned ? a.icon : "🔒"}</span>
            <div><h2 className="text-base font-bold">{a.title}</h2><p className="text-sm text-ink2">{a.desc}</p>
              <p className={`mt-1 text-sm font-semibold ${a.earned ? "text-brand-deep" : "text-ink3"}`}>{a.earned ? "Earned" : "Not yet"}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
