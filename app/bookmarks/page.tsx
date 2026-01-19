"use client";

import { supabase } from "@/lib/supabase";
import BookmarksClient from "./bookmarks-client";

export const revalidate = 60;

export default async function BookmarksPage() {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error(error);
  }
  return <BookmarksClient initialBookmarks={data ?? []}></BookmarksClient>;
}
