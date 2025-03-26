"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { BookmarkPlus, ExternalLink, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";



export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
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

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching bookmarks");
      return;
    }

    setBookmarks(data || []);
  };

  const handleAddBookmark = async () => {
    const keywords = newBookmark.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    const { error } = await supabase.from("bookmarks").insert([
      {
        ...newBookmark,
        keywords,
      },
    ]);

    if (error) {
      toast.error("Error adding bookmark");
      return;
    }

    toast.success("Bookmark added successfully");
    setNewBookmark({
      url: "",
      title: "",
      keywords: "",
      comment: "",
      status: "not_visited",
    });
    fetchBookmarks();
  };

  const handleDeleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting bookmark");
      return;
    }

    toast.success("Bookmark deleted successfully");
    fetchBookmarks();
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesStatus =
      filterStatus === "all" || bookmark.status === filterStatus;
    const matchesKeyword =
      !filterKeyword ||
      bookmark.keywords.some((k) =>
        k.toLowerCase().includes(filterKeyword.toLowerCase())
      ) ||
      bookmark.title.toLowerCase().includes(filterKeyword.toLowerCase());
    return matchesStatus && matchesKeyword;
  });

  const handleUpdateBookmark = async () => {
    if (!editingBookmark || !editingBookmark.id) {
      toast.error("Invalid bookmark data");
      return;
    }

    // const keywords = editingBookmark.keywords
    //   .join(",")
    //   .split(",")
    //   .map((k) => k.trim())
    //   .filter((k) => k);

    const keywords = editingBookmark.keywords
      .map((k) => k.trim())
      .filter((k) => k);

    const { id, ...updateFields } = editingBookmark;
    const { error } = await supabase
      .from("bookmarks")
      .update({
        ...updateFields,
        keywords,
      })
      .eq("id", id);

    if (error) {
      console.error();
      toast.error("Error updating bookmark");
      return;
    }

    toast.success("Bookmark updated successfully");
    setEditingBookmark(null);
    fetchBookmarks();
  };

  const statusColors = {
    not_visited: "bg-yellow-100 text-yellow-800",
    visited: "bg-green-100 text-green-800",
    revisit: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bookmark Manager
          </h1>

          {/* Add Bookmark Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Add Bookmark
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                      setNewBookmark({ ...newBookmark, title: e.target.value })
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
                <Button onClick={handleAddBookmark}>Add Bookmark</Button>
              </DialogFooter>
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
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    {bookmark.title || bookmark.url}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bookmark.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className={statusColors[bookmark.status]}>
                  {bookmark.status.replace("_", " ")}
                </Badge>
                {bookmark.comment && (
                  <p className="mt-2 text-sm text-gray-600">
                    {bookmark.comment}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setEditingBookmark(bookmark)}
                      variant="outline"
                      size="icon"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Bookmark</DialogTitle>
                    </DialogHeader>
                    {editingBookmark && (
                      <div className="space-y-4">
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
                          <Label htmlFor="edit-status">Status</Label>
                          <Select
                            value={editingBookmark.status}
                            onValueChange={(
                              value: "not_visited" | "visited" | "revisit"
                            ) =>
                              setEditingBookmark({
                                ...editingBookmark,
                                status: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_visited">
                                Not Visited
                              </SelectItem>
                              <SelectItem value="visited">Visited</SelectItem>
                              <SelectItem value="revisit">Revisit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-keywords">
                            Keywords (comma-separated)
                          </Label>
                          <Input
                            id="edit-keywords"
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
                          <Label htmlFor="edit-comment">Comment</Label>
                          <Textarea
                            id="edit-comment"
                            value={editingBookmark.comment}
                            onChange={(e) =>
                              setEditingBookmark({
                                ...editingBookmark,
                                comment: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button onClick={handleUpdateBookmark}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this bookmark? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
