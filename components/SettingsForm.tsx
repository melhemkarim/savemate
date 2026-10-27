"use client";
import { useFormState } from "react-dom";
import { updateProfile } from "@/app/(app)/actions";
import { CURRENCIES } from "@/lib/money";
import type { Profile } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";
import { Feedback } from "./AuthShell";

export function SettingsForm({ profile, email, zones }: { profile: Profile; email: string; zones: string[] }) {
  const [state, action] = useFormState(updateProfile, undefined);
  return (
    <form action={action} className="card grid max-w-xl gap-4">
      <div><label className="label" htmlFor="email">Email</label><input id="email" value={email} readOnly className="input bg-mint" /></div>
      <div><label className="label" htmlFor="display_name">First name</label><input id="display_name" name="display_name" maxLength={60} defaultValue={profile.display_name ?? ""} className="input" /></div>
      <div><label className="label" htmlFor="currency">Currency</label>
        <select id="currency" name="currency" defaultValue={profile.currency} className="input">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className="label" htmlFor="timezone">Time zone</label>
        <input id="timezone" name="timezone" list="zones" defaultValue={profile.timezone} className="input" />
        <datalist id="zones">{zones.map((z) => <option key={z} value={z} />)}</datalist>
        <p className="mt-1 text-sm text-ink3">Used to decide what counts as &quot;today&quot; for your streak.</p></div>
      <Feedback state={state} />
      <div><SubmitButton>Save settings</SubmitButton></div>
    </form>
  );
}
