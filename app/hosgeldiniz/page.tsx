"use client";
import React, { useEffect } from "react";

// Pre-launch: Kullanıcıları ana sayfaya yönlendiriyoruz.
export default function HosgeldinizRedirect() {
  useEffect(() => { window.location.replace("/"); }, []);
  return (
    <main className="min-h-dvh flex items-center justify-center bg-white">
      <p className="text-sm text-neutral-500">Yönlendiriliyor...</p>
    </main>
  );
}
