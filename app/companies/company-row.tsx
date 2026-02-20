"use client";

import { memo } from "react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  name: string;
  status: "sent" | "unsent";
  comments: string;
  created_at: string;
}

interface CompanyRowProps {
  company: Company;
  commentValue: string;
  onToggle: (company: Company) => Promise<void>;
  onCommentChange: (id: string, value: string) => void;
  isMatch: boolean | string;
  rowId?: string;
  onDelete?: (id: string) => Promise<void> | void;
  matchOrder?: number; // zero-based order among matches
  isCurrent?: boolean;
}

const CompanyRow = memo(function CompanyRow({
  company,
  commentValue,
  onToggle,
  onCommentChange,
  isMatch,
  rowId,
  onDelete,
  matchOrder,
  isCurrent,
}: CompanyRowProps) {
  return (
    <TableRow
      id={rowId}
      className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
        isCurrent
          ? "bg-indigo-50 dark:bg-indigo-900"
          : isMatch
            ? "bg-yellow-50 dark:bg-yellow-900"
            : ""
      }`}
    >
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{company.name}</span>
          <span className="text-xs text-slate-500 mt-0.5">
            {new Date(company.created_at).toLocaleDateString()}
          </span>
        </div>
      </TableCell>

      {typeof matchOrder === "number" && matchOrder >= 0 && (
        <TableCell>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100">
            {matchOrder + 1}
          </span>
        </TableCell>
      )}

      <TableCell>
        <Switch
          checked={company.status === "sent"}
          onCheckedChange={() => onToggle(company)}
        />
      </TableCell>

      <TableCell>
        <Textarea
          className="h-20"
          value={commentValue}
          onChange={(e) => onCommentChange(company.id, e.target.value)}
        />
      </TableCell>

      <TableCell>
        <Button
          variant="destructive"
          className="text-sm px-2"
          onClick={() => {
            if (typeof onDelete === "function") {
              if (confirm(`Delete ${company.name}?`)) {
                onDelete(company.id);
              }
            }
          }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
});

export default CompanyRow;
