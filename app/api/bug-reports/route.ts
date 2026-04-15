import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ADMIN_EMAILS = ["eminkayaci07@gmail.com"];

function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return null;
  return user;
}

// GET — Admin: Hata bildirimlerini listele
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    const db = getAdminClient();
    const { data, error } = await db
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Bug reports fetch error:", error);
      return NextResponse.json({ error: "Veriler alınamadı." }, { status: 500 });
    }

    return NextResponse.json({ reports: data });
  } catch (err) {
    console.error("Bug reports GET error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// PATCH — Admin: Durum güncelle
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

    const { id, status, adminNote } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "id ve status zorunlu." }, { status: 400 });

    const validStatuses = ["new", "reviewing", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
    }

    const db = getAdminClient();
    const updateData: Record<string, string> = { status, updated_at: new Date().toISOString() };
    if (typeof adminNote === "string") updateData.admin_note = adminNote;

    const { error } = await db.from("bug_reports").update(updateData).eq("id", id);
    if (error) {
      console.error("Bug report update error:", error);
      return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bug reports PATCH error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// POST — Hata bildirimi gönder (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    // Validasyon
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }
    if (typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 50) {
      return NextResponse.json({ error: "İsim 2-50 karakter olmalıdır." }, { status: 400 });
    }
    if (typeof lastName !== "string" || lastName.trim().length < 2 || lastName.trim().length > 50) {
      return NextResponse.json({ error: "Soyisim 2-50 karakter olmalıdır." }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
    }
    if (typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000) {
      return NextResponse.json({ error: "Hata açıklaması 10-2000 karakter olmalıdır." }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { error } = await supabase.from("bug_reports").insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    if (error) {
      console.error("Bug report insert error:", error);
      return NextResponse.json({ error: "Bildirim kaydedilemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bug report API error:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
