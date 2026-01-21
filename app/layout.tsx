import Header from "../components/header";
import Footer from "../components/footer";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeTracker",
  description:
    "This is an application which helps me to track my records like marks, important bookmarks, expenses and a lot more",
  icons: "./logo.png",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        {/* ✅ REQUIRED for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className="overflow-x-hidden">
        <Providers
          children={
            /* ✅ Global responsive wrapper */
            <div className="flex flex-col min-h-screen w-full max-w-screen-xl mx-auto px-4 sm:px-6">
              <Header />
              <main className="flex-grow w-full">{children}</main>
              <Footer />
            </div>
          }
        />
      </body>
    </html>
  );
};

export default RootLayout;
