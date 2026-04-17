import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for Server Components and API routes
// Cookie tabanlı auth yönetimi ile middleware ile uyumlu çalışır
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase ortam değişkenleri eksik. .env.local dosyasını kontrol edin.");
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
          // Server Component'te set edilemez, sorun değil
        }
      },
    },
  });
}

// Not: Eski `supabaseServer` singleton export'u kaldırıldı.
// Cookie tabanlı auth için her zaman `createSupabaseServerClient()` kullanın.
