import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard Commentaires",
  description: "Tableau de bord d'analyse des commentaires",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}>
        <div className="h-full p-4 flex flex-col overflow-hidden">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="mt-4 flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
