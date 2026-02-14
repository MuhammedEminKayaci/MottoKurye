"use client";
import React, { Suspense } from "react";
import { Header } from "../_components/Header";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { FilterPanel, Role } from "../_components/ModernFilterPanel";
import { ListingCard } from "../hosgeldiniz/_components/ListingCard";
import { Pagination } from "../hosgeldiniz/_components/Pagination";

const maskCourierName = (first?: string | null, last?: string | null) => {
  const f = (first || "").trim();
  const l = (last || "").trim();
  const initial = l ? `${l[0].toUpperCase()}.` : "";
  return [f, initial].filter(Boolean).join(" ") || "Kurye";
};

const maskBusinessName = (name?: string | null) => {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "İşletme";
  // Her kelime için ilk harf + 3 nokta: "Engin Has Lahmacun" → "E... H... L..."
  return parts.map(p => `${p[0]?.toUpperCase() || ''}...`).join(' ');
};

function IlanlarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view'); // 'kurye' or 'isletme'
  const typeParam = searchParams.get('type'); // 'kurye' or 'isletme' from redirect
  
  const [role, setRole] = useState<Role | null>(null);
  const [actualRole, setActualRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [viewerPlan, setViewerPlan] = useState<'free' | 'standard' | 'premium' | null>(null);
  const pageSize = 10;

  const handleGuestClick = () => {
    // Ön izleme mantığı: işletme ilanı ön izlemesinde kurye kaydı, kurye ilanı ön izlemesinde işletme kaydı
    if (role === "kurye") {
      router.push("/kayit-ol?role=kurye");
    } else if (role === "isletme") {
      router.push("/kayit-ol?role=isletme");
    } else {
      router.push("/kayit-ol");
    }
  };

  // Role detection - check auth status and determine role based on URL param or user role
  useEffect(() => {
    const init = async () => {
      try {
        const { data: auth, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Auth error:', authError);
          setIsAuthenticated(false);
          setRole((typeParam as Role) || (viewParam as Role) || "kurye");
          setLoading(false);
          return;
        }
        
        const uid = auth.session?.user?.id;
        
        if (uid) {
          // User is authenticated, check their role
          setIsAuthenticated(true);
          const { data: c, error: curierError } = await supabase.from("couriers").select("id").eq("user_id", uid).limit(1);
          if (curierError) console.error('Courier check error:', curierError);
          if (c?.length) {
            setActualRole("kurye");
            setRole((viewParam as Role) || "kurye"); 
            setLoading(false); 
            return; 
          }
          const { data: b, error: businessError } = await supabase.from("businesses").select("id,plan").eq("user_id", uid).limit(1);
          if (businessError) console.error('Business check error:', businessError);
          if (b?.length) {
            setActualRole("isletme");
            setViewerPlan((b[0] as any).plan || 'free');
            setRole((viewParam as Role) || "isletme"); 
            setLoading(false); 
            return; 
          }
          setLoading(false);
        } else {
          // User is not authenticated - show guest view based on URL param
          setIsAuthenticated(false);
          // Check type param first (from redirect), then view param, default to kurye
          setRole((typeParam as Role) || (viewParam as Role) || "kurye");
          setLoading(false);
        }
      } catch (err) {
        console.error('Init error:', err);
        setIsAuthenticated(false);
        setRole((typeParam as Role) || (viewParam as Role) || "kurye");
        setLoading(false);
      }
    };
    init();
  }, [viewParam, typeParam]);

  // Fetch content - allow guest access
  useEffect(() => {
    const run = async () => {
      if (!role) return;
      setLoading(true); setMessage(null);
      try {
        if (role === "kurye") {
          // Show business ads (both for logged-in couriers and guests)
          let query = supabase.from("business_ads")
            .select("id,title,description,province,district,working_type,working_hours,earning_model,working_days,daily_package_estimate,created_at,image_url,user_id")
            .eq("is_available", true)
            .order("created_at", { ascending: false }).limit(60);
          
          // Apply filters
          if (filters.province) query = query.eq("province", filters.province);
          if (filters.district) {
            const districts = filters.district.split(',').map(d => d.trim());
            query = query.overlaps("district", districts);
          }
          if (filters.working_type) query = query.eq("working_type", filters.working_type);
          if (filters.earning_model) query = query.eq("earning_model", filters.earning_model);
          if (filters.daily_package_estimate) query = query.eq("daily_package_estimate", filters.daily_package_estimate);
          if (filters.working_days) {
            const days = filters.working_days.split(',');
            days.forEach(day => { query = query.contains("working_days", [day.trim()]); });
          }
          
          let { data, error } = await query;
          if (error) {
            // Fallback: if new columns aren't in DB yet, retry with minimal select/filters
            const msg = String(error.message || '').toLowerCase();
            const hasMissingColumn = msg.includes('column') && msg.includes('does not exist');
            if (hasMissingColumn) {
              let q2 = supabase.from("business_ads")
                .select("id,title,description,working_hours,created_at,image_url,user_id")
                .order("created_at", { ascending: false }).limit(60);
              if (filters.province) q2 = q2.eq("province", filters.province);
              
              const res2 = await q2;
              data = (res2.data as any) || [];
              error = res2.error || null;
            }
          }
          if (error) throw error;
          
          // Get business info for each ad and filter by seeking_couriers
          const adsWithBusinessInfo = await Promise.all(
            (data || []).map(async (ad: any) => {
              if (!ad.user_id) return null; // No user_id, skip this ad
              try {
                const { data: business } = await supabase
                  .from("businesses")
                  .select("id,business_name,avatar_url,user_id,seeking_couriers,business_sector")
                  .eq("user_id", ad.user_id)
                  .single();
                
                // Only include ads from businesses that are seeking couriers
                if (!business || !business.seeking_couriers) {
                  return null;
                }
                
                // Filter by business_sector if specified
                if (filters.business_sector && business.business_sector !== filters.business_sector) {
                  return null;
                }
                
                return {
                  ...ad,
                  businesses: [business]
                };
              } catch {
                return null;
              }
            })
          );
          
          // Filter out null values (ads from businesses not seeking couriers)
          const filteredAds = adsWithBusinessInfo.filter(ad => ad !== null);
          setItems(filteredAds); setPage(1);
        } else {
          // Show couriers for business perspective
          let query = supabase.from("couriers")
            .select("id,user_id,first_name,last_name,avatar_url,phone,province,district,license_type,working_type,earning_model,daily_package_estimate,has_motorcycle,has_bag,experience,created_at,is_accepting_offers")
            .eq("is_accepting_offers", true)
            .order("created_at", { ascending: false }).limit(60);
          
          // Apply filters
          if (filters.province) query = query.eq("province", filters.province);
          if (filters.district) {
            const districts = filters.district.split(',').map(d => d.trim());
            query = query.overlaps("district", districts);
          }
          if (filters.license_type) query = query.eq("license_type", filters.license_type);
          if (filters.working_type) query = query.eq("working_type", filters.working_type);
          if (filters.earning_model) query = query.eq("earning_model", filters.earning_model);
          if (filters.has_motorcycle) query = query.eq("has_motorcycle", filters.has_motorcycle);
          if (filters.has_bag) query = query.eq("has_bag", filters.has_bag);
          if (filters.p1_certificate) query = query.eq("p1_certificate", filters.p1_certificate);
          if (filters.criminal_record) query = query.eq("criminal_record", filters.criminal_record);
          if (filters.working_days) {
            // Çoklu seçim için her günü kontrol et
            const days = filters.working_days.split(',');
            days.forEach(day => {
              query = query.contains("working_days", [day.trim()]);
            });
          }
          
          const { data, error } = await query;
          if (error) throw error;
          setItems(data || []); setPage(1);
        }
      } catch (e: any) {
        console.error('Fetch error:', e);
        setItems([]); 
        if (role === "kurye") {
          setMessage(`İşletme ilanları yüklenemiyor. ${e?.message || 'Veritabanı hatası veya henüz ilan yok.'}`);
        } else {
          setMessage(`Kuryeler listelenemiyor. ${e?.message || 'Veritabanı hatası veya henüz kurye kaydı yok.'}`);
        }
      } finally { setLoading(false); }
    };
    run();
  }, [role, filters]);

  const title = useMemo(() => {
    if (!isAuthenticated) {
      return role === "kurye" ? "İŞLETME İLANLARI - ÖN İZLEME" : "KURYELER - ÖN İZLEME";
    }
    return role === "kurye" ? "İŞLETME İLANLARI" : role === "isletme" ? "KURYELER" : "İLANLAR";
  }, [role, isAuthenticated]);
  const paged = useMemo(() => items.slice((page-1)*pageSize, (page-1)*pageSize + pageSize), [items, page]);

  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-white to-neutral-100 flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        {/* Modern Filter Panel */}
        <FilterPanel role={(role ?? "kurye") as Role} onChange={setFilters} />
        
        {/* Main Content */}
        <div className="flex-1 px-4 md:px-6 pt-8 pb-20 md:pb-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-black">{title}</h1>
            
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Ön İzleme Modu:</strong> {role === "isletme" ? "Kurye ilanlarını görüntülüyorsunuz. Kayıt olmak için işletme kaydı yapın." : "İşletme ilanlarını görüntülüyorsunuz. Kayıt olmak için kurye kaydı yapın."}{" "}
                  <button 
                    onClick={handleGuestClick}
                    className="underline hover:text-orange-900 font-semibold"
                  >
                    {role === "isletme" ? "İşletme Olarak Kayıt Ol" : "Kurye Olarak Kayıt Ol"}
                  </button>
                </p>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : paged.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/70 text-lg">{message ?? "Henüz kayıt yok."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                {paged.map(it => (
                    <ListingCard
                      key={it.id}
                      title={role === 'isletme' 
                        ? maskCourierName(it.first_name, it.last_name) 
                        : maskBusinessName(it.businesses?.[0]?.business_name) || (it.title ?? 'Başlık')}
                      subtitle={role === 'kurye' ? (it.description ?? '') : ''}
                      metaParts={role === 'kurye'
                        ? [
                            it.province,
                            Array.isArray(it.district) ? it.district.slice(0, 2).join(', ') : it.district,
                            it.businesses?.[0]?.business_sector,
                            it.working_type,
                            it.earning_model,
                            it.working_hours,
                            it.daily_package_estimate,
                            Array.isArray(it.working_days) && it.working_days.length > 0
                              ? it.working_days.length === 7 ? 'Her Gün' : it.working_days.slice(0, 3).join(', ') + (it.working_days.length > 3 ? ` +${it.working_days.length - 3}` : '')
                              : null,
                          ].filter(Boolean)
                        : [
                            it.province,
                            Array.isArray(it.district) ? it.district.slice(0, 2).join(', ') : it.district,
                            it.license_type,
                            it.working_type,
                            it.experience,
                            it.working_hours,
                            it.daily_package_estimate,
                          ].filter(Boolean)
                      }
                      imageUrl={role === 'kurye' ? it.image_url : (it.avatar_url ?? null)}
                      fallbackImageUrl={role === 'kurye' ? (it.businesses?.[0]?.avatar_url ?? null) : null}
                      phone={role === 'isletme' ? (it.phone ?? null) : null}
                      contactPreference={(it as any).contact_preference ?? 'phone'}
                      showActions={true}
                      isGuest={!isAuthenticated || (isAuthenticated && role !== actualRole)}
                      onGuestClick={() => {
                        if (!isAuthenticated) {
                          handleGuestClick();
                        } else {
                          // Authenticated but viewing wrong role (preview mode)
                          if (actualRole === "kurye" && role === "isletme") {
                            alert("Kurye olduğunuz için kurye detaylarını görüntüleyemezsiniz.");
                          } else if (actualRole === "isletme" && role === "kurye") {
                            alert("İşletme olduğunuz için işletme ilan detaylarını görüntüleyemezsiniz.");
                          } else {
                            handleGuestClick();
                          }
                        }
                      }}
                      time={it.created_at ? new Date(it.created_at).toLocaleDateString() : undefined}
                      userId={it.user_id}
                      targetId={it.id}
                      userRole={role === 'kurye' ? 'isletme' : 'kurye'}
                      viewerPlan={viewerPlan}
                    />
                  ))}
              </div>
            )}
            <Pagination total={items.length} page={page} pageSize={pageSize} onPage={setPage} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function IlanlarPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh w-full bg-gradient-to-b from-white to-neutral-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <IlanlarContent />
    </Suspense>
  );
}
