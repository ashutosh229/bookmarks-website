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
  const [newBookmark, setNewBookmark] = useState({
    url: "",
    title: "",
    keywords: "",
    comment: "",
    status: "not_visited" as const,
  });

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // read current page from URL
  const page = Number(searchParams.get("page") || 0);

  // sync bookmarks whenever server re-renders
  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

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

    if (error) return toast.error(error.message);

    setBookmarks((prev) => [data, ...prev]);
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
    if (error) return toast.error("Error deleting bookmark");

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
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

    if (error) return toast.error("Error updating bookmark");

    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...editingBookmark, keywords } : b)),
    );

    toast.success("Bookmark updated successfully");
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  // Apply filters
  const applyFilters = (status: string, keyword: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "all") params.set("status", status);
    else params.delete("status");
    if (keyword) params.set("q", keyword);
    else params.delete("q");
    params.set("page", "0"); // reset page on filter change
    router.push(`/bookmarks?${params.toString()}`);
  };

  // Apply pagination
  const applyPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/bookmarks?${params.toString()}`);
  };

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

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={newBookmark.url}
                      onChange={(e) =>
                        setNewBookmark({ ...newBookmark, url: e.target.value })
                      }
                      placeholder="https://example.com"
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
                applyFilters(filterStatus, e.target.value);
              }}
            />
          </div>
        </div>

        {/* Bookmarks List */}
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

        {/* Pagination */}
        <div className="flex justify-center gap-4 mt-8">
          <Button disabled={page === 0} onClick={() => applyPage(page - 1)}>
            Previous
          </Button>
          <Button
            disabled={(page + 1) * PAGE_SIZE >= totalCount}
            onClick={() => applyPage(page + 1)}
          >
            Next
          </Button>
        </div>
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

              <div className="space-y-4">
                <div>
                  <Label>URL</Label>
                  <Input
                    value={editingBookmark.url}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        url: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
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
                  <Label>Keywords (comma separated)</Label>
                  <Input
                    value={editingBookmark.keywords.join(", ")}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim()),
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Comment</Label>
                  <Textarea
                    value={editingBookmark.comment || ""}
                    onChange={(e) =>
                      setEditingBookmark({
                        ...editingBookmark,
                        comment: e.target.value,
                      })
                    }
                  />
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
