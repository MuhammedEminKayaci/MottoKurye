import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for Server Components and API routes
// This does NOT use "use client" directive
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mgjwlfyxfxmfappwputi.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nandsZnl4ZnhtZmFwcHdwdXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzY0ODcsImV4cCI6MjA3Nzc1MjQ4N30.O_EjyJkqpy85ibFIpB1PuEYYUpXpSCtcAAusbeTchGM",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
