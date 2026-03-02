export default function StatCard({ label, count, average, deltaPct = 0, onCommentsClick }) {
  const safeAverage = Number(average);
  const numericAverage = Number.isFinite(safeAverage) ? safeAverage : 0;
  const safeDeltaPct = Number(deltaPct);
  const numericDeltaPct = Number.isFinite(safeDeltaPct) ? safeDeltaPct : 0;
  const deltaSign = numericDeltaPct >= 0 ? '+' : '-';
  const formattedDelta = `Δ ${deltaSign}${Math.abs(numericDeltaPct).toFixed(1).replace('.', ',')}`;
  const deltaBgClass = numericDeltaPct >= 0 ? 'bg-emerald-600' : 'bg-red-500';

  
  const getColor = (avg) => {
    if (avg >= 4.5) return { borderLeft: 'border-l-emerald-600', bg: 'bg-emerald-50/90', text: 'text-gray-900' };
    if (avg >= 3.5) return { borderLeft: 'border-l-green-500', bg: 'bg-green-50/80', text: 'text-gray-900' };
    if (avg >= 2.5) return { borderLeft: 'border-l-yellow-500', bg: 'bg-yellow-50/70', text: 'text-gray-900' };
    if (avg >= 1.5) return { borderLeft: 'border-l-orange-500', bg: 'bg-orange-50/65', text: 'text-gray-900' };
    if (avg >= 1) return { borderLeft: 'border-l-red-500', bg: 'bg-red-50/60', text: 'text-gray-900' };
    return { borderLeft: 'border-l-gray-300', bg: 'bg-gray-50', text: 'text-gray-900' };
  };

  const colorClass = getColor(numericAverage);

  return (
    <div className="grid grid-cols-1 grid-rows-2 gap-4 w-full h-full">
      
      <div className={`${colorClass.bg} ${colorClass.text} rounded-lg border border-gray-300 border-l-4 ${colorClass.borderLeft}  p-4 flex flex-col min-h-[120px] hover:shadow-sm transition-all`}>
      {/* Bloc Score (Dynamique) */}
        <h3 className="text-gray-700 text-[10px] font-semibold uppercase tracking-widest">{label}</h3>
        <div className="flex-1 flex items-center justify-center mt-2 min-h-0">
          <div className="flex items-end justify-center gap-3">
          <span className="text-5xl font-bold text-gray-900 leading-tight">{numericAverage > 0 ? numericAverage.toFixed(1).replace('.', ',') : "0,0"}</span>
          <span className={`text-sm font-semibold px-2 rounded-full leading-tight mb-1 text-white ${deltaBgClass}`}>{formattedDelta}</span>
          </div>
        </div>
      </div>
      
      {/* Bloc Commentaires */}
      <div
        onClick={onCommentsClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onCommentsClick?.();
          }
        }}
        className={`bg-white rounded-lg border border-gray-300 border-l-4 border-l-gray-300 p-4 flex flex-col min-h-[120px] hover:shadow-sm transition-all ${onCommentsClick ? 'cursor-pointer' : ''}`}
      >
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