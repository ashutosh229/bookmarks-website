import { supabase } from "@/lib/supabase";

export async function addTransaction(tx: {
  type: "income" | "expense" | "due-pay";
  amount: number;
  payer: string;
  taker: string;
  comments?: string;
  userId?: string;
}) {
  const payload = { ...tx } as any;
  if (tx.userId) payload.user_id = tx.userId;

  const { data, error } = await supabase
    .from("transactions")
    .insert([payload])
    .select();

  if (error) throw error;
  return data;
}
