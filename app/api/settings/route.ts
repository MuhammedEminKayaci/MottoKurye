import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "key parametresi gerekli" }, { status: 400 });
  }

  // Güvenlik: Sadece public olarak okunabilecek ayarları döndür
  const publicKeys = ["email_verification_enabled"];
  if (!publicKeys.includes(key)) {
    return NextResponse.json({ error: "Bu ayar herkese açık değil" }, { status: 403 });
  }

  const { data, error } = await db
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    // Tablo yoksa veya kayıt bulunamazsa varsayılan değer döndür
    if (error.code === "PGRST116" || error.code === "42P01") {
      return NextResponse.json({ key, value: "true" });
    }
    return NextResponse.json({ error: "Ayar okunamadı" }, { status: 500 });
  }

  return NextResponse.json({ key, value: data.value });
}
