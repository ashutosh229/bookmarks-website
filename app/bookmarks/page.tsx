import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 60;
export const dynamic = "force-dynamic"; // ensures server re-renders on each request

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    status?: string;
    q?: string;
  };
}) {
  const PAGE_SIZE = 20;
  const page = Number(searchParams?.page ?? "0");
  const offset = page * PAGE_SIZE;

  let query = supabase
    .from("bookmarks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply status filter
  if (searchParams?.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }

  // Apply keyword search filter
  if (searchParams?.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,keywords.cs.{${searchParams.q}}`,
    );
  }

  // Use offset + limit for pagination
  const { data, count } = await query.range(offset, offset + PAGE_SIZE - 1);

  return (
    <BookmarksClient
      initialBookmarks={data ?? []}
      totalCount={count ?? 0}
      initialPage={page}
    />
  );
}
