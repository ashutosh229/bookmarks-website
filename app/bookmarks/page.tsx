import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 60;

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: {
    page?: number;
    status?: string;
    q?: string;
  };
}) {
  const PAGE_SIZE = 20;
  const page = Number(searchParams.page || 0);
  const from = page * PAGE_SIZE;
  const to = (page + 1) * PAGE_SIZE - 1;

  let query = supabase
    .from("bookmarks")
    .select("*", { count: "exact" }) // get total count
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,keywords.cs.{${searchParams.q}}`,
    );
  }

  const { data, count } = await query;

  return (
    <BookmarksClient
      initialBookmarks={data ?? []}
      totalCount={count ?? 0} // pass total count for pagination
      initialPage={page} // pass current page
    />
  );
}
