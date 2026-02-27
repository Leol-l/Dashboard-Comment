export default function StatCard({ label, count, average }) {
  
  const getColor = (avg) => {
    if (avg >= 4.5) return { border: 'border-emerald-600', bg: 'bg-emerald-50/90', text: 'text-gray-900' };
    if (avg >= 3.5) return { border: 'border-green-600', bg: 'bg-emerald-50/80', text: 'text-gray-900' };
    if (avg >= 2.5) return { border: 'border-yellow-500', bg: 'bg-emerald-50/70', text: 'text-gray-900' };
    if (avg >= 1.5) return { border: 'border-orange-500', bg: 'bg-emerald-50/65', text: 'text-gray-900' };
    return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-900' };
  };

  const colorClass = getColor(average);

  return (
    <div className="grid grid-cols-1 grid-rows-2 gap-4 w-full h-full">
      
      <div className={`${colorClass.bg} ${colorClass.text} rounded-lg border border-gray-300 border-l-4 ${colorClass.border}  p-4 flex flex-col min-h-[120px] hover:shadow-sm transition-all`}>
      {/* Bloc Score (Dynamique) */}
        <h3 className="text-gray-700 text-[10px] font-semibold uppercase tracking-widest">{label}</h3>
        <div className="flex-1 flex items-center justify-center mt-2 min-h-0">
          <div className="flex items-end justify-center gap-3">
          <span className="text-5xl font-bold text-gray-900 leading-tight">{average > 0 ? average.toFixed(1).replace('.', ',') : "0,0"}</span>
          </div>
        </div>
      </div>
      
      {/* Bloc Commentaires */}
      <div className="bg-white rounded-lg border border-gray-300 border-l-4 border-l-gray-300 p-4 flex flex-col min-h-[120px] hover:shadow-sm transition-all">
        <h3 className="text-gray-700 text-[10px] font-semibold uppercase tracking-widest">Commentaires</h3>
        <div className="flex-1 flex items-center justify-center mt-2 min-h-0">
          <div className="flex items-end justify-center gap-3">
          <span className="text-5xl font-bold text-gray-900 leading-tight">{count}</span>
          </div>
        </div>
      </div>

    </div>
  );
}