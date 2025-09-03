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
    <html>
      <body>
        <Providers
          children={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          }
        ></Providers>
      </body>
    </html>
  );
};

export default RootLayout;
