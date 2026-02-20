"use client";

import CompaniesClient from "./companies-client";
import { Suspense } from "react";
import AuthGuard from "@/components/AuthGuard";
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

export default function CompaniesPage() {
  const [initialCompanies, setInitialCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error: fetchError } = await supabaseClient
          .from("companies")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setInitialCompanies(data ?? []);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <AuthGuard>
      {loading ? (
        <div className="p-6">Loading companies...</div>
      ) : error ? (
        <div className="p-6 text-red-600">Error: {error}</div>
      ) : (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <CompaniesClient initialCompanies={initialCompanies} />
        </Suspense>
      )}
    </AuthGuard>
  );
}
