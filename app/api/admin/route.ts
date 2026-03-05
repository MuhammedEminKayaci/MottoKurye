import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Admin email listesi - sadece bu emailler admin paneline erişebilir
const ADMIN_EMAILS = [
  "eminkayaci07@gmail.com",
  // Yeni admin eklemek için buraya email ekleyin
];

async function verifyAdmin() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Admin API: SUPABASE_URL or ANON_KEY not set");
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Admin API: Auth error:", error.message);
    return null;
  }
  if (!user) {
    console.error("Admin API: No user found in session");
    return null;
  }
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    console.error("Admin API: User not in admin list:", user.email);
    return null;
  }
  return user;
}

function getAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set. Add it to Vercel Environment Variables.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Yetkisiz erişim. Lütfen admin olarak giriş yapın." }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const db = getAdminClient();

    switch (action) {
      case "dashboard": {
        // Genel istatistikler
        const [
          { count: courierCount },
          { count: businessCount },
          { count: conversationCount },
          { count: messageCount },
          { count: businessAdCount },
          { count: courierAdCount },
        ] = await Promise.all([
          db.from("couriers").select("*", { count: "exact", head: true }),
          db.from("businesses").select("*", { count: "exact", head: true }),
          db.from("conversations").select("*", { count: "exact", head: true }),
          db.from("messages").select("*", { count: "exact", head: true }),
          db.from("business_ads").select("*", { count: "exact", head: true }),
          db.from("courier_ads").select("*", { count: "exact", head: true }),
        ]);

        // Plan dağılımı
        const { data: planData } = await db.from("businesses").select("plan");
        const planDistribution = { free: 0, standard: 0, premium: 0 };
        (planData || []).forEach((b: any) => {
          const p = b.plan || "free";
          if (p in planDistribution) planDistribution[p as keyof typeof planDistribution]++;
        });

        // Son 7 günlük kayıt trendi
        const now = new Date();
        const registrationTrend: { date: string; couriers: number; businesses: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dayStart = d.toISOString().split("T")[0] + "T00:00:00";
          const dayEnd = d.toISOString().split("T")[0] + "T23:59:59";

          const [{ count: cCount }, { count: bCount }] = await Promise.all([
            db.from("couriers").select("*", { count: "exact", head: true })
              .gte("created_at", dayStart).lte("created_at", dayEnd),
            db.from("businesses").select("*", { count: "exact", head: true })
              .gte("created_at", dayStart).lte("created_at", dayEnd),
          ]);

          registrationTrend.push({
            date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
            couriers: cCount || 0,
            businesses: bCount || 0,
          });
        }

        // Son 7 günlük mesaj trendi
        const messageTrend: { date: string; messages: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dayStart = d.toISOString().split("T")[0] + "T00:00:00";
          const dayEnd = d.toISOString().split("T")[0] + "T23:59:59";

          const { count } = await db.from("messages").select("*", { count: "exact", head: true })
            .gte("created_at", dayStart).lte("created_at", dayEnd);

          messageTrend.push({
            date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
            messages: count || 0,
          });
        }

        // Sektör dağılımı
        const { data: sectorData } = await db.from("businesses").select("business_sector");
        const sectorMap: Record<string, number> = {};
        (sectorData || []).forEach((b: any) => {
          const s = b.business_sector || "Diğer";
          sectorMap[s] = (sectorMap[s] || 0) + 1;
        });
        const sectorDistribution = Object.entries(sectorMap)
          .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value, fullName: name }))
          .sort((a, b) => b.value - a.value);

        // İl bazlı dağılım
        const { data: courierProvinces } = await db.from("couriers").select("province");
        const { data: businessProvinces } = await db.from("businesses").select("province");
        const provinceMap: Record<string, { couriers: number; businesses: number }> = {};
        (courierProvinces || []).forEach((c: any) => {
          const p = c.province || "Belirtilmemiş";
          if (!provinceMap[p]) provinceMap[p] = { couriers: 0, businesses: 0 };
          provinceMap[p].couriers++;
        });
        (businessProvinces || []).forEach((b: any) => {
          const p = b.province || "Belirtilmemiş";
          if (!provinceMap[p]) provinceMap[p] = { couriers: 0, businesses: 0 };
          provinceMap[p].businesses++;
        });

        // Son 5 kayıt
        const { data: recentCouriers } = await db.from("couriers")
          .select("id, user_id, first_name, last_name, province, created_at, avatar_url")
          .order("created_at", { ascending: false }).limit(5);
        const { data: recentBusinesses } = await db.from("businesses")
          .select("id, user_id, business_name, business_sector, province, plan, created_at, avatar_url")
          .order("created_at", { ascending: false }).limit(5);

        return NextResponse.json({
          stats: {
            courierCount: courierCount || 0,
            businessCount: businessCount || 0,
            conversationCount: conversationCount || 0,
            messageCount: messageCount || 0,
            businessAdCount: businessAdCount || 0,
            courierAdCount: courierAdCount || 0,
          },
          planDistribution,
          registrationTrend,
          messageTrend,
          sectorDistribution,
          provinceMap,
          recentCouriers: recentCouriers || [],
          recentBusinesses: recentBusinesses || [],
        });
      }

      case "users": {
        const type = searchParams.get("type") || "couriers";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const offset = (page - 1) * limit;
        const search = (searchParams.get("search") || "").replace(/[%_\\]/g, "").slice(0, 100);

        if (type === "couriers") {
          let query = db.from("couriers")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,province.ilike.%${search}%`);
          }

          const { data, count } = await query;
          return NextResponse.json({ data: data || [], total: count || 0, page, limit });
        } else {
          let query = db.from("businesses")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (search) {
            query = query.or(`business_name.ilike.%${search}%,business_sector.ilike.%${search}%,province.ilike.%${search}%`);
          }

          const { data, count } = await query;
          return NextResponse.json({ data: data || [], total: count || 0, page, limit });
        }
      }

      case "messages": {
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const offset = (page - 1) * limit;
        const convId = searchParams.get("conversation_id");

        if (convId) {
          // Belirli bir konuşmanın mesajlarını getir
          const { data: msgs } = await db.from("messages")
            .select("*")
            .eq("conversation_id", convId)
            .order("created_at", { ascending: true });

          // Konuşma bilgisini al
          const { data: conv } = await db.from("conversations")
            .select("*")
            .eq("id", convId)
            .single();

          // Katılımcı bilgilerini al
          let businessInfo = null, courierInfo = null;
          if (conv) {
            const { data: biz } = await db.from("businesses")
              .select("business_name, business_sector, avatar_url, user_id")
              .eq("user_id", conv.business_id).single();
            const { data: cur } = await db.from("couriers")
              .select("first_name, last_name, avatar_url, user_id")
              .eq("user_id", conv.courier_id).single();
            businessInfo = biz;
            courierInfo = cur;
          }

          return NextResponse.json({
            messages: msgs || [],
            conversation: conv,
            businessInfo,
            courierInfo,
          });
        }

        // Tüm konuşmaları listele
        const { data: conversations, count } = await db.from("conversations")
          .select("*", { count: "exact" })
          .order("updated_at", { ascending: false })
          .range(offset, offset + limit - 1);

        // Her konuşma için katılımcı adlarını çek
        const enriched = await Promise.all((conversations || []).map(async (conv: any) => {
          const [{ data: biz }, { data: cur }, { count: msgCount }, { count: unreadCount }] = await Promise.all([
            db.from("businesses").select("business_name, avatar_url").eq("user_id", conv.business_id).single(),
            db.from("couriers").select("first_name, last_name, avatar_url").eq("user_id", conv.courier_id).single(),
            db.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id),
            db.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("is_read", false),
          ]);

          return {
            ...conv,
            business_name: biz?.business_name || "Bilinmiyor",
            business_avatar: biz?.avatar_url,
            courier_name: cur ? `${cur.first_name || ""} ${cur.last_name || ""}`.trim() : "Bilinmiyor",
            courier_avatar: cur?.avatar_url,
            message_count: msgCount || 0,
            unread_count: unreadCount || 0,
          };
        }));

        return NextResponse.json({ data: enriched, total: count || 0, page, limit });
      }

      case "listings": {
        const type = searchParams.get("type") || "business_ads";
        // Güvenlik: Sadece izin verilen tablo adlarını kabul et
        if (type !== "business_ads" && type !== "courier_ads") {
          return NextResponse.json({ error: "Geçersiz ilan tipi" }, { status: 400 });
        }
        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
        const limit = 20;
        const offset = (page - 1) * limit;

        const { data, count } = await db.from(type)
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        return NextResponse.json({ data: data || [], total: count || 0, page, limit });
      }

      case "system": {
        // Sistem sağlığı kontrolleri
        const { data: authUsers, error: authError } = await db.auth.admin.listUsers({ perPage: 1 });
        const totalAuthUsers = authUsers?.users?.length !== undefined ? (await db.auth.admin.listUsers({ perPage: 1000 })).data?.users?.length || 0 : 0;

        // Orphan kontrolü — auth'ta olan ama profil tablosunda olmayan
        const { data: allAuthUsers } = await db.auth.admin.listUsers({ perPage: 1000 });
        const authUserIds = new Set((allAuthUsers?.users || []).map((u: any) => u.id));
        
        const { data: allCouriers } = await db.from("couriers").select("user_id");
        const { data: allBusinesses } = await db.from("businesses").select("user_id");
        const profileUserIds = new Set([
          ...(allCouriers || []).map((c: any) => c.user_id),
          ...(allBusinesses || []).map((b: any) => b.user_id),
        ]);

        const orphanAuth = [...authUserIds].filter(id => !profileUserIds.has(id));
        const orphanProfiles = [...profileUserIds].filter(id => !authUserIds.has(id));

        // Confirmed / unconfirmed email
        const confirmedCount = (allAuthUsers?.users || []).filter((u: any) => u.email_confirmed_at).length;
        const unconfirmedCount = (allAuthUsers?.users || []).filter((u: any) => !u.email_confirmed_at).length;

        // Silinen hesaplar
        const { count: deletedCount } = await db.from("deleted_users_archive")
          .select("*", { count: "exact", head: true });

        return NextResponse.json({
          totalAuthUsers,
          confirmedCount,
          unconfirmedCount,
          orphanAuthCount: orphanAuth.length,
          orphanProfileCount: orphanProfiles.length,
          deletedUsersCount: deletedCount || 0,
          orphanAuthIds: orphanAuth.slice(0, 10),
          authError: authError?.message || null,
        });
      }

      default:
        return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}

// POST: Admin işlemleri (silme, güncelleme, vb.)
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const { action } = body;
  const db = getAdminClient();

  try {
    switch (action) {
      case "delete_user": {
        const { userId, role } = body;
        if (!userId) return NextResponse.json({ error: "userId gerekli" }, { status: 400 });
        if (role !== "kurye" && role !== "isletme") return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });

        // Profil tablosundan sil
        if (role === "kurye") {
          await db.from("courier_ads").delete().eq("user_id", userId);
          await db.from("couriers").delete().eq("user_id", userId);
        } else {
          await db.from("business_ads").delete().eq("user_id", userId);
          await db.from("businesses").delete().eq("user_id", userId);
        }

        // Mesajları ve konuşmaları temizle
        const { data: convs } = await db.from("conversations")
          .select("id")
          .or(`business_id.eq.${userId},courier_id.eq.${userId}`);
        
        if (convs && convs.length > 0) {
          const convIds = convs.map((c: any) => c.id);
          await db.from("messages").delete().in("conversation_id", convIds);
          await db.from("conversations").delete().in("id", convIds);
        }

        // Auth kullanıcısını sil
        await db.auth.admin.deleteUser(userId);

        return NextResponse.json({ success: true, message: "Kullanıcı silindi" });
      }

      case "update_plan": {
        const { businessId, newPlan } = body;
        if (!businessId || !newPlan) return NextResponse.json({ error: "businessId ve newPlan gerekli" }, { status: 400 });
        // Güvenlik: Sadece geçerli plan değerlerini kabul et
        const validPlans = ["free", "standard", "premium"];
        if (!validPlans.includes(newPlan)) {
          return NextResponse.json({ error: "Geçersiz plan değeri" }, { status: 400 });
        }

        const { error } = await db.from("businesses")
          .update({ plan: newPlan, plan_updated_at: new Date().toISOString() })
          .eq("id", businessId);

        if (error) throw error;
        return NextResponse.json({ success: true, message: `Plan ${newPlan} olarak güncellendi` });
      }

      case "delete_listing": {
        const { listingId, type } = body;
        if (!listingId || !type) return NextResponse.json({ error: "listingId ve type gerekli" }, { status: 400 });
        // Güvenlik: Sadece izin verilen tablo adlarını kabul et
        if (type !== "business_ads" && type !== "courier_ads") {
          return NextResponse.json({ error: "Geçersiz ilan tipi" }, { status: 400 });
        }

        const { error } = await db.from(type).delete().eq("id", listingId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "İlan silindi" });
      }

      case "delete_message": {
        const { messageId } = body;
        if (!messageId) return NextResponse.json({ error: "messageId gerekli" }, { status: 400 });

        const { error } = await db.from("messages").delete().eq("id", messageId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: "Mesaj silindi" });
      }

      case "delete_conversation": {
        const { conversationId } = body;
        if (!conversationId) return NextResponse.json({ error: "conversationId gerekli" }, { status: 400 });

        await db.from("messages").delete().eq("conversation_id", conversationId);
        await db.from("conversations").delete().eq("id", conversationId);
        return NextResponse.json({ success: true, message: "Konuşma silindi" });
      }

      default:
        return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin POST error:", err);
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
