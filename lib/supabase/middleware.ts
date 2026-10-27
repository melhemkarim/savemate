import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRIVATE = ["/dashboard", "/goals", "/calendar", "/achievements", "/settings"];
const AUTH_ONLY = ["/login", "/signup", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response; // not configured yet: landing page shows setup help

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const redirect = (to: string) => { const u = request.nextUrl.clone(); u.pathname = to; u.search = ""; return NextResponse.redirect(u); };

  if (!user && PRIVATE.some((p) => path === p || path.startsWith(p + "/"))) return redirect("/login");
  if (user && AUTH_ONLY.includes(path)) return redirect("/dashboard");
  return response;
}
