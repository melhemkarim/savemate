"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { forgotPassword } from "../actions";
import { AuthShell, Feedback } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";

export default function ForgotPage() {
  const [state, action] = useFormState(forgotPassword, undefined);
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to choose a new one." footer={<Link className="font-semibold text-brand-deep underline" href="/login">Back to log in</Link>}>
      <form action={action} className="grid gap-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
        <Feedback state={state} />
        <SubmitButton className="btn btn-dark w-full" pendingText="Sending…">Send reset link</SubmitButton>
      </form>
    </AuthShell>
  );
}
