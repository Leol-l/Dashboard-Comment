"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import AnalysisColumn from '../components/AnalysisColumn';
import SatisfactionGauge from '../components/Satisfaction';
import Navbar from '../components/Navbar';

export default function Home() {
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
        const res = await axios.get('/api/external/dashboard/satisfaction-data');
        const items = res.data.data;

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
  <div className="h-screen w-screen bg-gray-50 p-4 flex flex-col gap-4 font-sans select-none overflow-hidden">
    <Navbar />
      <div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SatisfactionGauge />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard label="Aujourd'hui" count={stats.day.count} average={stats.day.avg} />
          <StatCard label="Ce mois-ci" count={stats.month.count} average={stats.month.avg} />
          <StatCard label="Global" count={stats.total.count} average={stats.total.avg} />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
    <AnalysisColumn 
        title="Irritants Majeurs" 
        items={topIrritants} 
        color="border-red-500" 
        type="action"/>
    <AnalysisColumn 
        title="5 Grands Axes (Thèmes)" 
        items={topThemes} 
      color="border-emerald-600" 
        type="theme" />
    </div>
  </div>
  );
}