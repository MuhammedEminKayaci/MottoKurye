import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Supabase auth callback handler
// Email doğrulama linkine tıklandığında buraya yönlendirilir
// PKCE code exchange yapılır ve kullanıcı uygun sayfaya yönlendirilir
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const role = requestUrl.searchParams.get("role");
  const next = requestUrl.searchParams.get("next") || "/kayit-ol";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // Server Component'te set edilemez
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Başarılı doğrulama — kullanıcıyı profil tamamlama sayfasına yönlendir
      const redirectPath = role
        ? `/kayit-ol?role=${role}`
        : next;
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }
  }

  // Hata durumunda giriş sayfasına yönlendir
  return NextResponse.redirect(
    new URL("/giris?error=email-dogrulama-basarisiz", requestUrl.origin)
  );
}
