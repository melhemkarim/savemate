"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "../actions";
import { AuthShell, Feedback } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";

export default function SignupPage() {
  const [state, action] = useFormState(signup, undefined);
  const [tz, setTz] = useState("UTC");
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);
  return (
    <AuthShell title="Start saving" subtitle="Create your free account." footer={<>Already have an account? <Link className="font-semibold text-brand-deep underline" href="/login">Log in</Link></>}>
      <form action={action} className="grid gap-4">
        <input type="hidden" name="timezone" value={tz} />
        <div><label className="label" htmlFor="name">First name</label><input id="name" name="name" autoComplete="given-name" maxLength={60} className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" aria-describedby="pw-help" />
          <p id="pw-help" className="mt-1 text-sm text-ink3">At least 8 characters.</p></div>
        <Feedback state={state} />
        <SubmitButton className="btn btn-dark w-full" pendingText="Creating account…">Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
