"use client";

import { useState, useEffect } from "react";
import { getTransactions } from "./utils/getTransaction";
import AddTransactionForm from "./components/addTransactionForm";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filters, setFilters] = useState<{
    search: string;
    type?: "income" | "expense" | "due-pay";
  }>({ search: "", type: undefined });

  const fetchTransactions = async () => {
    const data = await getTransactions(filters);
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Expenses Tracker</h1>

      {/* Add Transaction Form */}
      <AddTransactionForm onAdd={fetchTransactions} />

      {/* Filters */}
      <div className="flex gap-4 my-6">
        <input
          placeholder="Search comments..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={filters.type ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              type:
                e.target.value === ""
                  ? undefined
                  : (e.target.value as "income" | "expense" | "due-pay"),
            })
          }
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="due-pay">Due Pay</option>
        </select>
      </div>

      {/* Transactions List */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Payer</th>
            <th>Taker</th>
            <th>Comments</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.type}</td>
              <td>₹{tx.amount}</td>
              <td>{tx.payer}</td>
              <td>{tx.taker}</td>
              <td>{tx.comments}</td>
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
