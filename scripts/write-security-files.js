// Bu script next.config.ts dosyasını yazar
const fs = require('fs');
const path = require('path');

const projectDir = '/Users/eminkayaci07/Desktop/PROJELERİM/KuryeAppBeta-Version.0.0.1';

// next.config.ts
const nextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mgjwlfyxfxmfappwputi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Güvenlik Başlıkları - Penetrasyon testi bulgularına göre
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://mgjwlfyxfxmfappwputi.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://mgjwlfyxfxmfappwputi.supabase.co wss://mgjwlfyxfxmfappwputi.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
`;

fs.writeFileSync(path.join(projectDir, 'next.config.ts'), nextConfig, 'utf-8');
console.log('✅ next.config.ts yazıldı');

// middleware.ts - Rate Limiting + Auth koruması
const middleware = `import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// RATE LIMITING - IP bazlı (in-memory, edge-compatible)
// ============================================================
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const MAX_AUTH_REQUESTS = 5; // Dakikada max 5 auth isteği
const MAX_API_REQUESTS = 30; // Dakikada max 30 API isteği

function getRateLimitKey(ip: string, prefix: string): string {
  return \`\${prefix}:\${ip}\`;
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
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now - entry.lastReset > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(key);
      }
    }
  };
  // Her 5 dakikada temizle
  setInterval(cleanup, 5 * 60 * 1000);
}

export async function middleware(request: NextRequest) {
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
  // RATE LIMITING - Auth endpoint'leri için sıkı kontrol
  // ============================================================
  const isAuthRoute =
    pathname.startsWith("/giris") ||
    pathname.startsWith("/kayit-ol") ||
    pathname.startsWith("/sifre-sifirla") ||
    pathname.startsWith("/sifremi-unuttum");

  if (isAuthRoute && isRateLimited(ip, "auth", MAX_AUTH_REQUESTS)) {
    return new NextResponse(
      JSON.stringify({
        error: "Çok fazla deneme. Lütfen 1 dakika sonra tekrar deneyin.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
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
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  // ============================================================
  // SUPABASE AUTH - Session yönetimi
  // ============================================================
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

  // Session'ı yenile (CSRF token rotation)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Korumalı route'lar - giriş yapmamış kullanıcıları yönlendir
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

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/giris";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Giriş yapmış kullanıcıyı auth sayfalarından yönlendir
  if (isAuthRoute && user) {
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
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
`;

fs.writeFileSync(path.join(projectDir, 'middleware.ts'), middleware, 'utf-8');
console.log('✅ middleware.ts yazıldı (Rate Limiting + Auth koruması)');

// lib/supabaseAdmin.ts - Server-side admin client (güvenli)
const supabaseAdmin = `import { createClient } from "@supabase/supabase-js";

// Service role client - SADECE server-side'da kullanılmalı
// Bu client RLS'yi bypass eder, dikkatli kullanın
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase service role ortam değişkenleri eksik.");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
`;

fs.writeFileSync(path.join(projectDir, 'lib', 'supabaseAdmin.ts'), supabaseAdmin, 'utf-8');
console.log('✅ lib/supabaseAdmin.ts yazıldı');

// app/api/storage/signed-url/route.ts - Signed URL endpoint
const signedUrlDir = path.join(projectDir, 'app', 'api', 'storage', 'signed-url');
fs.mkdirSync(signedUrlDir, { recursive: true });

const signedUrlRoute = `import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Signed URL endpoint - documents bucket'ındaki dosyalara güvenli erişim
// Dosyalar artık public değil, bu endpoint üzerinden zamanlı URL üretilir
export async function POST(request: NextRequest) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Kullanıcı doğrula
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component
          }
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { path: filePath } = await request.json();
    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json({ error: "Dosya yolu gerekli" }, { status: 400 });
    }

    // Güvenlik: Kullanıcı sadece kendi dosyalarına erişebilir
    // Dosya isimleri: sabka_USER_ID_TIMESTAMP.png formatında
    if (!filePath.includes(user.id)) {
      return NextResponse.json({ error: "Bu dosyaya erişim yetkiniz yok" }, { status: 403 });
    }

    // Service role ile signed URL oluştur
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(filePath, 300); // 5 dakika geçerli

    if (error) {
      return NextResponse.json({ error: "URL oluşturulamadı" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
`;

fs.writeFileSync(path.join(signedUrlDir, 'route.ts'), signedUrlRoute, 'utf-8');
console.log('✅ app/api/storage/signed-url/route.ts yazıldı');

console.log('\n🎉 Tüm dosyalar başarıyla oluşturuldu!');
