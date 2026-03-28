"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type UserRole = "kurye" | "isletme" | null;
const ADMIN_EMAILS = ["eminkayaci07@gmail.com"];

export function UnifiedHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      const email = data.session?.user?.email;

      if (!uid) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      if (email && ADMIN_EMAILS.includes(email)) setIsAdmin(true);

      // Rol tespiti
      const { data: c } = await supabase
        .from("couriers")
        .select("id")
        .eq("user_id", uid)
        .limit(1);
      if (c && c.length) {
        setRole("kurye");
      } else {
        const { data: b } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", uid)
          .limit(1);
        if (b && b.length) setRole("isletme");
      }

      // Okunmamış mesajları say
      await fetchUnreadCount(uid);
    };
    init();

    // Auth state değişikliğini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    // Realtime yeni mesaj aboneliği
    const channel = supabase
      .channel("unified_header_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async () => {
          const { data } = await supabase.auth.getSession();
          const uid = data.session?.user?.id;
          if (uid) await fetchUnreadCount(uid);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async (userId: string) => {
    try {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`business_id.eq.${userId},courier_id.eq.${userId}`);

      if (!convs || convs.length === 0) {
        setUnreadCount(0);
        return;
      }

      let unreadConversations = 0;
      for (const conv of convs) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", userId)
          .eq("is_read", false);

        if (count && count > 0) {
          unreadConversations++;
        }
      }

      setUnreadCount(unreadConversations);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // ESC ile mobil menüyü kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("Çıkış hatası:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token");
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) localStorage.removeItem(key);
        });
      }
      window.location.href = "/";
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href === "/") {
      e.preventDefault();
      router.push("/");
      setIsMenuOpen(false);
      return;
    }
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMenuOpen(false);
      if (window.location.pathname === "/") {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push("/" + href);
      }
    }
  };

  // Giriş yapılmışsa rol bazlı menü, yapılmamışsa public menü
  const publicNavItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "İletişim", href: "/iletisim" },
    { label: "Nasıl Çalışır", href: "#nasil-calisir" },
    { label: "İşletme Ücret Planları", href: "/ucret-planlari" },
  ];

  const courierNavItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Profilim", href: "/profil" },
    { label: "İlanlar", href: "/ilanlar" },
    { label: "Mesajlar", href: "/mesajlar" },
    ...(isAdmin ? [{ label: "⚙ Yönetim", href: "/admin" }] : []),
  ];

  const businessNavItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Profilim", href: "/profil" },
    { label: "İlanlar", href: "/ilanlar" },
    { label: "Mesajlar", href: "/mesajlar" },
    { label: "Ücret Planları", href: "/ucret-planlari" },
    ...(isAdmin ? [{ label: "⚙ Yönetim", href: "/admin" }] : []),
  ];

  const navItems = !isLoggedIn
    ? publicNavItems
    : role === "isletme"
      ? businessNavItems
      : courierNavItems;

  const sharedNavLink =
    "font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md px-1";
  const authBtnBase =
    "bg-white text-black border-2 border-black px-10 py-2 rounded-full font-bold transition-colors transition-transform hover:bg-black hover:text-white hover:translate-y-[1px]";

  return (
    <header className="bg-[#ff7a00] text-white py-3 px-6 flex items-center justify-between shadow relative">
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogoClick}
          aria-label="Ana Sayfa"
          className="flex items-center"
        >
          <Image
            src="/images/paketservisci.png"
            alt="PaketServisçi Logo"
            width={300}
            height={80}
            priority
            className="object-contain select-none cursor-pointer"
          />
        </button>
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
            d={
              isMenuOpen
                ? "M6 18L18 6M6 6l12 12"
                : "M4 6h16M4 12h16M4 18h16"
            }
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
          <nav
            className="flex flex-col items-center gap-8"
            role="navigation"
            aria-label="Mobil menü"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xl font-bold hover:text-white/80 relative"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleNavClick(e, item.href);
                }}
              >
                {item.label}
                {item.label === "Mesajlar" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-6 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}
            {!isLoggedIn ? (
              <>
                <Link
                  href="/kayit-ol"
                  className={authBtnBase}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
                <Link
                  href="/giris"
                  className={authBtnBase}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className={`${authBtnBase} ${loggingOut ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        <nav
          className="flex gap-6 text-base items-center"
          role="navigation"
          aria-label="Ana menü"
        >
          {navItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              <Link
                href={item.href}
                className={`${sharedNavLink} hover:text-white/80 relative`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
                {item.label === "Mesajlar" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              {idx < navItems.length - 1 && (
                <span className="h-6 w-px bg-white/80" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </nav>
        {!isLoggedIn ? (
          <>
            <Link href="/kayit-ol" className={authBtnBase}>
              Kayıt Ol
            </Link>
            <Link href="/giris" className={authBtnBase}>
              Giriş Yap
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`${authBtnBase} ${loggingOut ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loggingOut ? "Çıkılıyor..." : "Çıkış Yap"}
          </button>
        )}
      </div>
    </header>
  );
}
