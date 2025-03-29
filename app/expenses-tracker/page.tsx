"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { DueRecord, ExpenseRecord, IncomeRecord } from "@/lib/types";
import { useEffect, useState } from "react";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [newExpense, setNewExpense] = useState<ExpenseRecord>({
    amount: 0,
    description: "",
    includeInTotal: true,
  });
  const [newIncome, setNewIncome] = useState<IncomeRecord>({
    amount: 0,
    description: "",
  });
  const [newDue, setNewDue] = useState<DueRecord>({
    amount: 0,
    description: "",
    person: "",
    isPaid: false,
    isOptional: false,
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: expenses } = await supabase.from("expenses").select("*");
    const { data: income } = await supabase.from("income").select("*");
    const { data: dues } = await supabase.from("dues").select("*");

    if (expenses) setExpenses(expenses);
    if (income) setIncome(income);
    if (dues) setDues(dues);
  };

  const addExpense = async () => {
    await supabase.from("expenses").insert([newExpense]);
    setNewExpense({ amount: 0, description: "", includeInTotal: true });
    fetchRecords();
  };

  const addIncome = async () => {
    await supabase.from("income").insert([newIncome]);
    setNewIncome({ amount: 0, description: "" });
    fetchRecords();
  };

  const addDue = async () => {
    await supabase.from("dues").insert([newDue]);
    setNewDue({
      amount: 0,
      description: "",
      person: "",
      isPaid: false,
      isOptional: false,
    });
    fetchRecords();
  };

  const totalIncome = income.reduce((acc, item) => acc + item.amount, 0);
  const totalExpenseIncluded = expenses.reduce(
    (acc, item) => (item.includeInTotal ? acc + item.amount : acc),
    0
  );
  const totalExpenseExcluded = expenses.reduce(
    (acc, item) => (!item.includeInTotal ? acc + item.amount : acc),
    0
  );
  const totalExpense = totalExpenseIncluded + totalExpenseExcluded;
  const totalOptionalDue = dues.reduce(
    (acc, item) => (item.isOptional ? acc + item.amount : acc),
    0
  );
  const totalNonOptionalDue = dues.reduce(
    (acc, item) => (!item.isOptional ? acc + item.amount : acc),
    0
  );
  const totalDue = totalOptionalDue + totalNonOptionalDue;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Totals Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Total Income:</strong> ₹{totalIncome}
          </p>
          <p>
            <strong>Total Expense (Included):</strong> ₹{totalExpenseIncluded}
          </p>
          <p>
            <strong>Total Expense (Excluded):</strong> ₹{totalExpenseExcluded}
          </p>
          <p>
            <strong>Total Expense:</strong> ₹{totalExpense}
          </p>
          <p>
            <strong>Total Optional Due:</strong> ₹{totalOptionalDue}
          </p>
          <p>
            <strong>Total Non-Optional Due:</strong> ₹{totalNonOptionalDue}
          </p>
          <p>
            <strong>Total Due:</strong> ₹{totalDue}
          </p>
        </CardContent>
      </Card>

      {/* Add Expense */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Expense</Button>
        </DialogTrigger>
        <DialogContent>
          <Input
            placeholder="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
          />
          <Button onClick={addExpense}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Add Income */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Income</Button>
        </DialogTrigger>
        <DialogContent>
          <Input
            placeholder="Amount"
            type="number"
            value={newIncome.amount}
            onChange={(e) =>
              setNewIncome({ ...newIncome, amount: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Description"
            value={newIncome.description}
            onChange={(e) =>
              setNewIncome({ ...newIncome, description: e.target.value })
            }
          />
          <Button onClick={addIncome}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* Add Due */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Due</Button>
        </DialogTrigger>
        <DialogContent>
          <Input
            placeholder="Amount"
            type="number"
            value={newDue.amount}
            onChange={(e) =>
              setNewDue({ ...newDue, amount: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Description"
            value={newDue.description}
            onChange={(e) =>
              setNewDue({ ...newDue, description: e.target.value })
            }
          />
          <Input
            placeholder="Person"
            value={newDue.person}
            onChange={(e) => setNewDue({ ...newDue, person: e.target.value })}
          />
          <Button onClick={addDue}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
