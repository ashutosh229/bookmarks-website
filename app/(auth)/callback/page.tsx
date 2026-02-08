"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token") || "";

      if (!accessToken) {
        alert("No access token found in URL!");
        return;
      }

      const { error } = await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      router.push("/dashboard");
    };

    handleRedirect();
  }, [router, searchParams]);

  return <div className="p-4 text-center">Confirming your email...</div>;
}
