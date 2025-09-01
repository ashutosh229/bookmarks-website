import { supabase } from "@/lib/supabase";

export async function addTransaction(tx: {
  type: "income" | "expense" | "due-pay";
  amount: number;
  payer: string;
  taker: string;
  comments?: string;
}) {
  const { data, error } = await supabase
    .from("transactions")
    .insert([tx])
    .select();

  if (error) throw error;
  return data;
}
