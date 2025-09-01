import { supabase } from "@/lib/supabase";

export async function getTransactions({
  month,
  type,
  minAmount,
  maxAmount,
  payer,
  taker,
  search,
}: {
  month?: string; // e.g. '2025-09'
  type?: "income" | "expense" | "due-pay";
  minAmount?: number;
  maxAmount?: number;
  payer?: string;
  taker?: string;
  search?: string;
}) {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (month) {
    const start = `${month}-01`;
    const end = `${month}-31`;
    query = query.gte("created_at", start).lte("created_at", end);
  }

  if (type) query = query.eq("type", type);
  if (minAmount) query = query.gte("amount", minAmount);
  if (maxAmount) query = query.lte("amount", maxAmount);
  if (payer) query = query.ilike("payer", `%${payer}%`);
  if (taker) query = query.ilike("taker", `%${taker}%`);
  if (search) query = query.ilike("comments", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
