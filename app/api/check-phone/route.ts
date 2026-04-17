import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getRateLimitKey(req);
    if (!rateLimit(`check-phone:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: "Çok fazla istek. Lütfen 1 dakika bekleyin." }, { status: 429 });
    }

    const { phone } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Telefon numarası gerekli." }, { status: 400 });
    }

    const cleaned = phone.replace(/\D/g, "");
    const candidates = Array.from(new Set([phone, cleaned].filter(Boolean)));
    if (candidates.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const [courierResult, businessResult] = await Promise.all([
      supabaseAdmin.from("couriers").select("id").in("phone", candidates).limit(1),
      supabaseAdmin.from("businesses").select("id").in("manager_contact", candidates).limit(1),
    ]);

    if (courierResult.error) throw courierResult.error;
    if (businessResult.error) throw businessResult.error;

    const exists =
      (courierResult.data && courierResult.data.length > 0) ||
      (businessResult.data && businessResult.data.length > 0);

    return NextResponse.json({ exists });
  } catch (err: any) {
    console.error("Phone check error:", err);
    return NextResponse.json({ error: "Telefon kontrolü başarısız." }, { status: 500 });
  }
}
