export default function AnalysisColumn({ title, items, color, type, onClick }) {
  const getUrgencyColorClass = (urgency) => {
    if (urgency === 'Urgent') return 'bg-red-500';
    if (urgency === 'Haut') return 'bg-orange-500';
    if (urgency === 'Moyen') return 'bg-yellow-500';
    if (urgency === 'Bas') return 'bg-emerald-600';
    return 'bg-gray-300';
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      className={`w-full h-full rounded-lg border border-gray-300 border-l-4 ${color} p-4 bg-white hover:shadow-sm transition-all min-h-[300px] ${onClick ? 'cursor-pointer' : ''} flex flex-col min-h-0`}
    >
      <h2 className="text-gray-700 text-[13px] font-semibold uppercase tracking-widest mb-4">{title}</h2>
      <ul className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 group">
            <div className={`w-1.5 h-6 rounded-full transition-all group-hover:scale-x-150 ${type === 'theme' ? 'bg-emerald-600' : (typeof item === 'object' ? getUrgencyColorClass(item.mainUrgency) : 'bg-red-400')}`} />
            {type === 'action' && typeof item === 'object' ? (
              <span className="text-gray-900 font-medium text-sm leading-tight">{item.irritant}</span>
            ) : type === 'theme' && typeof item === 'object' ? (
              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                <span className="text-gray-900 font-medium text-sm leading-tight truncate">{item.theme}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 min-w-[28px] text-center">
                  {item.count}
                </span>
              </div>
            ) : (
              <span className="text-gray-900 font-medium text-sm leading-tight">{item}</span>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-500 italic text-sm">Aucune donnée</li>}
      </ul>
    </div>
  );
}