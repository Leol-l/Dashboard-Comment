'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const SatisfactionGauge = ({ onClick }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSatisfaction = async () => {
      try {
        const res = await fetch('/api/satisfaction');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Erreur satisfaction:', error);
      }
    };

    fetchSatisfaction();
    const interval = setInterval(fetchSatisfaction, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!data || data.average === null) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-400 text-xs italic">
        Chargement de la satisfaction...
      </div>
    );
  }

  const getColor = (avg) => {
    if (avg >= 4.5) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excellent' };
    if (avg >= 3.5) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Bien' };
    if (avg >= 2.5) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Moyen' };
    if (avg >= 1.5) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Faible' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Très faible' };
  };

  const numericAverage = Number(data.average);
  const safeAverage = Number.isFinite(numericAverage) ? numericAverage : 1;
  const color = getColor(safeAverage);
  const clamped = Math.max(1, Math.min(5, safeAverage));
  const percent = (clamped - 1) / 4;
  const rotation = -90 + percent * 180;

  return (
    <div 
      onClick={onClick}
      className="grid grid-cols-[auto_auto] items-center justify-center w-full h-full gap-2 pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="relative w-[200px] justify-self-center">
        <svg
          viewBox="0 0 100 50"
          className="w-full h-auto block"
          aria-hidden="true"
        >
          {/* Arrière-plan de la jauge */}
          <path
            d="M10 50 A40 40 0 0 1 90 50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Segments de couleur */}
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="20 80" strokeDashoffset="0" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="20 80" strokeDashoffset="-20" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#eab308" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="20 80" strokeDashoffset="-40" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="20 80" strokeDashoffset="-60" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="20 80" strokeDashoffset="-80" />
          
          {/* Aiguille */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="14"
            stroke="#111827"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${rotation} 50 50)`}
          />
          <circle cx="50" cy="50" r="5" fill="#111827" />
        </svg>
        <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider text-center">Satisfaction</div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 text-center justify-self-center">
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-black ${color.text}`}>
            {safeAverage.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400 font-bold">/ 5</span>
        </div>
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full bg-opacity-10 border border-gray-300 ${color.text} text-center`}>
          {color.label}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
          <Star className="w-3 h-3 fill-gray-300 stroke-none" />
          <span>{data.total} avis analysés</span>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionGauge;