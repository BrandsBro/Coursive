import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some(r => pathname.startsWith(r));

  // Not logged in → redirect to login
  if (!session && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but trying to access auth pages → go home
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin routes → check is_admin in profiles
  if (session && isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
