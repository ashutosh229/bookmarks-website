import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 0; // Disable caching
export const dynamic = "force-dynamic"; // Ensures server re-renders on each request

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

  // Apply status filter
  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Apply keyword search filter - improved to search across all keywords
  if (params?.q) {
    const keyword = params.q.trim().toLowerCase();

    // Fetch all bookmarks first (with status filter applied if any)
    const { data: allData, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching bookmarks:", fetchError);
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

    // Filter in memory to check if search term matches any keyword or title
    const filteredData = (allData ?? []).filter((bookmark) => {
      // Check if title contains the search term
      const titleMatch = bookmark.title?.toLowerCase().includes(keyword);

      // Check if any keyword contains the search term
      const keywordMatch = bookmark.keywords.some((k: string) =>
        k.toLowerCase().includes(keyword),
      );

      return titleMatch || keywordMatch;
    });

    // Apply pagination manually
    const paginatedData = filteredData.slice(offset, offset + PAGE_SIZE);

    return (
      <BookmarksClient
        initialBookmarks={paginatedData}
        totalCount={filteredData.length}
        initialPage={page}
      />
    );
  }

  // Apply pagination using range (when no keyword filter)
  const { data, count, error } = await query.range(
    offset,
    offset + PAGE_SIZE - 1,
  );

  if (error) {
    console.error("Error fetching bookmarks:", error);
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
