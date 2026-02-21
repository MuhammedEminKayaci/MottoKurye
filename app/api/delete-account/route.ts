import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

    // 2) Kullanıcının rolünü belirle
    const { data: courier } = await supabase
      .from("couriers")
      .select("id, user_id")
      .eq("user_id", uid)
      .maybeSingle();

    const { data: business } = await supabase
      .from("businesses")
      .select("id, user_id")
      .eq("user_id", uid)
      .maybeSingle();

    // 3) İlişkili verileri sil

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

    // 4) Auth kullanıcısını sil (service role key varsa)
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (deleteError) {
        console.error("Auth kullanıcı silme hatası:", deleteError);
        // Profil verileri zaten silindi, devam et
      }
    } else {
      console.warn("SUPABASE_SERVICE_ROLE_KEY tanımlı değil. Auth kullanıcısı silinemedi, ancak profil verileri temizlendi.");
    }

    // 5) Oturumu kapat
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
