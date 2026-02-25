export default function StatCard({ label, count, average }) {
  
  // On utilise la même logique que ta jauge pour les couleurs de bordure
  const getBorderColor = (avg) => {
    if (avg === 0) return 'border-gray-200';
    if (avg >= 4.5) return 'border-emerald-500';
    if (avg >= 3.5) return 'border-green-500';
    if (avg >= 2.5) return 'border-yellow-500';
    if (avg >= 1.5) return 'border-orange-500';
    return 'border-red-500';
  };

  const borderColorClass = getBorderColor(average);

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* Case Volume - Bordure Rouge (Fixe selon ton croquis) */}
      <div className="bg-white border-[3px] border-red-500 rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center transition-all">
        <span className="text-4xl font-black text-slate-800 mb-1">{count}</span>
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest text-center">
          Commentaires
        </span>
      </div>

      {/* Case Note - Bordure Dynamique (Même logique que la jauge) */}
      <div className={`bg-white border-[3px] ${borderColorClass} rounded-[2rem] p-6 shadow-sm flex flex-col items-center justify-center transition-all duration-500`}>
        <span className="text-4xl font-black text-slate-800 mb-1">
          {average > 0 ? average.toFixed(1).replace('.', ',') : "0,0"}
        </span>
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest text-center">
          {label}
        </span>
      </div>
    </div>
  );
}