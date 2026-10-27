import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (configured) {
    const { data: { user } } = await createClient().auth.getUser();
    if (user) redirect("/dashboard");
  }
  return (
    <main>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Image src="/logo.png" alt="SaveMate" width={130} height={38} priority />
        <div className="flex gap-2"><Link href="/login" className="btn btn-ghost">Log in</Link><Link href="/signup" className="btn btn-primary">Start saving</Link></div>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:pt-20">
        {!configured && <p className="msg-err mb-8">Setup needed: copy <code>.env.example</code> to <code>.env.local</code> and add your Supabase URL and anon key.</p>}
        <h1 className="max-w-3xl text-5xl font-extrabold leading-none sm:text-7xl">Save smarter. Reach sooner.</h1>
        <p className="mt-6 max-w-xl text-xl text-ink2">Turn the thing you want into a daily amount you can actually manage. Pick a goal, choose your pace, and log what you save in seconds.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="btn btn-dark">Create free account</Link><Link href="/login" className="btn btn-ghost">Log in</Link></div>
        <p className="mt-6 max-w-md text-sm text-ink3">SaveMate tracks your savings. It never connects to your bank or moves your money.</p>
      </section>
    </main>
  );
}
