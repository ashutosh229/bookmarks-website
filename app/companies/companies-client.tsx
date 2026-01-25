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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.status === "sent"}
                      onCheckedChange={() => toggleStatus(c)}
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      defaultValue={c.comments}
                      onChange={(e) => saveComments(c.id, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
