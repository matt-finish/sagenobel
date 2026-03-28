import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getUser().
  // A simple mistake could lead to very hard-to-debug issues.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes - redirect to login if not authenticated
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check if admin user needs TOTP verification
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, totp_verified")
      .eq("id", user.id)
      .single();

    if (profile?.is_admin) {
      const { data: factors } =
        await supabase.auth.mfa.listFactors();

      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        // Admin has no TOTP factor enrolled — force setup
        if (pathname !== "/setup-totp") {
          const url = request.nextUrl.clone();
          url.pathname = "/setup-totp";
          return NextResponse.redirect(url);
        }
      } else if (totpFactor.status === "verified") {
        // TOTP is enrolled, check if current session is AAL2
        const { data: aal } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (
          aal?.currentLevel !== "aal2" &&
          pathname !== "/verify-totp"
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/verify-totp";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
