"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House } from "lucide-react";

const Navbar = () => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("section") || "Support";
  const isSectionPage = pathname === "/section";
  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const getSectionTabClassName = (isActive) => {
    const baseClassName =
      "px-4 py-2 text-sm font-medium rounded-xl text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

    if (isActive) {
      return `${baseClassName} bg-white shadow-sm text-slate-700`;
    }

    return `${baseClassName} hover:bg-slate-200/60`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Commentaires</h1>
            <p className="text-xs text-gray-500 mt-0.5">Analyse en temps réel</p>
          </div>
        </div>
      </div>

      <nav className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <p className="text-xs text-slate-500 capitalize">{currentDate}</p>

        {!isSectionPage && <span aria-hidden="true" className="inline-block w-10" />}

        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
          {isSectionPage && (
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              title="Accueil"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <House size={16} />
            </Link>
          )}

          <Link
            href="/section?section=Support"
            className={getSectionTabClassName(pathname === "/section" && currentSection === "Support")}
          >
            Support
          </Link>
          <Link
            href="/section?section=ERP"
            className={getSectionTabClassName(pathname === "/section" && currentSection === "ERP")}
          >
            ERP
          </Link>
          <Link
            href="/section?section=Admin"
            className={getSectionTabClassName(pathname === "/section" && currentSection === "Admin")}
          >
            Admin
          </Link>
        </div>
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