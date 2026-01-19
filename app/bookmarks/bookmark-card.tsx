"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit2, Trash2 } from "lucide-react";
import { Bookmark } from "@/lib/types";

type Props = {
  bookmark: Bookmark;
  onEdit: (b: Bookmark) => void;
  onDelete: (id: string) => void;
};

const BookmarkCard = React.memo(function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            {bookmark.title || bookmark.url}
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-2 mt-2">
          {bookmark.keywords.map((k) => (
            <Badge key={k} variant="secondary">
              {k}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Badge>{bookmark.status.replace("_", " ")}</Badge>
        {bookmark.comment && (
          <p className="mt-2 text-sm text-muted-foreground">
            {bookmark.comment}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button size="icon" variant="outline" onClick={() => onEdit(bookmark)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(bookmark.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
});

export default BookmarkCard;
