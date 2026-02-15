import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Korumalı rotalar - sadece oturum açmış kullanıcılar erişebilir
const PROTECTED_ROUTES = [
  "/profil",
  "/mesajlar",
  "/ilanlarim",
  "/profil/duzenle",
];

// Auth sayfaları - zaten giriş yapmış kullanıcılar erişmemeli
// Not: /kayit-ol dahil değil çünkü Google ile giriş yapan kullanıcıların profil oluşturması gerekebilir
const AUTH_ROUTES = ["/giris", "/sifremi-unuttum"];

export async function proxy(request: NextRequest) {
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

  // Session'ı yenile (token refresh) - ÖNEMLİ: getUser kullan, getSession değil
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const hasSession = !!user;

  // Korumalı sayfalara auth olmadan erişim engelle
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/giris", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Zaten giriş yapmış kullanıcıları auth sayfalarından yönlendir
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/profil", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Korumalı rotalar
    "/profil/:path*",
    "/mesajlar/:path*",
    "/ilanlarim/:path*",
    // Auth rotaları
    "/giris",
    "/sifremi-unuttum",
  ],
};
