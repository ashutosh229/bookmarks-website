import { supabase } from "@/lib/supabase";
import CompaniesClient from "./companies-client";
import { Suspense } from "react";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return <div>Failed to load companies</div>;
  }

  return (
    <Suspense fallback={<></>}>
      <CompaniesClient initialCompanies={data ?? []} />
    </Suspense>
  );
}
