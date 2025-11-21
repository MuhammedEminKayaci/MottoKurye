"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on ESC for accessibility
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/giris");
  };

  const navItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Profil", href: "/profil" },
    { label: "İlanlar", href: "/ilanlar" },
    { label: "İlanlarım", href: "/ilanlarim" },
  ];

  const sharedNavLink = "font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-md px-1";
  const authBtnBase = "bg-white text-black border-2 border-black px-10 py-2 rounded-full font-bold transition-colors transition-transform hover:bg-black hover:text-white hover:translate-y-[1px]";

  return (
    <header className="bg-[#ff7a00] text-white py-3 px-6 flex items-center justify-between shadow relative">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label="Ana Sayfa" className="flex items-center">
          <Image
            src="/images/headerlogo.png"
            alt="Motto Kurye Logo"
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
                className="text-xl font-bold hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className={authBtnBase}
            >
              Çıkış Yap
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
                className={`${sharedNavLink} hover:text-white/80`}
              >
                {item.label}
              </Link>
              {idx < navItems.length - 1 && <span className="h-6 w-px bg-white/80" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </nav>
        <button onClick={handleLogout} className={authBtnBase}>
          Çıkış Yap
        </button>
      </div>
    </header>
  );
}
