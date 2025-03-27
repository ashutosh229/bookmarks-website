"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-center"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Built by Ashutosh Kumar Jha
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Full-Stack Developer | Open Source Enthusiast
        </p>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-5">
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://github.com/ashutosh229"
            target="_blank"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <Github size={28} />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://linkedin.com/in/ashutosh-kumar-jha-601098280"
            target="_blank"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-700 transition-colors duration-300"
          >
            <Linkedin size={28} />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://twitter.com/ashutoshkj0390"
            target="_blank"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors duration-300"
          >
            <Twitter size={28} />
          </motion.a>
        </div>

        <div className="mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
