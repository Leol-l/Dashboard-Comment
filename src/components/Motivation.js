export default function Motivation({ items }) {
  const motivationItems = Array.isArray(items) ? items : [];
  const displayItems = motivationItems.length > 1 ? [...motivationItems, ...motivationItems] : motivationItems;

  return (
    <div className="w-full h-full rounded-lg border border-gray-300 border-l-4 border-l-emerald-600 p-4 bg-white hover:shadow-sm transition-all min-h-[300px] overflow-hidden">
      <h2 className="text-gray-700 text-[13px] font-semibold uppercase tracking-widest mb-4">Motivation</h2>

      {motivationItems.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">Aucun commentaire 4-5 étoiles</div>
      ) : (
        <div className="h-[calc(100%-20px)] overflow-hidden">
          <div className={motivationItems.length > 1 ? 'animate-motivation-scroll space-y-2' : 'space-y-2'}>
            {displayItems.map((item, index) => (
              <div
                key={`${item.ticketId}-${item.createdAt}-${index}`}
                className="border border-gray-200 rounded-md p-3 bg-emerald-50/50"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
                  <span>Ticket {item.ticketId}</span>
                  <span>{item.createdAt}</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold mb-1">{'★'.repeat(Math.max(0, Math.min(5, Math.round(item.satisfaction))))}</div>
                <p className="text-sm text-gray-800">{item.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
