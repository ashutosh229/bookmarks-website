"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { BookmarkPlus, Edit2, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import BookmarkCard from "./bookmark-card";

export default function BookmarksClient({
  initialBookmarks,
}: {
  initialBookmarks: Bookmark[];
}) {
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

    setBookmarks((prev) => [data, ...prev]); // 🚀 instant UI

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

  const handleDeleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting bookmark");
      return;
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id)); // 🚀

    toast.success("Bookmark deleted successfully");
  };

  const filteredBookmarks = useMemo(() => {
    const keyword = filterKeyword.trim().toLowerCase();

    return bookmarks.filter((bookmark) => {
      const matchesStatus =
        filterStatus === "all" || bookmark.status === filterStatus;

      const matchesKeyword =
        !keyword ||
        bookmark.title.toLowerCase().includes(keyword) ||
        bookmark.keywords.some((k) => k.toLowerCase().includes(keyword));

      return matchesStatus && matchesKeyword;
    });
  }, [bookmarks, filterStatus, filterKeyword]);

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

    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...editingBookmark, keywords } : b)),
    );

    toast.success("Bookmark updated successfully");
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  const statusColors = {
    not_visited: "bg-yellow-100 text-yellow-800",
    visited: "bg-green-100 text-green-800",
    revisit: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Bookmark Manager</h1>

          {/* Add Bookmark Dialog */}
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
              onChange={(e) => setFilterKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => {
            return (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={setEditingBookmark}
                onDelete={handleDeleteBookmark}
              ></BookmarkCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
