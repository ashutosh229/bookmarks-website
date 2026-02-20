import CompaniesClient from "./companies-client";
import { Suspense } from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
