"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House } from "lucide-react";

const DASHBOARD_LAST_UPDATED_KEY = 'dashboardLastUpdatedAt';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const REFRESH_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS || 1800000);

const formatElapsed = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};

const Navbar = () => {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
    const syncWithScheduler = async () => {
      try {
        const response = await fetch(`${BASE_PATH}/api/external/dashboard/scheduler-status`, { cache: 'no-store' });
        if (!response.ok) return;

        const payload = await response.json();
        const schedulerTimestamp = Date.parse(payload?.lastRunFinishedAt || '');

        if (Number.isFinite(schedulerTimestamp) && schedulerTimestamp > 0) {
          window.localStorage.setItem(DASHBOARD_LAST_UPDATED_KEY, String(schedulerTimestamp));
          setLastUpdatedAt(schedulerTimestamp);
        }
      } catch (_error) {
      }
    };

    const storedValue = window.localStorage.getItem(DASHBOARD_LAST_UPDATED_KEY);
    const parsed = Number(storedValue);

    if (Number.isFinite(parsed) && parsed > 0) {
      setLastUpdatedAt(parsed);
    }

    const handleDashboardUpdate = (event) => {
      const timestamp = Number(event?.detail?.timestamp ?? Date.now());
      if (!Number.isFinite(timestamp) || timestamp <= 0) return;
      setLastUpdatedAt(timestamp);
      setElapsedSeconds(0);
    };

    syncWithScheduler();
    const schedulerSyncInterval = setInterval(syncWithScheduler, REFRESH_INTERVAL_MS);

    window.addEventListener('dashboard-data-updated', handleDashboardUpdate);

    return () => {
      clearInterval(schedulerSyncInterval);
      window.removeEventListener('dashboard-data-updated', handleDashboardUpdate);
    };
  }, []);

  useEffect(() => {
    if (!lastUpdatedAt) return;

    const updateElapsedTime = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - lastUpdatedAt) / 1000));
      setElapsedSeconds(elapsed);
    };

    updateElapsedTime();

    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedAt]);

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

        <div className="relative flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
          {isSectionPage && (
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              title="Accueil"
              className="absolute -left-10 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
          Dernière analyse scheduler : <span className="text-gray-700">{lastUpdatedAt ? `il y a ${formatElapsed(elapsedSeconds)}` : 'en attente...'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;