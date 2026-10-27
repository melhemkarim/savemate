"use client";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addContribution } from "@/app/(app)/actions";
import { SubmitButton } from "./SubmitButton";

export function ContributeForm({ goals, fixedGoalId, date, idp = "" }: { goals: { id: string; name: string }[]; fixedGoalId?: string; date?: string; idp?: string }) {
  const [state, action] = useFormState(addContribution, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3">
      {date && <input type="hidden" name="date" value={date} />}
      {fixedGoalId ? <input type="hidden" name="goal_id" value={fixedGoalId} /> : (
        <div><label className="label" htmlFor={`${idp}goal_id`}>Save toward</label>
          <select id={`${idp}goal_id`} name="goal_id" className="input" required>{goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor={`${idp}amount`}>Amount</label><input id={`${idp}amount`} name="amount" inputMode="decimal" placeholder="10.00" className="input" required /></div>
        <div><label className="label" htmlFor={`${idp}note`}>Note (optional)</label><input id={`${idp}note`} name="note" maxLength={200} className="input" /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>Add savings</SubmitButton>
        <p role="status" className={state?.error ? "msg-err" : state?.ok ? "msg-ok" : "sr-only"}>{state?.error ?? state?.ok ?? ""}</p>
      </div>
    </form>
  );
}
