"use client";
import React, { Suspense } from "react";
import { Header } from "../_components/Header";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { FilterPanel, Role } from "../_components/ModernFilterPanel";
import { ListingCard } from "../hosgeldiniz/_components/ListingCard";
import { Pagination } from "../hosgeldiniz/_components/Pagination";

function IlanlarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view'); // 'kurye' or 'isletme'
  const typeParam = searchParams.get('type'); // 'kurye' or 'isletme' from redirect
  
  const [role, setRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

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
      const { data: auth } = await supabase.auth.getSession();
      const uid = auth.session?.user?.id;
      
      if (uid) {
        // User is authenticated, check their role
        setIsAuthenticated(true);
        const { data: c } = await supabase.from("couriers").select("id").eq("user_id", uid).limit(1);
        if (c?.length) { 
          setRole((viewParam as Role) || "kurye"); 
          setLoading(false); 
          return; 
        }
        const { data: b } = await supabase.from("businesses").select("id").eq("user_id", uid).limit(1);
        if (b?.length) { 
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
            .select("id,title,description,province,district,working_type,working_hours,created_at,image_url,user_id")
            .order("created_at", { ascending: false }).limit(60);
          
          // Apply filters
          if (filters.province) query = query.eq("province", filters.province);
          if (filters.district) query = query.eq("district", filters.district);
          if (filters.working_type) query = query.eq("working_type", filters.working_type);
          if (filters.earning_model) query = query.eq("earning_model", filters.earning_model);
          if (filters.daily_package_estimate) query = query.eq("daily_package_estimate", filters.daily_package_estimate);
          if (filters.working_days) {
            // Çoklu seçim için her günü kontrol et
            const days = filters.working_days.split(',');
            days.forEach(day => {
              query = query.contains("working_days", [day.trim()]);
            });
          }
          
          const { data, error } = await query;
          if (error) {
            console.error('Business ads fetch error:', error);
            throw error;
          }
          console.log('Business ads fetched:', data?.length || 0, 'items');
          
          // Get business info for each ad if user_id exists
          const adsWithBusinessInfo = await Promise.all(
            (data || []).map(async (ad: any) => {
              if (!ad.user_id) return ad;
              const { data: business } = await supabase
                .from("businesses")
                .select("id,business_name,avatar_url,user_id")
                .eq("user_id", ad.user_id)
                .single();
              return {
                ...ad,
                businesses: business ? [business] : []
              };
            })
          );
          
          setItems(adsWithBusinessInfo); setPage(1);
        } else {
          // Show couriers for business perspective
          let query = supabase.from("couriers")
            .select("id,user_id,first_name,last_name,avatar_url,phone,province,district,license_type,working_type,earning_model,daily_package_estimate,has_motorcycle,has_bag,experience,created_at")
            .order("created_at", { ascending: false }).limit(60);
          
          // Apply filters
          if (filters.province) query = query.eq("province", filters.province);
          if (filters.district) query = query.eq("district", filters.district);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map(it => {
                  console.log('Listing item:', { id: it.id, user_id: it.user_id, role, userRole: role === 'kurye' ? 'isletme' : 'kurye' });
                  return (
                    <ListingCard
                      key={it.id}
                      title={role === 'isletme' ? `${it.first_name ?? ''} ${it.last_name ?? ''}`.trim() || 'Kurye' : (it.title ?? 'Başlık')}
                      subtitle={role === 'kurye' ? (it.description ?? '') : ''}
                      metaParts={[
                        it.province,
                        it.district,
                        role === 'isletme' ? it.license_type : it.working_type,
                        role === 'isletme' ? it.working_type : null
                      ].filter(Boolean)}
                      imageUrl={role === 'kurye' ? it.image_url : (it.avatar_url ?? null)}
                      fallbackImageUrl={role === 'kurye' ? (it.businesses?.[0]?.avatar_url ?? null) : null}
                      phone={role === 'isletme' ? (it.phone ?? null) : null}
                      showActions={role === 'isletme'}
                      isGuest={!isAuthenticated}
                      onGuestClick={handleGuestClick}
                      time={it.created_at ? new Date(it.created_at).toLocaleDateString() : undefined}
                      userId={it.user_id}
                      userRole={role === 'kurye' ? 'isletme' : 'kurye'}
                    />
                  );
                })}
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
