import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body: { email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { email, password, role } = body;

  if (
    !email ||
    !password ||
    !role ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    return NextResponse.json({ error: "email, password ve role gerekli" }, { status: 400 });
  }

  // Rol doğrulama
  if (role !== "kurye" && role !== "isletme") {
    return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
  }

  // Şifre uzunluk kontrolü
  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır" }, { status: 400 });
  }

  // E-posta doğrulama ayarını kontrol et
  let emailVerificationEnabled = true;
  try {
    const { data: setting } = await db
      .from("system_settings")
      .select("value")
      .eq("key", "email_verification_enabled")
      .single();
    if (setting) {
      emailVerificationEnabled = setting.value === "true";
    }
  } catch {}

  // Admin API ile kullanıcı oluştur — email rate limit'e takılmaz
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: !emailVerificationEnabled,
    user_metadata: { role },
  });

  if (error) {
    const msg = (error.message || "").toLowerCase();

    if (msg.includes("already") || msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.", code: "USER_EXISTS" },
        { status: 409 }
      );
    }

    if (msg.includes("invalid") && msg.includes("email")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin.", code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Email doğrulama açıksa, doğrulama linki oluştur
  if (emailVerificationEnabled && data.user) {
    try {
      await db.auth.admin.generateLink({
        type: "signup",
        email,
        password,
      });
    } catch {
      // Link oluşturulamasa bile kullanıcı oluşturuldu, devam et
    }
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    emailVerificationEnabled,
  });
}
