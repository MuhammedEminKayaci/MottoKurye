"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PlanType, PLAN_LIMITS, isUnlimited } from "@/lib/planLimits";

interface StartChatButtonProps {
  targetId: string; // The ID of the business or courier (NOT auth user id)
  targetRole: 'isletme' | 'kurye'; // The role of the target
  targetUserId?: string; // Auth user id of the target (to prevent self-chat)
  className?: string;
  label?: string;
  variant?: 'default' | 'full'; // full = tam genişlikli kart butonu
}

export function StartChatButton({ targetId, targetRole, targetUserId, className, label = "Mesaj Gönder", variant = 'default' }: StartChatButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ messagesLeft: number; plan: PlanType } | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (targetUserId) {
      const checkSelf = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id === targetUserId) setIsSelf(true);
      };
      checkSelf();
    }
  }, [targetUserId]);

  if (isSelf) return null;

  const handleStartChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/giris');
        return;
      }

      if (targetUserId && user.id === targetUserId) {
        alert("Kendinize mesaj gönderemezsiniz.");
        setLoading(false);
        return;
      }

      // Determine my identity
      let myUserId = user.id;

      let businessUserId = '';
      let courierUserId = '';

      if (targetRole === 'isletme') {
        // Target is business. I must be a courier.
        // Check if I am a courier
        const { data: courier, error: courierCheckError } = await supabase
          .from('couriers')
          .select('user_id')
          .eq('user_id', myUserId)
          .maybeSingle();
        
        if (courierCheckError) {
          console.error("Kurye sorgu hatası:", courierCheckError);
        }

        if (!courier) {
          alert("İşletmelerle mesajlaşmak için kurye profiline sahip olmalısınız.");
          setLoading(false);
          return;
        }

        if (!targetUserId) {
           console.error("Hedef işletme kullanıcı ID bulunamadı");
           alert("Bir hata oluştu.");
           setLoading(false);
           return;
        }

        businessUserId = targetUserId;
        courierUserId = myUserId;

      } else {
        // Target is courier. I must be a business.
        // Önce basit sorguyla işletme varlığını kontrol et
        const { data: businessBasic, error: basicCheckError } = await supabase
          .from('businesses')
          .select('id, user_id, plan')
          .eq('user_id', myUserId)
          .maybeSingle();

        if (basicCheckError) {
          console.error("İşletme sorgu hatası:", basicCheckError);
        }

        if (!businessBasic) {
          alert("Kuryelerle mesajlaşmak için işletme profiline sahip olmalısınız.");
          setLoading(false);
          return;
        }

        // Plan detaylarını ayrı çek (bu sütunlar yoksa bile işletme kontrolü başarılı olsun)
        let messagesSent = 0;
        let planUpdatedAt: Date | null = null;
        try {
          const { data: planData } = await supabase
            .from('businesses')
            .select('messages_sent_total, plan_updated_at')
            .eq('user_id', myUserId)
            .maybeSingle();
          if (planData) {
            messagesSent = (planData as any).messages_sent_total || 0;
            planUpdatedAt = (planData as any).plan_updated_at ? new Date((planData as any).plan_updated_at) : null;
          }
        } catch (e) {
          console.warn("Plan detayları alınamadı, varsayılan değerler kullanılıyor:", e);
        }

        const business = businessBasic;

        // Plan limit kontrolü - toplam mesaj hakkı
        const planLimits = PLAN_LIMITS[business.plan as PlanType] || PLAN_LIMITS.free;
        
        // Aylık sıfırlama kontrolü (standard plan için)
        const now = new Date();
        
        // Standard plan için aylık sıfırlama
        if (business.plan === 'standard' && planUpdatedAt) {
          const monthsSincePlanUpdate = (now.getFullYear() - planUpdatedAt.getFullYear()) * 12 + (now.getMonth() - planUpdatedAt.getMonth());
          if (monthsSincePlanUpdate >= 1) {
            // Yeni ay, sayacı sıfırla
            messagesSent = 0;
          }
        }
        
        const messagesLeft = planLimits.totalMessageLimit - messagesSent;

        // Limit kontrolü (sınırsız değilse)
        if (!isUnlimited(planLimits.totalMessageLimit) && messagesLeft <= 0) {
          setLimitInfo({ messagesLeft: 0, plan: business.plan as PlanType });
          setShowLimitModal(true);
          setLoading(false);
          return;
        }

        if (!targetUserId) {
           console.error("Hedef kurye kullanıcı ID bulunamadı");
           alert("Bir hata oluştu.");
           setLoading(false);
           return;
        }

        businessUserId = myUserId;
        courierUserId = targetUserId;

        // Mesaj sayacını artır (yeni konuşma başlatılacaksa)
        // Mevcut konuşma kontrolünden sonra yapılacak
      }

      // Check existing conversation
      // Note: RLS ensures we can only select if we are part of it
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id, deleted_by_business, deleted_by_courier')
        .eq('business_id', businessUserId)
        .eq('courier_id', courierUserId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching conversation:", fetchError);
        throw fetchError;
      }

      if (existing) {
        // Eğer mevcut kullanıcı bu sohbeti daha önce sildiyse, tekrar aktif et
        const iAmBusiness = businessUserId === myUserId;
        const wasDeletedByMe = iAmBusiness ? existing.deleted_by_business : existing.deleted_by_courier;
        
        if (wasDeletedByMe) {
          const reactivateColumn = iAmBusiness ? 'deleted_by_business' : 'deleted_by_courier';
          const clearedAtColumn = iAmBusiness ? 'business_cleared_at' : 'courier_cleared_at';
          
          await supabase
            .from('conversations')
            .update({ 
              [reactivateColumn]: false,
              [clearedAtColumn]: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        }
        
        router.push(`/mesajlar/${existing.id}`);
      } else {
        // Yeni konuşma oluşturmadan önce mesaj sayacını güncelle (sadece işletmeler için)
        if (targetRole === 'kurye') {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            // Toplam mesaj sayacını artır
            const { data: bizData } = await supabase
              .from('businesses')
              .select('messages_sent_total')
              .eq('user_id', currentUser.id)
              .single();
            
            if (bizData) {
              const newCount = (bizData.messages_sent_total || 0) + 1;
              
              await supabase
                .from('businesses')
                .update({
                  messages_sent_total: newCount
                })
                .eq('user_id', currentUser.id);
            }
          }
        }

        // Create new
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            business_id: businessUserId,
            courier_id: courierUserId
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating conversation:", createError);
          throw createError;
        }
        router.push(`/mesajlar/${newConv.id}`);
      }

    } catch (err) {
      console.error("Chat start error:", JSON.stringify(err, null, 2));
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleStartChat}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors font-medium disabled:opacity-50 ${className || ''}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {loading ? "Başlatılıyor..." : label}
      </button>

      {/* Limit Aşıldı Modal */}
      {showLimitModal && limitInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Mesaj Hakkınız Doldu!
            </h2>
            <p className="text-gray-600 mb-4">
              {limitInfo.plan === 'free' 
                ? 'Toplam 2 mesaj hakkınızı kullandınız. Daha fazla kurye ile iletişime geçmek için planınızı yükseltebilirsiniz.'
                : 'Bu ay için mesaj hakkınız doldu. Yeni ay başladığında hakkınız yenilenecek veya planınızı yükseltebilirsiniz.'
              }
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Mevcut planınız: <span className="font-medium">{PLAN_LIMITS[limitInfo.plan].displayName}</span>
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/ucret-planlari"
                className="w-full py-3 px-6 bg-[#ff7a00] text-white font-bold rounded-full hover:bg-[#e66a00] transition-colors"
              >
                Planı Yükselt
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
