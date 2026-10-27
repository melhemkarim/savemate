import { getSession } from "@/lib/session";
import { addDaysISO, todayISO } from "@/lib/plans";
import { GoalForm } from "@/components/GoalForm";

export default async function NewGoal() {
  const { profile } = await getSession();
  return (<div><h1 className="mb-6 text-3xl font-extrabold">New goal</h1><GoalForm defaultDate={addDaysISO(todayISO(profile.timezone), 90)} /></div>);
}
