import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_2FA_COOKIE } from "@/lib/admin/mfa-cookie";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always call getUser() to refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Helper: create a redirect that preserves session cookies
  function redirectTo(path: string, params?: Record<string, string>) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const response = NextResponse.redirect(url);
    // Copy all session cookies from the supabase response to the redirect
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    });
    return response;
  }

  // /login — let the page handle auth flow, don't redirect from middleware
  if (pathname === "/login") {
    return supabaseResponse;
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!user) {
      return redirectTo("/admin/login");
    }
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, totp_enabled")
      .eq("id", user.id)
      .single();

    // Pre-migration DBs may not have totp_enabled — fall back to id-only check
    if (profileError || !adminProfile) {
      const { data: fallback } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      if (!fallback) {
        return redirectTo("/admin/login");
      }
    } else if (adminProfile.totp_enabled) {
      const mfaCookie = request.cookies.get(ADMIN_2FA_COOKIE)?.value;
      if (mfaCookie !== user.id) {
        return redirectTo("/admin/login", { step: "2fa" });
      }
    }
  }

  // Protect portal routes — only redirect if NOT authenticated at all
  if (
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login")
  ) {
    if (!user) {
      return redirectTo("/login", { redirect: pathname });
    }
    // User is authenticated — let them through.
    // Portal pages check client_users access themselves.
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
