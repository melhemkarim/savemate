"use client";
import { useFormState } from "react-dom";
import { resetPassword } from "../actions";
import { AuthShell, Feedback } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";

export default function ResetPage() {
  const [state, action] = useFormState(resetPassword, undefined);
  return (
    <AuthShell title="Choose a new password">
      <form action={action} className="grid gap-4">
        <div><label className="label" htmlFor="password">New password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" /></div>
        <Feedback state={state} />
        <SubmitButton className="btn btn-dark w-full" pendingText="Saving…">Update password</SubmitButton>
      </form>
    </AuthShell>
  );
}
