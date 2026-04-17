import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";

// Güvenli alanlar — hassas bilgiler (telefon, belge URL'leri vb.) dahil edilmez
const COURIER_SAFE_FIELDS =
  "id,user_id,first_name,last_name,avatar_url,province,district,license_type,working_type,earning_model,daily_package_estimate,has_motorcycle,has_bag,experience,created_at,is_accepting_offers,contact_preference,src_certificate,working_days";

const BUSINESS_AD_FIELDS =
  "id,title,description,province,district,working_type,working_hours,earning_model,working_days,daily_package_estimate,created_at,image_url,user_id";

const BUSINESS_SAFE_FIELDS =
  "id,business_name,avatar_url,user_id,seeking_couriers,business_sector,plan";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type"); // 'couriers' or 'business_ads'

  if (type !== "couriers" && type !== "business_ads") {
    return NextResponse.json({ error: "Geçersiz tip." }, { status: 400 });
  }

  const ip = getRateLimitKey(request);
  if (!rateLimit(`public-listings:${ip}`, 30, 60000)) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen 1 dakika bekleyin." }, { status: 429 });
  }

  try {
    if (type === "couriers") {
      const filters: Record<string, string> = {};
      for (const key of ["province", "district", "license_type", "working_type", "earning_model", "has_motorcycle", "has_bag", "p1_certificate", "src_certificate", "criminal_record", "working_days"]) {
        const val = searchParams.get(key);
        if (val) filters[key] = val;
      }

      let query = supabaseAdmin
        .from("couriers")
        .select(COURIER_SAFE_FIELDS)
        .eq("is_accepting_offers", true)
        .order("created_at", { ascending: false })
        .limit(60);

      if (filters.province) query = query.eq("province", filters.province);
      if (filters.district) {
        const districts = filters.district.split(",").map((d) => d.trim());
        query = query.overlaps("district", districts);
      }
      if (filters.license_type) query = query.eq("license_type", filters.license_type);
      if (filters.working_type) query = query.eq("working_type", filters.working_type);
      if (filters.earning_model) query = query.eq("earning_model", filters.earning_model);
      if (filters.has_motorcycle) query = query.eq("has_motorcycle", filters.has_motorcycle);
      if (filters.has_bag) query = query.eq("has_bag", filters.has_bag);
      if (filters.src_certificate) query = query.eq("src_certificate", filters.src_certificate);
      if (filters.working_days) query = query.eq("working_days", filters.working_days);

      const { data, error } = await query;
      if (error) throw error;

      // Telefon bilgisini kaldır — misafir kullanıcılar için
      const safeData = (data || []).map(({ ...item }: any) => {
        delete item.phone;
        return item;
      });

      return NextResponse.json({ data: safeData });
    }

    if (type === "business_ads") {
      const filters: Record<string, string> = {};
      for (const key of ["province", "district", "working_type", "earning_model", "daily_package_estimate", "working_days", "business_sector"]) {
        const val = searchParams.get(key);
        if (val) filters[key] = val;
      }

      let query = supabaseAdmin
        .from("business_ads")
        .select(BUSINESS_AD_FIELDS)
        .order("created_at", { ascending: false })
        .limit(60);

      if (filters.province) query = query.eq("province", filters.province);
      if (filters.district) {
        const districts = filters.district.split(",").map((d) => d.trim());
        query = query.overlaps("district", districts);
      }
      if (filters.working_type) query = query.eq("working_type", filters.working_type);
      if (filters.earning_model) query = query.eq("earning_model", filters.earning_model);
      if (filters.daily_package_estimate) query = query.eq("daily_package_estimate", filters.daily_package_estimate);
      if (filters.working_days) query = query.eq("working_days", filters.working_days);

      const { data, error } = await query;
      if (error) throw error;

      // Batch: Tüm işletme bilgilerini tek sorguda çek
      const userIds = [...new Set((data || []).map((a: any) => a.user_id).filter(Boolean))];
      let bizMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: businesses } = await supabaseAdmin
          .from("businesses")
          .select(BUSINESS_SAFE_FIELDS)
          .in("user_id", userIds);
        (businesses || []).forEach((b: any) => { bizMap[b.user_id] = b; });
      }

      const adsWithBusiness = (data || []).map((ad: any) => {
        if (!ad.user_id) return null;
        const business = bizMap[ad.user_id];
        if (!business) return null;
        if (business.seeking_couriers === false) return null;
        if (filters.business_sector && business.business_sector !== filters.business_sector) return null;
        return { ...ad, businesses: [business], businessPlan: business.plan || "free" };
      }).filter(Boolean);

      return NextResponse.json({ data: adsWithBusiness.filter(Boolean) });
    }
  } catch (err: any) {
    console.error("Public listings error:", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
