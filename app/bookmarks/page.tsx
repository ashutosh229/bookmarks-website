import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{
        page?: string;
        status?: string;
        q?: string;
      }>
    | {
        page?: string;
        status?: string;
        q?: string;
      };
}) {
  // Await searchParams if it's a promise (Next.js 15+)
  const params =
    searchParams instanceof Promise ? await searchParams : searchParams;

  const page = Number(params?.page ?? "0");
  const offset = page * PAGE_SIZE;

  let query = supabase
    .from("bookmarks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // ✅ Apply status filter
  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params?.q && params.q.trim() !== "") {
    const searchTerm = params.q.trim();
    const safeTerm = searchTerm.replace(/,/g, "");
    const lowerKeyword = safeTerm.toLowerCase();

    const searchFilter =
      `title.ilike.%${safeTerm}%` +
      `,comments.ilike.%${safeTerm}%` +
      `,keywords.cs.{${lowerKeyword}}`;

    query = query.or(searchFilter);
  }

  // ✅ Apply pagination
  const { data, count, error } = await query.range(
    offset,
    offset + PAGE_SIZE - 1,
  );

  if (error) {
    console.log("Error fetching the bookmarks:", error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Error loading bookmarks. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookmarksClient
      initialBookmarks={data ?? []}
      totalCount={count ?? 0}
      initialPage={page}
    />
  );
}
