import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 60;

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    q?: string;
  };
}) {
  let query = supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,keywords.cs.{${searchParams.q}}`,
    );
  }
  const { data } = await query;
  return <BookmarksClient initialBookmarks={data ?? []}></BookmarksClient>;
}
