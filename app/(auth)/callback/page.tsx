"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      // Supabase sends token in URL query: ?access_token=...
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token") || "";

      if (!accessToken) {
        alert("No access token found in URL!");
        return;
      }

      // Set the session manually
      const { data, error } = await supabaseClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/dashboard"); // redirect after successful login
    };

    handleRedirect();
  }, [router, searchParams]);

  return <div>Confirming your email...</div>;
}
