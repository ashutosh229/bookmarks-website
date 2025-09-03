import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wqcobszqfbcmjfgbshmr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxY29ic3pxZmJjbWpmZ2JzaG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjQ5NDgsImV4cCI6MjA1NzY0MDk0OH0.VEKkiARaCcwZapJxRaqbfuYIBjDdkhIRSpvjTv-5dSc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
