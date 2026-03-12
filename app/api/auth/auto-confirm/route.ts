import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Bu endpoint kayıt sonrası e-posta doğrulaması kapalıyken
// kullanıcının email_confirmed_at alanını otomatik doldurmak için kullanılır
export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Önce e-posta doğrulama ayarını kontrol et
  const { data: setting } = await db
    .from("system_settings")
    .select("value")
    .eq("key", "email_verification_enabled")
    .single();

  // Eğer doğrulama açıksa bu endpoint çalışmamalı
  if (!setting || setting.value === "true") {
    return NextResponse.json({ error: "E-posta doğrulama aktif" }, { status: 403 });
  }

  const body = await req.json();
  const { userId } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId gerekli" }, { status: 400 });
  }

  // Kullanıcının email_confirmed_at alanını güncelle
  const { error } = await db.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    console.error("Auto-confirm error:", error);
    return NextResponse.json({ error: "Kullanıcı doğrulanamadı" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
