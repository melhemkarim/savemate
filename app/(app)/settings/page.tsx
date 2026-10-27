import { getSession } from "@/lib/session";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const { profile, user } = await getSession();
  const zones = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? ["UTC"];
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">Settings</h1>
      <SettingsForm profile={profile} email={user.email ?? ""} zones={zones} />
    </div>
  );
}
