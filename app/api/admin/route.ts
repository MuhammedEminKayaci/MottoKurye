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

        // Plan dağılımı — 3 paralel count sorgusu (full table scan yerine)
        const [{ count: freeCount }, { count: standardCount }, { count: premiumCount }] = await Promise.all([
          db.from("businesses").select("*", { count: "exact", head: true }).eq("plan", "free"),
          db.from("businesses").select("*", { count: "exact", head: true }).eq("plan", "standard"),
          db.from("businesses").select("*", { count: "exact", head: true }).eq("plan", "premium"),
        ]);
        const planDistribution = { free: freeCount || 0, standard: standardCount || 0, premium: premiumCount || 0 };

        // Son 7 günlük trend — 3 tek sorgu ile (21 döngü sorgusu yerine)
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        const weekStart = weekAgo.toISOString().split("T")[0] + "T00:00:00";

        const [{ data: recentCourierDates }, { data: recentBusinessDates }, { data: recentMsgDates }] = await Promise.all([
          db.from("couriers").select("created_at").gte("created_at", weekStart),
          db.from("businesses").select("created_at").gte("created_at", weekStart),
          db.from("messages").select("created_at").gte("created_at", weekStart),
        ]);

        // JS'de günlere göre grupla
        const couriersByDay: Record<string, number> = {};
        const businessesByDay: Record<string, number> = {};
        const messagesByDay: Record<string, number> = {};
        (recentCourierDates || []).forEach((r: any) => { const d = r.created_at?.split("T")[0]; if (d) couriersByDay[d] = (couriersByDay[d] || 0) + 1; });
        (recentBusinessDates || []).forEach((r: any) => { const d = r.created_at?.split("T")[0]; if (d) businessesByDay[d] = (businessesByDay[d] || 0) + 1; });
        (recentMsgDates || []).forEach((r: any) => { const d = r.created_at?.split("T")[0]; if (d) messagesByDay[d] = (messagesByDay[d] || 0) + 1; });

        const registrationTrend: { date: string; couriers: number; businesses: number }[] = [];
        const messageTrend: { date: string; messages: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          const label = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
          registrationTrend.push({ date: label, couriers: couriersByDay[key] || 0, businesses: businessesByDay[key] || 0 });
          messageTrend.push({ date: label, messages: messagesByDay[key] || 0 });
        }

        // Sektör + İl dağılımı — tek sorgu ile her iki bilgiyi çek
        const [{ data: bizDistData }, { data: courierProvData }] = await Promise.all([
          db.from("businesses").select("business_sector, province"),
          db.from("couriers").select("province"),
        ]);

        const sectorMap: Record<string, number> = {};
        const provinceMap: Record<string, { couriers: number; businesses: number }> = {};
        (bizDistData || []).forEach((b: any) => {
          const s = b.business_sector || "Diğer";
          sectorMap[s] = (sectorMap[s] || 0) + 1;
          const p = b.province || "Belirtilmemiş";
          if (!provinceMap[p]) provinceMap[p] = { couriers: 0, businesses: 0 };
          provinceMap[p].businesses++;
        });
        (courierProvData || []).forEach((c: any) => {
          const p = c.province || "Belirtilmemiş";
          if (!provinceMap[p]) provinceMap[p] = { couriers: 0, businesses: 0 };
          provinceMap[p].couriers++;
        });
        const sectorDistribution = Object.entries(sectorMap)
          .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value, fullName: name }))
          .sort((a, b) => b.value - a.value);

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

        // Batch: Tüm katılımcı bilgilerini tek sorguda çek
        const businessIds = [...new Set((conversations || []).map((c: any) => c.business_id).filter(Boolean))];
        const courierIds = [...new Set((conversations || []).map((c: any) => c.courier_id).filter(Boolean))];
        const convIds = (conversations || []).map((c: any) => c.id);

        const [{ data: bizList }, { data: curList }, { data: msgCounts }] = await Promise.all([
          businessIds.length > 0
            ? db.from("businesses").select("user_id, business_name, avatar_url").in("user_id", businessIds)
            : Promise.resolve({ data: [] }),
          courierIds.length > 0
            ? db.from("couriers").select("user_id, first_name, last_name, avatar_url").in("user_id", courierIds)
            : Promise.resolve({ data: [] }),
          convIds.length > 0
            ? db.from("messages").select("conversation_id, is_read")
                .in("conversation_id", convIds)
            : Promise.resolve({ data: [] }),
        ]);

        const bizMap = Object.fromEntries((bizList || []).map((b: any) => [b.user_id, b]));
        const curMap = Object.fromEntries((curList || []).map((c: any) => [c.user_id, c]));

        // Mesaj sayılarını JS'de hesapla
        const msgCountMap: Record<string, number> = {};
        const unreadCountMap: Record<string, number> = {};
        (msgCounts || []).forEach((m: any) => {
          msgCountMap[m.conversation_id] = (msgCountMap[m.conversation_id] || 0) + 1;
          if (!m.is_read) unreadCountMap[m.conversation_id] = (unreadCountMap[m.conversation_id] || 0) + 1;
        });

        const enriched = (conversations || []).map((conv: any) => {
          const biz = bizMap[conv.business_id];
          const cur = curMap[conv.courier_id];
          return {
            ...conv,
            business_name: biz?.business_name || "Bilinmiyor",
            business_avatar: biz?.avatar_url,
            courier_name: cur ? `${cur.first_name || ""} ${cur.last_name || ""}`.trim() : "Bilinmiyor",
            courier_avatar: cur?.avatar_url,
            message_count: msgCountMap[conv.id] || 0,
            unread_count: unreadCountMap[conv.id] || 0,
          };
        });

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

      case "documents": {
        const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
        const limit = 20;
        const offset = (page - 1) * limit;
        const search = (searchParams.get("search") || "").replace(/[%_\\]/g, "").slice(0, 100);
        const filter = searchParams.get("filter") || "all"; // all | pending | approved | rejected | has_file

        let query = db.from("couriers")
          .select("id, user_id, first_name, last_name, avatar_url, phone, province, created_at, p1_certificate, src_certificate, criminal_record, p1_certificate_file_url, src_certificate_file_url, criminal_record_file_url", { count: "exact" })
          .order("created_at", { ascending: false });

        // Filtreler
        if (filter === "has_file") {
          // En az bir dosya yüklenmiş olanlar
          query = query.or("p1_certificate_file_url.neq.,src_certificate_file_url.neq.,criminal_record_file_url.neq.");
        } else if (filter === "pending") {
          query = query.or("p1_certificate.eq.Beklemede,src_certificate.eq.Beklemede,criminal_record.eq.Beklemede");
        } else if (filter === "approved") {
          query = query.or("p1_certificate.eq.Onaylandı,src_certificate.eq.Onaylandı,criminal_record.eq.Onaylandı");
        } else if (filter === "rejected") {
          query = query.or("p1_certificate.eq.Reddedildi,src_certificate.eq.Reddedildi,criminal_record.eq.Reddedildi");
        }

        if (search) {
          query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,province.ilike.%${search}%`);
        }

        const { data, count } = await query.range(offset, offset + limit - 1);

        // İstatistikler — paralel COUNT sorguları (full table scan yerine)
        const [
          { count: totalCount },
          { count: withFilesCount },
          { count: pendingCount },
          { count: approvedCount },
          { count: rejectedCount },
        ] = await Promise.all([
          db.from("couriers").select("*", { count: "exact", head: true }),
          db.from("couriers").select("*", { count: "exact", head: true })
            .or("p1_certificate_file_url.neq.,src_certificate_file_url.neq.,criminal_record_file_url.neq."),
          db.from("couriers").select("*", { count: "exact", head: true })
            .or("p1_certificate.eq.Beklemede,src_certificate.eq.Beklemede,criminal_record.eq.Beklemede"),
          db.from("couriers").select("*", { count: "exact", head: true })
            .or("p1_certificate.eq.Onaylandı,src_certificate.eq.Onaylandı,criminal_record.eq.Onaylandı"),
          db.from("couriers").select("*", { count: "exact", head: true })
            .or("p1_certificate.eq.Reddedildi,src_certificate.eq.Reddedildi,criminal_record.eq.Reddedildi"),
        ]);

        const stats = {
          total: totalCount || 0,
          withFiles: withFilesCount || 0,
          pendingReview: pendingCount || 0,
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
        };

        return NextResponse.json({ data: data || [], total: count || 0, page, limit, stats });
      }

      case "document_signed_url": {
        const fileUrl = searchParams.get("url");
        if (!fileUrl) return NextResponse.json({ error: "url parametresi gerekli" }, { status: 400 });

        // Public URL'den storage path'i çıkar
        // Format: https://xxx.supabase.co/storage/v1/object/public/documents/filename.ext
        const match = fileUrl.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);
        if (!match || !match[1]) {
          return NextResponse.json({ error: "Geçersiz dosya URL'i" }, { status: 400 });
        }

        const storagePath = decodeURIComponent(match[1]);
        const { data: signedData, error: signError } = await db.storage
          .from("documents")
          .createSignedUrl(storagePath, 3600); // 1 saat geçerli

        if (signError || !signedData?.signedUrl) {
          console.error("Signed URL error:", signError);
          return NextResponse.json({ error: "Dosya erişim URL'i oluşturulamadı" }, { status: 500 });
        }

        return NextResponse.json({ signedUrl: signedData.signedUrl });
      }

      case "settings": {
        // Sistem ayarlarını getir
        const { data: settings, error: settingsError } = await db
          .from("system_settings")
          .select("key, value, description, updated_at");

        if (settingsError) throw settingsError;

        // Key-value objesine dönüştür
        const settingsMap: Record<string, { value: string; description: string | null; updated_at: string }> = {};
        (settings || []).forEach((s: any) => {
          settingsMap[s.key] = { value: s.value, description: s.description, updated_at: s.updated_at };
        });

        return NextResponse.json(settingsMap);
      }

      case "system": {
        // Sistem sağlığı kontrolleri — tek listUsers çağrısı
        const { data: allAuthUsers, error: authError } = await db.auth.admin.listUsers({ perPage: 1000 });
        const totalAuthUsers = allAuthUsers?.users?.length || 0;
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

      case "update_setting": {
        const { key, value } = body;
        if (!key || value === undefined) {
          return NextResponse.json({ error: "key ve value gerekli" }, { status: 400 });
        }
        // Güvenlik: Sadece izin verilen ayar anahtarlarını kabul et
        const allowedKeys = ["email_verification_enabled"];
        if (!allowedKeys.includes(key)) {
          return NextResponse.json({ error: "Geçersiz ayar anahtarı" }, { status: 400 });
        }
        // Güvenlik: Boolean ayarlar için sadece true/false kabul et
        if (key === "email_verification_enabled" && value !== "true" && value !== "false") {
          return NextResponse.json({ error: "Geçersiz değer" }, { status: 400 });
        }

        const { error: updateError } = await db
          .from("system_settings")
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

        if (updateError) throw updateError;
        return NextResponse.json({ success: true, message: `Ayar güncellendi: ${key} = ${value}` });
      }

      case "update_document_status": {
        const { courierId, field, status: docStatus } = body;
        if (!courierId || !field || !docStatus) {
          return NextResponse.json({ error: "courierId, field ve status gerekli" }, { status: 400 });
        }
        // Güvenlik: Sadece izin verilen alan adlarını kabul et
        const allowedFields = ["p1_certificate", "src_certificate", "criminal_record"];
        if (!allowedFields.includes(field)) {
          return NextResponse.json({ error: "Geçersiz belge alanı" }, { status: 400 });
        }
        // Güvenlik: Sadece izin verilen durumları kabul et
        const allowedStatuses = ["Beklemede", "Onaylandı", "Reddedildi"];
        if (!allowedStatuses.includes(docStatus)) {
          return NextResponse.json({ error: "Geçersiz durum değeri" }, { status: 400 });
        }

        const { error } = await db.from("couriers")
          .update({ [field]: docStatus })
          .eq("id", courierId);

        if (error) throw error;
        return NextResponse.json({ success: true, message: `Belge durumu ${docStatus} olarak güncellendi` });
      }

      default:
        return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin POST error:", err);
    return NextResponse.json({ error: err.message || "Sunucu hatası" }, { status: 500 });
  }
}
