"use client";

import { createClient } from "@supabase/supabase-js";

// Supabase client (browser) - uses real credentials with fallback
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mgjwlfyxfxmfappwputi.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nandsZnl4ZnhtZmFwcHdwdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzY0ODcsImV4cCI6MjA3Nzc1MjQ4N30.O_EjyJkqpy85ibFIpB1PuEYYUpXpSCtcAAusbeTchGM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
