import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// RATE LIMITING - IP bazlı (in-memory, edge-compatible)
// ============================================================
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const MAX_AUTH_REQUESTS = 15; // Dakikada max 15 auth POST isteği
const MAX_API_REQUESTS = 60; // Dakikada max 60 API isteği

function getRateLimitKey(ip: string, prefix: string): string {
  return `${prefix}:${ip}`;
}

function isRateLimited(ip: string, prefix: string, maxRequests: number): boolean {
  const key = getRateLimitKey(ip, prefix);
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

// Periyodik temizlik (memory leak önleme)
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    rateLimitMap.forEach((entry, key) => {
      if (now - entry.lastReset > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(key);
      }
    });
  };
  // Her 5 dakikada temizle
  setInterval(cleanup, 5 * 60 * 1000);
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // IP adresini al
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { pathname } = request.nextUrl;

  // ============================================================
  // RATE LIMITING - Sadece POST istekleri için (sayfa yüklemeleri hariç)
  // ============================================================
  const isAuthRoute =
    pathname.startsWith("/giris") ||
    pathname.startsWith("/kayit-ol") ||
    pathname.startsWith("/sifre-sifirla") ||
    pathname.startsWith("/sifremi-unuttum") ||
    pathname.startsWith("/email-dogrulama") ||
    pathname.startsWith("/auth/callback");

  const isPostRequest = request.method === "POST";

  if (isAuthRoute && isPostRequest && isRateLimited(ip, "auth", MAX_AUTH_REQUESTS)) {
    return new NextResponse(
      JSON.stringify({
        error: "Çok fazla deneme. Lütfen 1 dakika sonra tekrar deneyin.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": "60",
        },
      }
    );
  }

  // API rate limiting
  if (pathname.startsWith("/api") && isRateLimited(ip, "api", MAX_API_REQUESTS)) {
    return new NextResponse(
      JSON.stringify({ error: "İstek limiti aşıldı." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": "60",
        },
      }
    );
  }

  // ============================================================
  // SUPABASE AUTH - Session yönetimi
  // ============================================================

  // Korumalı route'lar
  const protectedRoutes = [
    "/profil",
    "/mesajlar",
    "/ilanlarim",
    "/kurye-bul",
    "/isletme-bul",
    "/ilanlar",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isLoginOnlyRoute =
    pathname.startsWith("/giris") ||
    pathname.startsWith("/sifremi-unuttum");

  // Auth kontrolü sadece gerekli rotalar için yapılır (performans)
  // Public sayfalar (/, /kayit-ol, /iletisim vb.) Supabase'e hiç istek atmaz
  const needsAuthCheck = isProtectedRoute || isLoginOnlyRoute;

  if (!needsAuthCheck) {
    return response;
  }

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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/giris";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Giriş yapmış kullanıcıyı sadece giris/sifremi-unuttum sayfalarından yönlendir
  if (isLoginOnlyRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Statik dosyaları hariç tut
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
