"use client";

import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
  };

  return (
    <button onClick={logout} className="text-sm underline">
      Logout
    </button>
  );
}
