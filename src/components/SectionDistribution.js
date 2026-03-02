import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function SectionDistribution({ sections }) {
  const safeSections = Array.isArray(sections)
    ? sections
    : [
        { key: 'ERP', label: 'ERP', count: 0 },
        { key: 'Admin', label: 'Admin', count: 0 },
        { key: 'Support', label: 'Support', count: 0 }
      ];

  const total = safeSections.reduce((sum, section) => sum + Number(section.count || 0), 0);

  const getColor = (key) => {
    if (key === 'ERP') return '#0f805c';
    if (key === 'Admin') return '#df0f0f';
    return '#3b82f6';
  };

  return (
    <div className="w-full h-full rounded-lg border border-blue-300 border-l-4 border-l-blue-400 p-4 bg-white hover:shadow-sm transition-all min-h-[260px] sm:min-h-[300px] flex flex-col">
      <h2 className="text-gray-700 text-[13px] font-semibold uppercase tracking-widest mb-4">
        Répartition par section
      </h2>

      <div className="flex-1 min-h-0 h-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-stretch">
        <div className="w-full h-full min-h-[180px] sm:min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeSections}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="48%"
                outerRadius="74%"
                paddingAngle={3}
                minAngle={2}
              >
                {safeSections.map((section) => (
                  <Cell key={section.key} fill={getColor(section.key)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Commentaires']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2 w-full lg:min-w-[170px]">
          {safeSections.map((section) => {
            const count = Number(section.count || 0);
            const percent = total > 0 ? (count / total) * 100 : 0;

            return (
              <li key={section.key} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(section.key) }} />
                  <span className="text-gray-700 font-medium">{section.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{count}</p>
                  <p className="text-[11px] text-gray-500">{percent.toFixed(1).replace('.', ',')}%</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
