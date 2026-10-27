"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { parseToCents, formatMoney, CURRENCIES } from "@/lib/money";
import { MODES, addDaysISO, todayISO } from "@/lib/plans";
import type { FormState, Goal, Mode, Status } from "@/lib/types";

const ICONS = ["🎯", "💻", "📱", "✈️", "🚗", "🛟", "🏠", "🎓", "🎁", "🎮"];
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const refresh = () => revalidatePath("/", "layout");

function readGoalFields(fd: FormData) {
  const name = str(fd, "name"), description = str(fd, "description"), date = str(fd, "date");
  const icon = ICONS.includes(str(fd, "icon")) ? str(fd, "icon") : "🎯";
  const target = parseToCents(str(fd, "target"));
  if (!name || name.length > 80) return { error: "Give your goal a name (up to 80 characters)." } as const;
  if (description.length > 300) return { error: "Keep the description under 300 characters." } as const;
  if (target === null) return { error: "Enter a target amount above zero, like 1200 or 1200.50." } as const;
  if (!isDate(date)) return { error: "Pick a target date." } as const;
  return { name, description: description || null, icon, target, date } as const;
}

export async function createGoal(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, profile } = await getSession();
  const f = readGoalFields(fd);
  if ("error" in f) return { error: f.error };
  const today = todayISO(profile.timezone);
  if (f.date < today) return { error: "Pick a target date that's today or later." };
  const savedRaw = str(fd, "saved");
  const saved = savedRaw === "" || savedRaw === "0" ? 0 : parseToCents(savedRaw);
  if (saved === null) return { error: "Saved so far should be an amount like 150 or 150.25." };
  if (saved >= f.target) return { error: "Saved so far should be less than the target." };
  const mode = MODES.some((m) => m.id === str(fd, "mode")) ? (str(fd, "mode") as Mode) : "balanced";

  const { data, error } = await supabase.from("goals")
    .insert({ name: f.name, description: f.description, icon: f.icon, target_cents: f.target, target_date: f.date, mode })
    .select("id").single();
  if (error || !data) return { error: "Couldn't create the goal. Please try again." };
  if (saved > 0) {
    const { error: e2 } = await supabase.from("transactions")
      .insert({ goal_id: data.id, amount_cents: saved, kind: "contribution", note: "Starting balance", occurred_on: today });
    if (e2) return { error: "The goal was created, but the starting balance couldn't be saved." };
  }
  refresh();
  redirect(`/goals/${data.id}`);
}

export async function updateGoal(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await getSession();
  const id = str(fd, "id");
  const f = readGoalFields(fd);
  if ("error" in f) return { error: f.error };
  const { error } = await supabase.from("goals")
    .update({ name: f.name, description: f.description, icon: f.icon, target_cents: f.target, target_date: f.date }).eq("id", id);
  if (error) return { error: "Couldn't save your changes. Please try again." };
  refresh();
  redirect(`/goals/${id}`);
}

export async function setStatus(fd: FormData): Promise<void> {
  const { supabase } = await getSession();
  const status = str(fd, "status") as Status;
  if (!["active", "paused", "completed"].includes(status)) throw new Error("Invalid status.");
  const { error } = await supabase.from("goals")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null }).eq("id", str(fd, "id"));
  if (error) throw new Error("Couldn't update the goal.");
  refresh();
}

export async function changeMode(fd: FormData): Promise<void> {
  const { supabase } = await getSession();
  const mode = str(fd, "mode");
  if (!MODES.some((m) => m.id === mode)) throw new Error("Invalid pace.");
  const { error } = await supabase.from("goals").update({ mode }).eq("id", str(fd, "id"));
  if (error) throw new Error("Couldn't change the pace.");
  refresh();
}

export async function deleteGoal(fd: FormData): Promise<void> {
  const { supabase } = await getSession();
  const { error } = await supabase.from("goals").delete().eq("id", str(fd, "id"));
  if (error) throw new Error("Couldn't delete the goal.");
  refresh();
  redirect("/goals");
}

export async function addContribution(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, profile } = await getSession();
  const amount = parseToCents(str(fd, "amount"));
  const note = str(fd, "note");
  if (amount === null) return { error: "Enter an amount above zero, like 10 or 10.50." };
  if (note.length > 200) return { error: "Keep the note under 200 characters." };
  const { data } = await supabase.from("goal_progress").select("*").eq("id", str(fd, "goal_id")).single();
  const goal = data as Goal | null;
  if (!goal) return { error: "Pick a goal to save toward." };
  if (goal.status !== "active") return { error: `This goal is ${goal.status}. Set it to active to add savings.` };

  const today = todayISO(profile.timezone), d = str(fd, "date");
  const when = isDate(d) && d <= today && d >= addDaysISO(today, -7) ? d : today; // catch-up allowed for the last 7 days
  const { error } = await supabase.from("transactions").insert({
    goal_id: goal.id, amount_cents: amount, kind: "contribution", note: note || null, occurred_on: when,
  });
  if (error) return { error: "Couldn't save that. Please try again." };
  if (goal.saved_cents + amount >= goal.target_cents) {
    await supabase.from("goals").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", goal.id);
  }
  refresh();
  return { ok: `Added ${formatMoney(amount, profile.currency)} to ${goal.name}.` };
}

export async function reverseTransaction(fd: FormData): Promise<void> {
  const { supabase } = await getSession();
  const id = str(fd, "id");
  const { data: tx } = await supabase.from("transactions").select("goal_id").eq("id", id).single();
  const { error } = await supabase.rpc("reverse_transaction", { p_id: id });
  if (error) throw new Error("That entry was already corrected or can't be found.");
  if (tx) {
    const { data } = await supabase.from("goal_progress").select("*").eq("id", tx.goal_id).single();
    const g = data as Goal | null;
    if (g && g.status === "completed" && g.saved_cents < g.target_cents) {
      await supabase.from("goals").update({ status: "active", completed_at: null }).eq("id", g.id);
    }
  }
  refresh();
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, user } = await getSession();
  const name = str(fd, "display_name").slice(0, 60);
  const currency = str(fd, "currency");
  const timezone = str(fd, "timezone") || "UTC";
  if (!(CURRENCIES as readonly string[]).includes(currency)) return { error: "Choose a currency from the list." };
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { return { error: "That time zone isn't recognized. Pick one from the list." }; }
  const { error } = await supabase.from("profiles").update({ display_name: name || null, currency, timezone }).eq("id", user.id);
  if (error) return { error: "Couldn't save your settings. Please try again." };
  refresh();
  return { ok: "Settings saved." };
}
