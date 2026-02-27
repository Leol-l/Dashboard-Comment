export default function AnalysisColumn({ title, items, color, type }) {
  return (
    <div className={`w-full h-full rounded-lg border border-emerald-600 border-l-4 ${color} p-4 bg-white hover:shadow-sm transition-all min-h-[300px]`}>
      <h3 className="text-gray-700 text-[10px] font-semibold uppercase tracking-widest mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className={`w-1.5 h-6 rounded-full mt-0.5 transition-all group-hover:scale-x-150 ${type === 'theme' ? 'bg-emerald-600' : 'bg-red-400'}`} />
            <span className="text-gray-700 font-medium text-sm leading-tight">{item}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-400 italic text-sm">Aucune donnée</li>}
      </ul>
    </div>
  );
}