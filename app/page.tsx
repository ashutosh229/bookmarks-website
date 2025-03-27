"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  {
    name: "Marks Recorder",
    description: "Track and manage your academic performance easily.",
    link: "/marks",
  },
  {
    name: "Expenses Tracker",
    description: "Monitor your expenses and manage finances effectively.",
    link: "/expenses-tracker",
  },
  {
    name: "Bookmarker",
    description: "Keep track of all your important bookmarks and hyperlinks",
    link: "/bookmarks.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center">
      {/* Welcome Section */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-gray-900 dark:text-white mb-6"
      >
        Welcome to Your Dashboard 🚀
      </motion.h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
        Manage your day-to-day trackings, all in one place!
      </p>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div
            key={service.link}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={service.link}>
              <Card className="w-80 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
