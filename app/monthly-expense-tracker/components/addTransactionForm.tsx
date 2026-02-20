"use client";
import { useState } from "react";
import { addTransaction } from "../utils/addTransaction";
import { useAuth } from "@/app/providers";

export default function AddTransactionForm({ onAdd }: { onAdd: () => void }) {
  const { user } = useAuth() as any;
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    payer: "",
    taker: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = useAuth() as any;
      await addTransaction({
        type: form.type as "income" | "expense" | "due-pay",
        amount: parseFloat(form.amount),
        payer: form.payer,
        taker: form.taker,
        comments: form.comments,
        userId: user?.id,
      });
      setForm({
        type: "expense",
        amount: "",
        payer: "",
        taker: "",
        comments: "",
      });
      onAdd();
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md space-y-4">
      <div>
        <label className="block mb-1 font-semibold">Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="due-pay">Due Pay</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Payer</label>
        <input
          type="text"
          name="payer"
          value={form.payer}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Taker</label>
        <input
          type="text"
          name="taker"
          value={form.taker}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Comments</label>
        <textarea
          name="comments"
          value={form.comments}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          rows={2}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
