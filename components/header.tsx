"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import services from "@/data/services";
import { useEffect, useState } from "react";

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

      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      )}
    </header>
  );
}
