"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Bookmark } from "@/lib/types";
import { BookmarkPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import BookmarkCard from "./bookmark-card";
import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 20;

export default function BookmarksClient({
  initialBookmarks,
  totalCount,
  initialPage,
}: {
  initialBookmarks: Bookmark[];
  totalCount: number;
  initialPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [newBookmark, setNewBookmark] = useState<{
    url: string;
    title: string;
    keywords: string;
    comment: string;
    status: "not_visited" | "visited" | "revisit";
  }>({
    url: "",
    title: "",
    keywords: "",
    comment: "",
    status: "not_visited",
  });

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get("status") || "all",
  );
  const [filterKeyword, setFilterKeyword] = useState(
    searchParams.get("q") || "",
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Read current page from URL
  const currentPage = Number(searchParams.get("page") || "0");

  // Sync bookmarks whenever server re-renders
  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  // Sync filter states with URL params
  useEffect(() => {
    setFilterStatus(searchParams.get("status") || "all");
    setFilterKeyword(searchParams.get("q") || "");
  }, [searchParams]);

  // Add bookmark
  const handleAddBookmark = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newBookmark.url.trim()) {
      toast.error("URL is required");
      return;
    }

    const keywords = newBookmark.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("bookmarks")
      .insert([{ ...newBookmark, keywords }])
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // Refresh the page to get updated data from server
    router.refresh();
    toast.success("Bookmark added successfully");

    setNewBookmark({
      url: "",
      title: "",
      keywords: "",
      comment: "",
      status: "not_visited",
    });
    setIsAddDialogOpen(false);
  };

  // Delete bookmark
  const handleDeleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting bookmark");
      return;
    }

    // Refresh the page to get updated data from server
    router.refresh();
    toast.success("Bookmark deleted successfully");
  };

  // Update bookmark
  const handleUpdateBookmark = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingBookmark?.id) return;

    const keywords = editingBookmark.keywords
      .map((k) => k.trim())
      .filter(Boolean);

    const { id, ...rest } = editingBookmark;

    const { error } = await supabase
      .from("bookmarks")
      .update({ ...rest, keywords })
      .eq("id", id);

    if (error) {
      toast.error("Error updating bookmark");
      return;
    }

    // Refresh the page to get updated data from server
    router.refresh();
    toast.success("Bookmark updated successfully");
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  // Apply filters
  const applyFilters = (status: string, keyword: string) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (keyword) params.set("q", keyword);
    params.set("page", "0"); // reset page on filter change
    router.push(`/bookmarks?${params.toString()}`);
  };

  // Apply pagination
  const applyPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/bookmarks?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header + Add Dialog */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Bookmark Manager</h1>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Add Bookmark
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddBookmark}>
                <DialogHeader>
                  <DialogTitle>Add New Bookmark</DialogTitle>
                  <DialogDescription>
                    Add a new bookmark with URL, title, and additional
                    information.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={newBookmark.url}
                      onChange={(e) =>
                        setNewBookmark({ ...newBookmark, url: e.target.value })
                      }
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newBookmark.title}
                      onChange={(e) =>
                        setNewBookmark({
                          ...newBookmark,
                          title: e.target.value,
                        })
                      }
                      placeholder="Bookmark Title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={newBookmark.keywords}
                      onChange={(e) =>
                        setNewBookmark({
                          ...newBookmark,
                          keywords: e.target.value,
                        })
                      }
                      placeholder="tech, article, tutorial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      value={newBookmark.comment}
                      onChange={(e) =>
                        setNewBookmark({
                          ...newBookmark,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Add your notes here..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newBookmark.status}
                      onValueChange={(
                        value: "not_visited" | "visited" | "revisit",
                      ) => setNewBookmark({ ...newBookmark, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_visited">Not Visited</SelectItem>
                        <SelectItem value="visited">Visited</SelectItem>
                        <SelectItem value="revisit">Revisit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Add Bookmark</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="w-48">
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                applyFilters(value, filterKeyword);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not_visited">Not Visited</SelectItem>
                <SelectItem value="visited">Visited</SelectItem>
                <SelectItem value="revisit">Revisit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Filter by keyword..."
              value={filterKeyword}
              onChange={(e) => {
                setFilterKeyword(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters(filterStatus, filterKeyword);
                }
              }}
            />
          </div>
          <Button
            onClick={() => applyFilters(filterStatus, filterKeyword)}
            variant="secondary"
          >
            Apply
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {bookmarks.length} of {totalCount} bookmarks
          {currentPage > 0 && ` (Page ${currentPage + 1} of ${totalPages})`}
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No bookmarks found. Add your first bookmark to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={(b) => {
                  setEditingBookmark(b);
                  setIsEditDialogOpen(true);
                }}
                onDelete={handleDeleteBookmark}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              disabled={currentPage === 0}
              onClick={() => applyPage(currentPage - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              disabled={currentPage + 1 >= totalPages}
              onClick={() => applyPage(currentPage + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          {editingBookmark && (
            <form onSubmit={handleUpdateBookmark}>
              <DialogHeader>
                <DialogTitle>Edit Bookmark</DialogTitle>
                <DialogDescription>Update bookmark details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-url">URL</Label>
                  <Input
                    id="edit-url"
                    value={editingBookmark.url}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        url: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingBookmark.title}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-keywords">
                    Keywords (comma separated)
                  </Label>
                  <Input
                    id="edit-keywords"
                    value={editingBookmark.keywords.join(", ")}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-comment">Comment</Label>
                  <Textarea
                    id="edit-comment"
                    value={editingBookmark.comment || ""}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        comment: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingBookmark.status}
                    onValueChange={(
                      value: "not_visited" | "visited" | "revisit",
                    ) =>
                      setEditingBookmark({ ...editingBookmark, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_visited">Not Visited</SelectItem>
                      <SelectItem value="visited">Visited</SelectItem>
                      <SelectItem value="revisit">Revisit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
