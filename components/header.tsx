"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { name: "Marks", href: "/marks" },
  { name: "Expenses", href: "/expenses-tracker" },
  { name: "Bookmarks", href: "/bookmarks" },
];

export function Header() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center px-6 py-4 shadow-md bg-white dark:bg-gray-900 sticky top-0 z-50"
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-bold text-blue-600 dark:text-white"
      >
        My App
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onMouseEnter={() => setHovered(link.name)}
            onMouseLeave={() => setHovered(null)}
            className="relative text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            {link.name}
            {hovered === link.name && (
              <motion.div
                className="absolute left-0 w-full h-0.5 bg-blue-500"
                layoutId="underline"
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu (Optional) */}
      <div className="md:hidden">
        <Button variant="ghost">☰</Button>
      </div>
    </motion.header>
  );
}


