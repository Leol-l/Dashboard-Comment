'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import AnalysisColumn from './AnalysisColumn';
import SatisfactionGauge from './Satisfaction';

export default function SatisfactionDashboard() {
  const [stats, setStats] = useState({
    day: { count: 0, avg: 0 },
    month: { count: 0, avg: 0 },
    total: { count: 0, avg: 0 }
  });
  const [topThemes, setTopThemes] = useState([]);
  const [topIrritants, setTopIrritants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // On utilise l'URL proxifiée
        const res = await axios.get('/api/external/dashboard/satisfaction-data');
        const items = res.data.data;

        // --- LOGIQUE TEMPORELLE (Basée sur "Aujourd'hui" 25 Fév 2026) ---
        const todayStr = "2026-02-25"; 
        const monthStr = "2026-02";

        const processStats = (filtered) => ({
          count: filtered.length,
          avg: filtered.reduce((acc, curr) => acc + curr.satisfaction, 0) / filtered.length || 0
        });

        setStats({
          day: processStats(items.filter(d => d.date_answered.startsWith(todayStr))),
          month: processStats(items.filter(d => d.date_answered.startsWith(monthStr))),
          total: { 
            count: res.data.total, 
            avg: items.reduce((acc, curr) => acc + curr.satisfaction, 0) / items.length || 0 
          }
        });

        // --- EXTRACTION THEMES & IRRITANTS ---
        let themes = [];
        let irritants = [];

        items.forEach(item => {
          try {
            const analysis = typeof item.analysis_result === 'string' 
              ? JSON.parse(item.analysis_result) 
              : item.analysis_result;
              
            if (analysis.themes_recurrents) themes.push(...analysis.themes_recurrents);
            if (analysis.irritants_majeurs) irritants.push(analysis.irritants_majeurs);
          } catch (e) { console.error("Erreur parse JSON item", item.id); }
        });

        setTopThemes([...new Set(themes)].slice(0, 5));
        setTopIrritants([...new Set(irritants)].slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Erreur API:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Chargement du Dashboard...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* COLONNES D'ANALYSE (Gauche & Milieu) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col md:flex-row gap-8">
          <AnalysisColumn 
            title="5 Grands Axes (Thèmes)" 
            items={topThemes} 
            color="border-emerald-500" 
            type="theme" 
          />
          <AnalysisColumn 
            title="Irritants Majeurs" 
            items={topIrritants} 
            color="border-red-500" 
            type="action" 
          />
        </div>

        {/* STAT CARDS (Droite) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <StatCard label="Aujourd'hui" count={stats.day.count} average={stats.day.avg} />
          <StatCard label="Ce mois-ci" count={stats.month.count} average={stats.month.avg} />
          <StatCard label="Total Année" count={stats.total.count} average={stats.total.avg} isTotal={true} />
        </div>
      </div>
    </div>
  );
}