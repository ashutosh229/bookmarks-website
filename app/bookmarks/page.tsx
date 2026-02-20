"use client";

import BookmarksClient from "./bookmarks-client";
import AuthGuard from "@/components/AuthGuard";
import { supabaseClient } from "@/lib/supabase-client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/app/providers";

const PAGE_SIZE = 20;

function BookmarksContentInner() {
  const { user } = useAuth() as any;
  const searchParams = useSearchParams();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get("page") ?? "0");
  const status = searchParams.get("status") ?? "all";
  const q = searchParams.get("q") ?? "";

  useEffect(() => {
    fetchBookmarks();
  }, [page, status, q]);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      setError(null);

      const offset = page * PAGE_SIZE;

      if (!user) return;

      let query = supabaseClient
        .from("bookmarks")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // ✅ Apply status filter
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      if (q && q.trim() !== "") {
        const searchTerm = q.trim();
        const safeTerm = searchTerm.replace(/,/g, "");
        const lowerKeyword = safeTerm.toLowerCase();

        const searchFilter =
          `title.ilike.%${safeTerm}%` +
          `,comment.ilike.%${safeTerm}%` +
          `,keywords.cs.{${lowerKeyword}}`;

        query = query.or(searchFilter);
      }

      // ✅ Apply pagination
      const {
        data,
        count,
        error: fetchError,
      } = await query.range(offset, offset + PAGE_SIZE - 1);

      if (fetchError) {
        console.log("Error fetching the bookmarks:", fetchError);
        setError("Error loading bookmarks. Please try again later.");
        return;
      }

      setBookmarks(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Error loading bookmarks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookmarksClient
      initialBookmarks={bookmarks}
      totalCount={totalCount}
      initialPage={page}
    />
  );
}

function BookmarksContent() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center py-12">
                <p className="text-gray-500">Loading bookmarks...</p>
              </div>
            </div>
          </div>
        }
      >
        <BookmarksContentInner />
      </Suspense>
    </AuthGuard>
  );
}

export default function BookmarksPage() {
  return <BookmarksContent />;
}
