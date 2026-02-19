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
}

const CompanyRow = memo(function CompanyRow({
  company,
  commentValue,
  onToggle,
  onCommentChange,
  isMatch,
  rowId,
  onDelete,
}: CompanyRowProps) {
  return (
    <TableRow
      id={rowId}
      className={isMatch ? "bg-yellow-100 dark:bg-yellow-900" : ""}
    >
      <TableCell>{company.name}</TableCell>

      <TableCell>
        <Switch
          checked={company.status === "sent"}
          onCheckedChange={() => onToggle(company)}
        />
      </TableCell>

      <TableCell>
        <Textarea
          value={commentValue}
          onChange={(e) => onCommentChange(company.id, e.target.value)}
        />
      </TableCell>

      <TableCell>
        <Button
          variant="destructive"
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
