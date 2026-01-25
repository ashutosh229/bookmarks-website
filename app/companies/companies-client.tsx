"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo } from "react";
import CompanyRow from "./company-row";
import debounce from "lodash.debounce";

interface Company {
  id: string;
  name: string;
  status: "sent" | "unsent";
  comments: string;
  created_at: string;
}

interface CompaniesClientProps {
  initialCompanies: Company[];
}

export default function CompaniesClient({
  initialCompanies,
}: CompaniesClientProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const companyIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    companies.forEach((c, i) => {
      map.set(c.name.toLowerCase(), i);
    });
    return map;
  }, [companies]);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: companies.length,
    getScrollElement: () => {
      return parentRef.current;
    },
    estimateSize: () => {
      return 80;
    },
  });

  const { toast } = useToast();
  /* ---------------- ADD ---------------- */

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: newCompanyName.trim(),
        status: "unsent",
        comments: "",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCompanies((prev) => [data, ...prev]);
    setNewCompanyName("");
    toast({ title: "Company added" });
  };

  /* ---------------- STATUS ---------------- */

  const toggleStatus = useCallback(async (company: Company) => {
    const newStatus = company.status === "sent" ? "unsent" : "sent";

    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, status: newStatus } : c)),
    );

    await supabase
      .from("companies")
      .update({ status: newStatus })
      .eq("id", company.id);
  }, []);

  /* ---------------- COMMENTS (DEBOUNCED) ---------------- */

  const saveAllComments = async () => {
    const updates = Object.entries(commentDrafts).map(([id, comments]) => ({
      id,
      comments,
    }));

    await supabase.from("companies").upsert(updates);
    setCommentDrafts({});
  };

  /* ---------------- SEARCH ---------------- */
  const handleSearch = useCallback(
    debounce((value: string) => {
      const index = companyIndexMap.get(value.toLowerCase());
      if (index !== undefined) {
        rowVirtualizer.scrollToIndex(index, { align: "center" });
      }
    }, 300),
    [companyIndexMap],
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">Company Tracker</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCompany} className="flex gap-2">
            <Input
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Company name"
            />
            <Button>Add</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <Input
            placeholder="Search company (exact name)..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              handleSearch(value);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracked Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={parentRef} className="h-[600px] overflow-auto">
            {" "}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const company = companies[virtualRow.index];
                  const isMatch =
                    search &&
                    company.name.toLowerCase() === search.toLowerCase();
                  return (
                    <CompanyRow
                      key={company.id}
                      isMatch={isMatch}
                      company={company}
                      commentValue={
                        commentDrafts[company.id] ?? company.comments
                      }
                      onToggle={toggleStatus}
                      onCommentChange={(id, value) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [id]: value,
                        }))
                      }
                    ></CompanyRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
