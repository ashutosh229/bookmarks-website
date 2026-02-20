import { handleAuth } from "@supabase/auth-helpers-nextjs";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await handleAuth(req);
}

export async function POST(req: NextRequest) {
  return await handleAuth(req);
}
