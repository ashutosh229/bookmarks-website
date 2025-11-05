"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Todo } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const availableLists = [
  "General",
  "Daily",
  "On Campus Interns",
  "Off Campus Interns",
  "College",
  "Bank",
  "Hackathons",
  "Coding Contests",
  "Weekends",
  "Daily Todo",
];

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [selectedList, setSelectedList] = useState("general");

  useEffect(() => {
    fetchTodos();
  }, [selectedList]);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("list_name", selectedList)
      .order("created_at", { ascending: false });
    if (!error && data) setTodos(data);
  }

  async function addTodo() {
    if (!newTask.trim()) return;
    await supabase
      .from("todos")
      .insert({ task: newTask.trim(), list_name: selectedList });
    setNewTask("");
    fetchTodos();
  }

  async function toggleDone(id: string, done: boolean) {
    await supabase.from("todos").update({ done: !done }).eq("id", id);
    fetchTodos();
  }

  async function deleteTodo(id: string) {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">🗂️ Todo Lists</h1>

      {/* List Selector */}
      <div className="flex justify-center">
        <Select
          value={selectedList}
          onValueChange={(value) => setSelectedList(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select List" />
          </SelectTrigger>
          <SelectContent>
            {availableLists.map((list) => (
              <SelectItem key={list} value={list}>
                {list.charAt(0).toUpperCase() + list.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <Input
          placeholder={`Add task to "${selectedList}" list...`}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTodo();
            }
          }}
        />
        <Button onClick={addTodo}>Add</Button>
      </div>

      {/* Todo list */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <Card key={todo.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={todo.done}
                onCheckedChange={() => toggleDone(todo.id, todo.done)}
              />
              <span
                className={
                  todo.done ? "line-through text-muted-foreground" : ""
                }
              >
                {todo.task}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </Button>
          </Card>
        ))}

        {todos.length === 0 && (
          <p className="text-center text-muted-foreground">
            No tasks yet in "{selectedList}" list.
          </p>
        )}
      </div>
    </div>
  );
}
