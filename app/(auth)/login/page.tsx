"use client";
import Link from "next/link";
import { useFormState } from "react-dom";
import { login } from "../actions";
import { AuthShell, Feedback } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, action] = useFormState(login, undefined);
  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your goals." footer={<>New here? <Link className="font-semibold text-brand-deep underline" href="/signup">Create an account</Link></>}>
      <form action={action} className="grid gap-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="input" /></div>
        <Feedback state={state} />
        <SubmitButton className="btn btn-dark w-full" pendingText="Logging in…">Log in</SubmitButton>
        <Link href="/forgot-password" className="text-center text-sm font-semibold text-brand-deep underline">Forgot your password?</Link>
      </form>
    </AuthShell>
  );
}
