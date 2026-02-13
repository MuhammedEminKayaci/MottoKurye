"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase client (browser) - credentials from .env.local
// createBrowserClient auth tokenları cookie olarak saklar,
// böylece middleware ve server tarafı da session'ı görebilir.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase ortam değişkenleri eksik. .env.local dosyasını kontrol edin.");
}

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
