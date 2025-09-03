"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for a company object to ensure type safety.
interface Company {
  id: string;
  name: string;
  status: "sent" | "unsent";
  comments: string;
  created_at: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data, error } = await supabase.from("companies").select("*");
    if (error) {
      console.error("Error fetching companies:", error);
      return;
    }
    setCompanies(data as Company[]);
  };

  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a company name.",
        variant: "destructive",
      });
      return;
    }

    const companyExists = companies.some(
      (company) => company.name.toLowerCase() === newCompanyName.toLowerCase()
    );

    if (companyExists) {
      toast({
        title: "Company Already Exists",
        description: `${newCompanyName} is already in the list.`,
        variant: "destructive", // Changed to a valid variant
      });
      setNewCompanyName("");
      return;
    }

    const { error } = await supabase.from("companies").insert({
      name: newCompanyName.trim(),
      status: "unsent",
      comments: "",
    });

    if (error) {
      console.error("Error adding company:", error);
      toast({
        title: "Error",
        description: "Failed to add company.",
        variant: "destructive",
      });
      return;
    }

    setNewCompanyName("");
    fetchCompanies();
    toast({
      title: "Success",
      description: `${newCompanyName} has been added.`,
    });
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "sent" ? "unsent" : "sent";
    const { error } = await supabase
      .from("companies")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    fetchCompanies();
    toast({
      title: "Status Updated",
      description: "The company status has been updated.",
    });
  };

  const handleUpdateComments = async (id: string, comments: string) => {
    const { error } = await supabase
      .from("companies")
      .update({ comments })
      .eq("id", id);

    if (error) {
      console.error("Error updating comments:", error);
      return;
    }

    fetchCompanies();
    toast({
      title: "Comments Updated",
      description: "The comments have been saved.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6">Company Tracker</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCompany} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter company name..."
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Add Company</Button>
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
                <TableHead className="w-[200px]">Company Name</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`status-switch-${company.id}`}
                        checked={company.status === "sent"}
                        onCheckedChange={() =>
                          handleUpdateStatus(company.id, company.status)
                        }
                      />
                      <Label htmlFor={`status-switch-${company.id}`}>
                        {company.status === "sent" ? "Sent" : "Unsent"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Add comments here..."
                      defaultValue={company.comments}
                      onBlur={(e) =>
                        handleUpdateComments(company.id, e.target.value)
                      }
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
