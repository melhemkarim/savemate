"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, CalendarDays, Trophy, Settings, Plus, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";

const items = [
  { href: "/dashboard", label: "Dashboard", short: "Home", Icon: LayoutDashboard },
  { href: "/goals", label: "My goals", short: "Goals", Icon: Target },
  { href: "/calendar", label: "Calendar", short: "Calendar", Icon: CalendarDays },
  { href: "/achievements", label: "Achievements", short: "Awards", Icon: Trophy },
  { href: "/settings", label: "Settings", short: "Settings", Icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const on = (h: string) => path === h || path.startsWith(h + "/");
  return (
    <>
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r-[1.5px] border-line bg-mint p-4 md:flex">
        <Link href="/dashboard" className="mb-5 mt-1 px-2"><Image src="/logo.png" alt="SaveMate" width={130} height={38} priority /></Link>
        <Link href="/goals/new" className="btn btn-primary mb-3"><Plus size={18} aria-hidden /> New goal</Link>
        {items.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={on(href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium ${on(href) ? "bg-white font-semibold text-ink shadow-[inset_0_0_0_1.5px_#d3e5db]" : "text-ink2 hover:bg-white/70"}`}>
            <Icon size={18} aria-hidden /> {label}
          </Link>
        ))}
        <form action={logout} className="mt-auto">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink2 hover:bg-white/70"><LogOut size={18} aria-hidden /> Log out</button>
        </form>
      </aside>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t-[1.5px] border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {items.flatMap(({ href, short, Icon }, i) => {
          const link = (
            <Link key={href} href={href} aria-current={on(href) ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 text-xs font-semibold ${on(href) ? "text-ink" : "text-ink3"}`}>
              <Icon size={22} aria-hidden /> {short}
            </Link>
          );
          return i === 2
            ? [<Link key="new" href="/goals/new" aria-label="New goal" className="-mt-6 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-ink shadow-lg"><Plus size={26} /></Link>, link]
            : [link];
        })}
      </nav>
    </>
  );
}
