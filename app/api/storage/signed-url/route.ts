import { createServerClient } from "@supabase/ssr";
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
