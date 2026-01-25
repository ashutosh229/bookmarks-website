"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import debounce from "lodash.debounce";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

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
  const [newCompanyName, setNewCompanyName] = useState("");
  const { toast } = useToast();

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

  const toggleStatus = async (company: Company) => {
    const newStatus = company.status === "sent" ? "unsent" : "sent";

    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, status: newStatus } : c)),
    );

    await supabase
      .from("companies")
      .update({ status: newStatus })
      .eq("id", company.id);
  };

  /* ---------------- COMMENTS (DEBOUNCED) ---------------- */

  const saveComments = useCallback(
    debounce(async (id: string, comments: string) => {
      await supabase.from("companies").update({ comments }).eq("id", id);
    }, 600),
    [],
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
                  return (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={company.status === "sent"}
                          onCheckedChange={() => toggleStatus(company)}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          defaultValue={company.comments}
                          onChange={(e) =>
                            saveComments(company.id, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
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
