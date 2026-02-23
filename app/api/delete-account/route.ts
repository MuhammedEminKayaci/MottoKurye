import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST() {
  try {
    // 1) Oturum açmış kullanıcıyı doğrula
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
            // Server Component'te set edilemez
          }
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const uid = user.id;

    // 2) Kullanıcının rolünü belirle — TÜM verileri çek (arşivlemek için)
    const { data: courier } = await supabase
      .from("couriers")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    // 3) Kullanıcı verilerini deleted_users tablosuna arşivle
    // Service role key ile arşivleme yapılır (RLS bypass)
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // IP adresini al (KVKK uyumu)
      const headersList = await headers();
      const clientIp =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        null;

      if (courier) {
        const archiveRecord = {
          user_id: uid,
          email: user.email || null,
          role: "kurye" as const,
          phone: courier.phone || null,
          contact_preference: courier.contact_preference || null,
          province: courier.province || null,
          district: courier.district || null,
          working_type: courier.working_type || null,
          earning_model: courier.earning_model || null,
          working_days: courier.working_days || null,
          daily_package_estimate: courier.daily_package_estimate || null,
          avatar_url: courier.avatar_url || null,
          // Kurye-spesifik
          first_name: courier.first_name || null,
          last_name: courier.last_name || null,
          age: courier.age || null,
          gender: courier.gender || null,
          nationality: courier.nationality || null,
          experience: courier.experience || null,
          license_type: courier.license_type || null,
          has_motorcycle: courier.has_motorcycle || null,
          moto_brand: courier.moto_brand || null,
          moto_cc: courier.moto_cc || null,
          has_bag: courier.has_bag || null,
          p1_certificate: courier.p1_certificate || null,
          src_certificate: courier.src_certificate || null,
          criminal_record: courier.criminal_record || null,
          p1_certificate_file_url: courier.p1_certificate_file_url || null,
          src_certificate_file_url: courier.src_certificate_file_url || null,
          criminal_record_file_url: courier.criminal_record_file_url || null,
          // Onaylar
          accept_terms: courier.accept_terms ?? null,
          accept_privacy: courier.accept_privacy ?? null,
          accept_kvkk: courier.accept_kvkk ?? null,
          accept_commercial: courier.accept_commercial ?? null,
          is_visible: courier.is_visible ?? null,
          original_created_at: courier.created_at || null,
          // Silme meta verileri
          deleted_by_ip: clientIp,
        };

        const { error: archiveError } = await supabaseAdmin
          .from("deleted_users")
          .insert(archiveRecord);

        if (archiveError) {
          console.error("Kurye arşivleme hatası:", archiveError);
          // Arşivleme başarısız olursa silme işlemini durdur
          return NextResponse.json(
            { error: "Kullanıcı verileri arşivlenirken bir hata oluştu. Hesap silme iptal edildi." },
            { status: 500 }
          );
        }
      }

      if (business) {
        const archiveRecord = {
          user_id: uid,
          email: user.email || null,
          role: "isletme" as const,
          phone: null,
          contact_preference: business.contact_preference || null,
          province: business.province || null,
          district: business.district || null,
          working_type: business.working_type || null,
          earning_model: business.earning_model || null,
          working_days: business.working_days || null,
          daily_package_estimate: business.daily_package_estimate || null,
          avatar_url: business.avatar_url || null,
          // İşletme-spesifik
          business_name: business.business_name || null,
          business_sector: business.business_sector || null,
          manager_name: business.manager_name || null,
          manager_contact: business.manager_contact || null,
          // Onaylar
          accept_terms: business.accept_terms ?? null,
          accept_privacy: business.accept_privacy ?? null,
          accept_kvkk: business.accept_kvkk ?? null,
          accept_commercial: business.accept_commercial ?? null,
          // Plan bilgileri
          plan: business.plan || null,
          plan_expires_at: business.plan_expires_at || null,
          is_visible: business.is_visible ?? null,
          original_created_at: business.created_at || null,
          // Silme meta verileri
          deleted_by_ip: clientIp,
        };

        const { error: archiveError } = await supabaseAdmin
          .from("deleted_users")
          .insert(archiveRecord);

        if (archiveError) {
          console.error("İşletme arşivleme hatası:", archiveError);
          return NextResponse.json(
            { error: "Kullanıcı verileri arşivlenirken bir hata oluştu. Hesap silme iptal edildi." },
            { status: 500 }
          );
        }
      }
    } else {
      console.error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil. Arşivleme yapılamadı.");
      return NextResponse.json(
        { error: "Sunucu yapılandırma hatası. Lütfen yöneticiyle iletişime geçin." },
        { status: 500 }
      );
    }

    // 4) İlişkili verileri sil

    // Sohbetleri bul (mesajları silmek için)
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`business_id.eq.${uid},courier_id.eq.${uid}`);

    if (conversations && conversations.length > 0) {
      const convIds = conversations.map((c) => c.id);

      // Mesajları sil
      for (const convId of convIds) {
        await supabase.from("messages").delete().eq("conversation_id", convId);
      }

      // Sohbetleri sil
      await supabase
        .from("conversations")
        .delete()
        .or(`business_id.eq.${uid},courier_id.eq.${uid}`);
    }

    // İşletme ilanlarını sil
    if (business) {
      await supabase.from("business_ads").delete().eq("user_id", uid);
    }

    // Profil kaydını sil
    if (courier) {
      await supabase.from("couriers").delete().eq("user_id", uid);
    }
    if (business) {
      await supabase.from("businesses").delete().eq("user_id", uid);
    }

    // 5) Auth kullanıcısını sil (service role key zaten yukarıda doğrulandı)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (deleteError) {
      console.error("Auth kullanıcı silme hatası:", deleteError);
      // Profil verileri zaten silindi, devam et
    }

    // 6) Oturumu kapat
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Hesap silme hatası:", err);
    return NextResponse.json(
      { error: err.message || "Hesap silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
