"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/(auth)/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sign Up</h1>

      {success ? (
        <p className="text-green-600">
          Signup successful! Please check your email to confirm your account.
          <br />
          <Link href="/login" className="underline text-blue-600">
            Go to Login
          </Link>
        </p>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      )}

      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
}
