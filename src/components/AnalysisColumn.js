export default function AnalysisColumn({ title, items, color, type }) {
  return (
    <div className={`flex-1 border-2 ${color} rounded-3xl p-6 bg-white shadow-sm min-h-[300px]`}>
      <h3 className="text-gray-400 font-bold uppercase text-xs mb-6 tracking-widest">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className={`w-1.5 h-6 rounded-full mt-0.5 transition-all group-hover:scale-x-150 ${type === 'theme' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-gray-700 font-medium text-sm leading-tight">{item}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-300 italic text-sm">Aucune donnée</li>}
      </ul>
    </div>
  );
}