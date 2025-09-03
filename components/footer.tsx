"use client";

import { motion } from "framer-motion";
import socials from "../data/socials";

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

        <div className="flex justify-center space-x-6 mt-5">
          {socials.map((social, index) => {
            return (
              <motion.a
                key={index}
                whileHover={{ scale: 1.1 }}
                href={social.link}
                target="_blank"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                <social.icon size={28}></social.icon>
              </motion.a>
            );
          })}
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
