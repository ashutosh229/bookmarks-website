"use client";

import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase-client";
import { DueRecord, ExpenseRecord, IncomeRecord } from "@/lib/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";

function ExpenseTrackerContent() {
  const { user } = useAuth() as any;
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
    if (!user) return;
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: expenses } = await supabaseClient
      .from("expenses")
      .select("*")
      .eq("user_id", user?.id);
    const { data: income } = await supabaseClient
      .from("income")
      .select("*")
      .eq("user_id", user?.id);
    const { data: dues } = await supabaseClient
      .from("dues")
      .select("*")
      .eq("user_id", user?.id);

    if (expenses) setExpenses(expenses);
    if (income) setIncome(income);
    if (dues) setDues(dues);
  };

  const addExpense = async () => {
    await supabaseClient
      .from("expenses")
      .insert([{ ...newExpense, user_id: user?.id }]);
    setNewExpense({ amount: 0, description: "", includeInTotal: true });
    fetchRecords();
  };

  const addIncome = async () => {
    await supabaseClient
      .from("income")
      .insert([{ ...newIncome, user_id: user?.id }]);
    setNewIncome({ amount: 0, description: "" });
    fetchRecords();
  };

  const addDue = async () => {
    await supabaseClient
      .from("dues")
      .insert([{ ...newDue, user_id: user?.id }]);
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
    0,
  );
  const totalExpenseExcluded = expenses.reduce(
    (acc, item) => (!item.includeInTotal ? acc + item.amount : acc),
    0,
  );
  const totalExpense = totalExpenseIncluded + totalExpenseExcluded;
  const totalOptionalDue = dues.reduce(
    (acc, item) => (item.isOptional ? acc + item.amount : acc),
    0,
  );
  const totalNonOptionalDue = dues.reduce(
    (acc, item) => (!item.isOptional ? acc + item.amount : acc),
    0,
  );
  const totalDue = totalOptionalDue + totalNonOptionalDue;

  return (
    <AuthGuard>
      <div className="p-6 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar for Totals */}
        <aside className="lg:w-1/3 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Total Income:</strong> ₹{totalIncome}
              </p>
              <p>
                <strong>Total Expense (Included):</strong> ₹
                {totalExpenseIncluded}
              </p>
              <p>
                <strong>Total Savings (Included):</strong> ₹
                {totalIncome - totalExpenseIncluded}
              </p>
              <p>
                <strong>Total Expense (Excluded):</strong> ₹
                {totalExpenseExcluded}
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
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Buttons with spacing */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New Expense</DialogTitle>
                <Input
                  placeholder="Amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      amount: Number(e.target.value),
                    })
                  }
                />
                <Input
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newExpense.includeInTotal}
                    onCheckedChange={(checked: boolean) =>
                      setNewExpense({ ...newExpense, includeInTotal: checked })
                    }
                  />
                  <label>Include in Total</label>
                </div>
                <Button onClick={addExpense}>Save</Button>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Income</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New Income</DialogTitle>
                <Input
                  placeholder="Amount"
                  type="number"
                  value={newIncome.amount}
                  onChange={(e) =>
                    setNewIncome({
                      ...newIncome,
                      amount: Number(e.target.value),
                    })
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

            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Due</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New Due</DialogTitle>

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
                  onChange={(e) =>
                    setNewDue({ ...newDue, person: e.target.value })
                  }
                />

                {/* Checkbox for Paid Status */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newDue.isPaid}
                    onCheckedChange={(checked: boolean) =>
                      setNewDue({ ...newDue, isPaid: checked })
                    }
                  />
                  <label>Mark as Paid</label>
                </div>

                {/* Checkbox for Optional Status */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newDue.isOptional}
                    onCheckedChange={(checked: boolean) =>
                      setNewDue({ ...newDue, isOptional: checked })
                    }
                  />
                  <label>Optional Due</label>
                </div>

                <Button onClick={addDue}>Save</Button>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function ExpenseTracker() {
  return <ExpenseTrackerContent />;
}
