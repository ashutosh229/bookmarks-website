"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-100 dark:bg-gray-800 text-center"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Built by Ashutosh Kumar Jha
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Full-Stack Developer | Open Source Enthusiast
      </p>

      {/* Social Links */}
      <div className="flex justify-center space-x-4 mt-4">
        <motion.a
          whileHover={{ scale: 1.1 }}
          href="https://github.com/ashutosh229"
          target="_blank"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Github size={24} />
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.1 }}
          href="https://linkedin.com/in/ashutosh-kumar-jha-601098280"
          target="_blank"
          className="text-gray-600 dark:text-gray-300 hover:text-blue-700"
        >
          <Linkedin size={24} />
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.1 }}
          href="https://twitter.com/ashutoshkj0390"
          target="_blank"
          className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
        >
          <Twitter size={24} />
        </motion.a>
      </div>

      <p className="mt-4 text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} All Rights Reserved.
      </p>
    </motion.footer>
  );
}
