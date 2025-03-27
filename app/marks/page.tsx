"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { ExamRecord } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ExamMarksTracker() {
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [newRecord, setNewRecord] = useState<ExamRecord>({
    course: "",
    examType: "",
    marks: 0,
    weightage: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from("exam_records").select("*");
    if (!error) setRecords(data || []);
  };

  const addRecord = async () => {
    const { error } = await supabase.from("exam_records").insert([newRecord]);
    if (!error) {
      setIsDialogOpen(false); // Close the dialog
      setNewRecord({ course: "", examType: "", marks: 0, weightage: 0 });
      fetchRecords(); // Reload the records
    }
  };

  const calculateTotalPercentage = (course: string) => {
    const courseRecords = records.filter((rec) => rec.course === course);
    return courseRecords.reduce(
      (total, rec) => total + rec.marks * (rec.weightage / 100),
      0
    );
  };

  const filteredRecords = filter
    ? records.filter((rec) => rec.course === filter)
    : records;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Add Record Button + Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Add New Record</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Course Name"
              value={newRecord.course}
              onChange={(e) =>
                setNewRecord({ ...newRecord, course: e.target.value })
              }
            />
            <Input
              placeholder="Exam Type"
              value={newRecord.examType}
              onChange={(e) =>
                setNewRecord({ ...newRecord, examType: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Marks"
              value={newRecord.marks}
              onChange={(e) =>
                setNewRecord({ ...newRecord, marks: Number(e.target.value) })
              }
            />
            <Input
              type="number"
              placeholder="Weightage (%)"
              value={newRecord.weightage}
              onChange={(e) =>
                setNewRecord({
                  ...newRecord,
                  weightage: Number(e.target.value),
                })
              }
            />
            <Button onClick={addRecord}>Save Record</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dropdown */}
      <Select onValueChange={setFilter} value={filter || "all"}>
        <SelectTrigger className="w-full">Filter by Course</SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {Array.from(new Set(records.map((rec) => rec.course))).map(
            (course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      {/* Exam Records List */}
      {filteredRecords.map((rec, index) => (
        <Card key={rec.id || index}>
          <CardContent className="p-4 space-y-2">
            <p>
              <strong>Course:</strong> {rec.course}
            </p>
            <p>
              <strong>Exam Type:</strong> {rec.examType}
            </p>
            <p>
              <strong>Marks:</strong> {rec.marks}
            </p>
            <p>
              <strong>Weightage:</strong> {rec.weightage}%
            </p>
            <p>
              <strong>Percentage:</strong>{" "}
              {((rec.marks * rec.weightage) / 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Total Percentage for Each Course */}
      {Array.from(new Set(records.map((rec) => rec.course))).map((course) => (
        <Card key={course} className="mt-4">
          <CardHeader>
            <CardTitle>Total for {course}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Total Percentage:</strong>{" "}
              {calculateTotalPercentage(course).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
