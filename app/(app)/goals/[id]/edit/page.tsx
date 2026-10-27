import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import type { Goal } from "@/lib/types";
import { GoalForm } from "@/components/GoalForm";

export default async function EditGoal({ params }: { params: { id: string } }) {
  const { supabase } = await getSession();
  const { data } = await supabase.from("goal_progress").select("*").eq("id", params.id).single();
  if (!data) notFound();
  return (<div><h1 className="mb-6 text-3xl font-extrabold">Edit goal</h1><GoalForm goal={data as Goal} defaultDate="" /></div>);
}
