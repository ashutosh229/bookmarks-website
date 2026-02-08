// lib/supabase-client.ts
"use client"; // Important for client components
import { createClient } from "@supabase/supabase-js";

// Only use NEXT_PUBLIC_* env vars
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
