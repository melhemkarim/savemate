import Image from "next/image";
import Link from "next/link";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-mint px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block"><Image src="/logo.png" alt="SaveMate" width={140} height={41} priority /></Link>
        <div className="card p-6 sm:p-8">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-ink2">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-ink2">{footer}</p>}
      </div>
    </main>
  );
}
export function Feedback({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state?.error && !state?.ok) return null;
  return <p role={state.error ? "alert" : "status"} className={state.error ? "msg-err" : "msg-ok"}>{state.error ?? state.ok}</p>;
}
