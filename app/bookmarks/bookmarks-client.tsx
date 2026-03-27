"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

import { supabaseClient } from "@/lib/supabase-client";
import { Bookmark } from "@/lib/types";
import { useAuth } from "@/app/providers";
import BookmarkCard from "./bookmark-card";

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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookmarkPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";

const PAGE_SIZE = 20;

export default function BookmarksClient({
  initialBookmarks,
  totalCount,
  initialPage,
  refetchBookmarks,
}: {
  initialBookmarks: Bookmark[];
  totalCount: number;
  initialPage: number;
  refetchBookmarks: () => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth() as any;

  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [editKeywordInput, setEditKeywordInput] = useState("");
  const [newBookmark, setNewBookmark] = useState<{
    url: string;
    title: string;
    keywords: string[];
    keywordInput: string;
    comment: string;
    status: "not_visited" | "visited" | "revisit";
  }>({
    url: "",
    title: "",
    keywords: [],
    keywordInput: "",
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
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Read current page from URL
  const currentPage = Number(searchParams.get("page") || "0");

  const fetchKeywords = async () => {
    const { data, error } = await supabaseClient.rpc("get_distinct_keywords");
    if (error) {
      toast.error("Error fetching keywords");
      return;
    }
    setAllKeywords(data || []);
  };

  // Sync bookmarks whenever server re-renders
  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  // Fetching all distinct keywords from database
  useEffect(() => {
    fetchKeywords();
  }, []);

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
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const { keywordInput, ...rest } = newBookmark;

    const { data, error } = await supabaseClient
      .from("bookmarks")
      .insert([
        {
          ...rest,
          keywords,
          user_id: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // Refresh the page to get updated data from server
    await refetchBookmarks();
    await fetchKeywords();
    toast.success("Bookmark added successfully");

    setNewBookmark({
      url: "",
      title: "",
      keywords: [],
      keywordInput: "",
      comment: "",
      status: "not_visited",
    });
    setIsAddDialogOpen(false);
  };

  // Delete bookmark
  const handleDeleteBookmark = async (id: string) => {
    const { error } = await supabaseClient
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);
    if (error) {
      toast.error("Error deleting bookmark");
      return;
    }

    // Refresh the page to get updated data from server
    await refetchBookmarks();
    await fetchKeywords();
    toast.success("Bookmark deleted successfully");
  };

  // Update bookmark
  const handleUpdateBookmark = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingBookmark?.id) return;

    const keywords = editingBookmark.keywords
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const { id, ...rest } = editingBookmark;

    const { error } = await supabaseClient
      .from("bookmarks")
      .update({ ...rest, keywords })
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) {
      toast.error("Error updating bookmark");
      return;
    }

    // Refresh the page to get updated data from server
    await refetchBookmarks();
    await fetchKeywords();
    toast.success("Bookmark updated successfully");
    setEditingBookmark(null);
    setIsEditDialogOpen(false);
  };

  // Apply filters
  const applyFilters = (
    status: string,
    keyword: string,
    keywords: string[],
  ) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (keyword) params.set("q", keyword);
    if (keywords.length > 0) {
      params.set("keywords", keywords.join(","));
    }
    params.set("page", "0");
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
                    <div>
                      <Label>Keywords</Label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {newBookmark.keywords.map((k) => (
                          <Badge key={k} variant="secondary">
                            {k}
                          </Badge>
                        ))}
                      </div>

                      <Input
                        value={newBookmark.keywordInput}
                        placeholder="Type keyword and press Enter"
                        onChange={(e) =>
                          setNewBookmark({
                            ...newBookmark,
                            keywordInput: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();

                          const newKeyword = newBookmark.keywordInput
                            .trim()
                            .toLowerCase();
                          if (!newKeyword) return;

                          if (!newBookmark.keywords.includes(newKeyword)) {
                            setNewBookmark((prev) => ({
                              ...prev,
                              keywords: [...prev.keywords, newKeyword].sort(),
                              keywordInput: "",
                            }));
                          }
                        }}
                      />
                    </div>
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
                applyFilters(value, filterKeyword, selectedKeywords);
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
                  applyFilters(filterStatus, filterKeyword, selectedKeywords);
                }
              }}
            />
          </div>
          <div className="w-64">
            <div className="w-64">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedKeywords.map((k) => (
                  <Badge
                    key={k}
                    variant="secondary"
                    className="flex gap-1 items-center"
                  >
                    {k}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedKeywords((prev) =>
                          prev.filter((kw) => kw !== k),
                        )
                      }
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="w-64">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedKeywords.map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="flex gap-1 items-center"
                    >
                      {k}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedKeywords((prev) =>
                            prev.filter((kw) => kw !== k),
                          )
                        }
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select keywords
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-64 p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search keywords..."
                        value={keywordSearch}
                        onValueChange={setKeywordSearch}
                      />

                      <CommandList>
                        <CommandEmpty>No keywords found</CommandEmpty>

                        <CommandGroup>
                          {allKeywords
                            .filter((k) =>
                              k
                                .toLowerCase()
                                .includes(keywordSearch.toLowerCase()),
                            )
                            .map((k) => {
                              const isSelected = selectedKeywords.includes(k);

                              return (
                                <CommandItem
                                  key={k}
                                  onSelect={() => {
                                    setSelectedKeywords((prev) => {
                                      if (prev.includes(k)) {
                                        return prev.filter((kw) => kw !== k);
                                      }
                                      return [...prev, k];
                                    });
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      isSelected ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {k}
                                </CommandItem>
                              );
                            })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <Button
            onClick={() =>
              applyFilters(filterStatus, filterKeyword, selectedKeywords)
            }
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
                  <div>
                    <Label>Keywords</Label>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingBookmark.keywords.map((k) => (
                        <Badge
                          key={k}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {k}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBookmark({
                                ...editingBookmark,
                                keywords: editingBookmark.keywords.filter(
                                  (kw) => kw !== k,
                                ),
                              });
                            }}
                          >
                            ✕
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <Input
                      value={editKeywordInput}
                      placeholder="Type keyword and press Enter"
                      onChange={(e) => setEditKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();

                        const newKeyword = editKeywordInput
                          .trim()
                          .toLowerCase();
                        if (!newKeyword) return;

                        if (!editingBookmark.keywords.includes(newKeyword)) {
                          setEditingBookmark((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              keywords: [...prev.keywords, newKeyword].sort(),
                            };
                          });
                        }

                        setEditKeywordInput("");
                      }}
                    />
                  </div>
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
