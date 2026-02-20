"use client";

import AuthGuard from "@/components/AuthGuard";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseClient } from "@/lib/supabase-client";
import { ExamRecord } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";

function ExamMarksTrackerContent() {
  const { user } = useAuth() as any;
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [newRecord, setNewRecord] = useState<ExamRecord>({
    course: "",
    examType: "",
    marks: 0,
    weightage: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ExamRecord | null>(null);
  const [isDialogOpenForUpdating, setIsDialogOpenForUpdating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabaseClient
      .from("exam_records")
      .select("*")
      .eq("user_id", user?.id);
    if (!error) setRecords(data || []);
  };

  const deleteCourse = async (course: string) => {
    await supabaseClient
      .from("exam_records")
      .delete()
      .eq("course", course)
      .eq("user_id", user?.id);
    fetchRecords();
  };

  const updateRecord = async () => {
    if (!editRecord) return;
    await supabaseClient
      .from("exam_records")
      .update(editRecord)
      .eq("id", editRecord.id)
      .eq("user_id", user?.id);
    setEditRecord(null);
    setIsDialogOpen(false);
    fetchRecords();
  };

  const addRecord = async () => {
    const { error } = await supabaseClient
      .from("exam_records")
      .insert([{ ...newRecord, user_id: user?.id }]);
    if (!error) {
      setIsDialogOpen(false); // Close the dialog
      setNewRecord({ course: "", examType: "", marks: 0, weightage: 0 });
      fetchRecords(); // Reload the records
    }
  };

  const calculateTotalWeightedMarks = (course: string) => {
    return records
      .filter((rec) => rec.course === course)
      .reduce((total, rec) => total + (rec.marks * rec.weightage) / 100, 0);
  };

  const groupedRecords = records.reduce(
    (acc, record) => {
      if (!acc[record.course]) acc[record.course] = [];
      acc[record.course].push(record);
      return acc;
    },
    {} as Record<string, ExamRecord[]>,
  );

  const filteredRecords = filter
    ? records.filter((rec) => rec.course === filter)
    : records;

  return (
    <AuthGuard>
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
              ),
            )}
          </SelectContent>
        </Select>

        {/* Exam Records List */}
        {/* {filteredRecords.map((rec, index) => (
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
      ))} */}

        {/* Total Percentage for Each Course */}
        {/* {Array.from(new Set(records.map((rec) => rec.course))).map((course) => (
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
      ))} */}

        {Object.keys(groupedRecords).map((course) => (
          <Card key={course} className="bg-gray-100 dark:bg-gray-800">
            <CardHeader>
              <CardTitle>{course}</CardTitle>
              <Button
                variant="destructive"
                onClick={() => deleteCourse(course)}
              >
                Delete Course
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Weightage (%)</TableHead>
                    <TableHead>Weighted Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedRecords[course].map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{rec.examType}</TableCell>
                      <TableCell>{rec.marks}</TableCell>
                      <TableCell>{rec.weightage}%</TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditRecord(rec);
                            setIsDialogOpenForUpdating(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell>
                        {((rec.marks * rec.weightage) / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-4 font-bold text-lg">
                Total Weighted Marks:{" "}
                {calculateTotalWeightedMarks(course).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Edit Dialog */}
        <Dialog
          open={isDialogOpenForUpdating}
          onOpenChange={setIsDialogOpenForUpdating}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Exam Record</DialogTitle>
            </DialogHeader>
            {editRecord && (
              <div className="space-y-3">
                <Input
                  placeholder="Exam Type"
                  value={editRecord.examType}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, examType: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  value={editRecord.marks}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      marks: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Weightage (%)"
                  value={editRecord.weightage}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      weightage: Number(e.target.value),
                    })
                  }
                />
                <Button onClick={updateRecord}>Update</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}

export default function ExamMarksTracker() {
  return <ExamMarksTrackerContent />;
}
