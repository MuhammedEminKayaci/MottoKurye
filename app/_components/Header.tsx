"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type UserRole = "kurye" | "isletme" | null;

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check user role and unread messages
  useEffect(() => {
    const checkRoleAndMessages = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      
      const { data: c } = await supabase.from("couriers").select("id").eq("user_id", uid).limit(1);
      if (c && c.length) { setUserRole("kurye"); }
      else {
        const { data: b } = await supabase.from("businesses").select("id").eq("user_id", uid).limit(1);
        if (b && b.length) setUserRole("isletme");
      }
      
      // Okunmamış mesajları say
      await fetchUnreadCount(uid);
    };
    checkRoleAndMessages();

    // Realtime subscription for new messages
    const channel = supabase
      .channel('header_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async () => {
          const { data } = await supabase.auth.getSession();
          const uid = data.session?.user?.id;
          if (uid) await fetchUnreadCount(uid);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async (userId: string) => {
    try {
      // Kullanıcının dahil olduğu tüm sohbetleri bul
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`business_id.eq.${userId},courier_id.eq.${userId}`);
      
      if (!convs || convs.length === 0) {
        setUnreadCount(0);
        return;
      }
      
      // Her sohbet için okunmamış mesaj var mı kontrol et
      let unreadConversations = 0;
      for (const conv of convs) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false);
        
        if (count && count > 0) {
          unreadConversations++;
        }
      }
      
      setUnreadCount(unreadConversations);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Close mobile menu on ESC for accessibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Çıkış hatası:', err);
    } finally {
      // Oturum bilgilerini manuel temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-')) localStorage.removeItem(key);
        });
      }
      window.location.href = "/";
    }
  };

  // İlanlarım only for businesses
  const navItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Profil", href: "/profil" },
    { label: "Mesajlar", href: "/mesajlar" },
    { label: "İlanlar", href: "/ilanlar" },
    ...(userRole === "isletme" ? [
      { label: "İlanlarım", href: "/ilanlarim" },
      { label: "Ücret Planları", href: "/ucret-planlari" },
    ] : []),
  ];

  const sharedNavLink = "font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md px-1";
  const authBtnBase = "bg-white text-black border-2 border-black px-10 py-2 rounded-full font-bold transition-colors transition-transform hover:bg-black hover:text-white hover:translate-y-[1px]";

  return (
    <header className="bg-[#ff7a00] text-white py-3 px-6 flex items-center justify-between shadow relative">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label="Ana Sayfa" className="flex items-center">
          <Image
            src="/images/paketservisci.png"
            alt="PaketServisi Logo"
            width={300}
            height={80}
            priority
            className="object-contain select-none"
          />
        </Link>
      </div>

      {/* Hamburger Menu Button */}
      <button
        className="md:hidden z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-[#ff7a00] z-40 md:hidden flex flex-col items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col items-center gap-8" role="navigation" aria-label="Mobil menü">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xl font-bold hover:text-white/80 relative"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                {item.label === "Mesajlar" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              disabled={loggingOut}
              className={`${authBtnBase} ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loggingOut ? 'Çıkılıyor...' : 'Çıkış Yap'}
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-6 text-base items-center" role="navigation" aria-label="Ana menü">
          {navItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              <Link
                href={item.href}
                className={`${sharedNavLink} hover:text-white/80 relative`}
              >
                {item.label}
                {item.label === "Mesajlar" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              {idx < navItems.length - 1 && <span className="h-6 w-px bg-white/80" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </nav>
        <button 
          onClick={handleLogout} 
          disabled={loggingOut}
          className={`${authBtnBase} ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loggingOut ? 'Çıkılıyor...' : 'Çıkış Yap'}
        </button>
      </div>
    </header>
  );
}
