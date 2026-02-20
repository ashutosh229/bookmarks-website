"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import services from "../data/services";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { LogoutButton } from "@/components/LogoutButton";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        My Dashboard
      </h1>

      <nav className="flex gap-6">
        {services.map((service) => (
          <Link
            key={service.link}
            href={service.link}
            className="hover:underline"
          >
            {service.name}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}

        {mounted && (
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
}

function UserMenu() {
  try {
    const { user } = useAuth() as any;
    if (!user)
      return (
        <Link href="/login" className="text-sm underline">
          Login
        </Link>
      );
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-700 dark:text-slate-200">
          {user.email}
        </div>
        <LogoutButton />
      </div>
    );
  } catch (e) {
    return (
      <Link href="/login" className="text-sm underline">
        Login
      </Link>
    );
  }
}
