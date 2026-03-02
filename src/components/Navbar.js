"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Commentaires</h1>
            <p className="text-xs text-gray-500 mt-0.5">Analyse en temps réel</p>
          </div>
        </div>
      </div>

        <nav className="flex items-center gap-2">
        <Link
          href="/"
          className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Home
        </Link>
        <Link
          href="/support"
          className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Support
        </Link>
        <Link
          href="/erp"
          className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          ERP
        </Link>
        <Link
          href="/admin"
          className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
        >
          Admin
        </Link>
        </nav>
      <div className="flex items-center gap-4">
        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
          Actualisation dans : <span className="text-gray-700">{secondsLeft}s</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;