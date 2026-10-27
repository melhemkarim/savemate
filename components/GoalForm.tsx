"use client";
import { useFormState } from "react-dom";
import { createGoal, updateGoal } from "@/app/(app)/actions";
import { MODES } from "@/lib/plans";
import type { Goal } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

const ICONS = ["🎯", "💻", "📱", "✈️", "🚗", "🛟", "🏠", "🎓", "🎁", "🎮"];

export function GoalForm({ goal, defaultDate }: { goal?: Goal; defaultDate: string }) {
  const [state, action] = useFormState(goal ? updateGoal : createGoal, undefined);
  return (
    <form action={action} className="card grid max-w-2xl gap-5">
      {goal && <input type="hidden" name="id" value={goal.id} />}
      <fieldset><legend className="label">Icon</legend>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((i) => (
            <label key={i} className="cursor-pointer">
              <input type="radio" name="icon" value={i} defaultChecked={(goal?.icon ?? "🎯") === i} className="peer sr-only" />
              <span className="grid h-11 w-11 place-items-center rounded-xl border-[1.5px] border-line text-xl peer-checked:border-ink peer-checked:bg-mint2 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-brand-deep">{i}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div><label className="label" htmlFor="name">Goal name</label><input id="name" name="name" required maxLength={80} defaultValue={goal?.name} placeholder="New laptop" className="input" /></div>
      <div><label className="label" htmlFor="description">Description (optional)</label><textarea id="description" name="description" maxLength={300} rows={2} defaultValue={goal?.description ?? ""} className="input py-2" /></div>
      <div className={`grid gap-4 ${goal ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <div><label className="label" htmlFor="target">Target amount</label><input id="target" name="target" required inputMode="decimal" defaultValue={goal ? (goal.target_cents / 100).toFixed(2) : ""} placeholder="1200" className="input" /></div>
        {!goal && <div><label className="label" htmlFor="saved">Saved so far</label><input id="saved" name="saved" inputMode="decimal" placeholder="0" className="input" /></div>}
        <div><label className="label" htmlFor="date">Target date</label><input id="date" name="date" type="date" required defaultValue={goal?.target_date ?? defaultDate} className="input" /></div>
      </div>
      {!goal && (
        <fieldset><legend className="label">Saving pace (you can change it any time)</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODES.map((m) => (
              <label key={m.id} className="cursor-pointer">
                <input type="radio" name="mode" value={m.id} defaultChecked={m.id === "balanced"} className="peer sr-only" />
                <span className="block rounded-xl border-[1.5px] border-line p-3 peer-checked:border-ink peer-checked:shadow-[0_0_0_3px_rgba(2,223,113,.4)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-brand-deep">
                  <b>{m.name}</b><span className="block text-sm text-ink3">{m.blurb}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{goal ? "Save changes" : "Create goal"}</SubmitButton>
        {state?.error && <p role="alert" className="msg-err">{state.error}</p>}
      </div>
    </form>
  );
}
