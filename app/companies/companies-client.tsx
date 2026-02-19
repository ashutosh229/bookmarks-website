"use client";

import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase-client";
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
  const [matchIndices, setMatchIndices] = useState<number[]>([]);
  const [currentMatchPointer, setCurrentMatchPointer] = useState<number>(-1);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [search, setSearch] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  /* ---------------- DELETE ---------------- */
  const handleDeleteCompany = useCallback(
    async (id: string) => {
      if (!id) return;
      const { error } = await supabaseClient
        .from("companies")
        .delete()
        .eq("id", id);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Company deleted" });
    },
    [toast],
  );
  /* ---------------- ADD ---------------- */

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const { data, error } = await supabaseClient
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

    await supabaseClient
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

    await supabaseClient.from("companies").upsert(updates);
    setCommentDrafts({});
  };

  /* ---------------- SEARCH ---------------- */
  const handleSearch = useCallback(
    debounce((value: string) => {
      const valueLower = value.toLowerCase();
      if (!valueLower) {
        setMatchIndices([]);
        setCurrentMatchPointer(-1);
        return;
      }

      const matches = companies
        .map((c, idx) => ({ c, idx }))
        .filter(({ c }) => c.name.toLowerCase().includes(valueLower))
        .map(({ idx }) => idx);

      setMatchIndices(matches);
      if (matches.length > 0) {
        setCurrentMatchPointer(0);
        const company = companies[matches[0]];
        const el = document.getElementById(`company-${company.id}`);
        if (el && parentRef.current) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setCurrentMatchPointer(-1);
      }
    }, 300),
    [companies],
  );

  const goToMatch = useCallback(
    (pointer: number) => {
      if (matchIndices.length === 0) return;
      const wrapped =
        ((pointer % matchIndices.length) + matchIndices.length) %
        matchIndices.length;
      setCurrentMatchPointer(wrapped);
      const company = companies[matchIndices[wrapped]];
      const el = document.getElementById(`company-${company.id}`);
      if (el && parentRef.current)
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [matchIndices, companies],
  );

  const goToNextMatch = useCallback(
    () => goToMatch(currentMatchPointer + 1),
    [goToMatch, currentMatchPointer],
  );
  const goToPrevMatch = useCallback(
    () => goToMatch(currentMatchPointer - 1),
    [goToMatch, currentMatchPointer],
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">Company Tracker</h1>

      {/* Add/Search will appear inside the scrollable list and stick to its top */}

      <Card>
        <CardHeader>
          <CardTitle>Tracked Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={parentRef} className="h-[600px] overflow-auto">
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm py-2">
              <div className="container mx-auto px-4 max-w-4xl">
                <Card className="mb-2">
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

                <Card>
                  <CardContent className="pt-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Search company (partial match)..."
                        value={search}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearch(value);
                          handleSearch(value);
                        }}
                      />

                      {matchIndices.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={goToPrevMatch}
                            className="px-2 py-1 bg-slate-100 rounded"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={goToNextMatch}
                            className="px-2 py-1 bg-slate-100 rounded"
                          >
                            ▶
                          </button>
                          <div className="text-sm text-slate-600">
                            {currentMatchPointer + 1}/{matchIndices.length}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {companies.map((company, idx) => {
                  const isMatch =
                    search &&
                    company.name.toLowerCase().includes(search.toLowerCase());
                  const matchOrder = matchIndices.indexOf(idx);
                  const isCurrent =
                    matchOrder !== -1 && matchOrder === currentMatchPointer;
                  return (
                    <CompanyRow
                      key={company.id}
                      rowId={`company-${company.id}`}
                      isMatch={isMatch}
                      matchOrder={matchOrder !== -1 ? matchOrder : undefined}
                      isCurrent={isCurrent}
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
                      onDelete={handleDeleteCompany}
                    />
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
