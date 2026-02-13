import { NextResponse, type NextRequest } from "next/server";

// Korumalı rotalar - sadece oturum açmış kullanıcılar erişebilir
const PROTECTED_ROUTES = [
  "/profil",
  "/mesajlar",
  "/ilanlarim",
  "/profil/duzenle",
];

// Auth sayfaları - zaten giriş yapmış kullanıcılar erişmemeli
const AUTH_ROUTES = ["/giris", "/kayit-ol", "/sifremi-unuttum"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase auth token'ı cookie'den oku
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // sb-<project_ref>-auth-token cookie'sinden session kontrol
  const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];
  const authCookieName = `sb-${projectRef}-auth-token`;
  const authCookie = request.cookies.get(authCookieName);

  const hasSession = !!authCookie?.value;

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Korumalı rotalar
    "/profil/:path*",
    "/mesajlar/:path*",
    "/ilanlarim/:path*",
    // Auth rotaları
    "/giris",
    "/kayit-ol",
    "/sifremi-unuttum",
  ],
};
