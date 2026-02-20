"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { LogoutButton } from "@/components/LogoutButton";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth() as any;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Logged in as: {user.email}</p>
      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
