"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import AnalysisColumn from '../components/AnalysisColumn';
import SatisfactionGauge from '../components/Satisfaction';

export default function Home() {
  const urgencyOrder = {
    Urgent: 4,
    Haut: 3,
    Moyen: 2,
    Bas: 1
  };

  const getMainUrgency = (actions) => {
    if (!Array.isArray(actions) || actions.length === 0) return 'Bas';

    return actions.reduce((currentMax, action) => {
      const actionUrgency = action?.urgency_level;
      const normalizedUrgency = urgencyOrder[actionUrgency] ? actionUrgency : 'Bas';

      return urgencyOrder[normalizedUrgency] > urgencyOrder[currentMax]
        ? normalizedUrgency
        : currentMax;
    }, 'Bas');
  };

  const getUrgencyDotClass = (urgency) => {
    if (urgency === 'Urgent') return 'bg-red-500';
    if (urgency === 'Haut') return 'bg-orange-500';
    if (urgency === 'Moyen') return 'bg-yellow-500';
    if (urgency === 'Bas') return 'bg-emerald-600';
    return 'bg-gray-300';
  };

  const [stats, setStats] = useState({
    day: { count: 0, avg: 0, deltaPct: 0 },
    month: { count: 0, avg: 0, deltaPct: 0 },
    total: { count: 0, avg: 0, deltaPct: 0 }
  });
  const [topThemes, setTopThemes] = useState([]);
  const [themeDetails, setThemeDetails] = useState([]);
  const [topIrritants, setTopIrritants] = useState([]);
  const [irritantsDetails, setIrritantsDetails] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  const sanitizeStat = (value) => {
    const count = Number(value?.count);
    const avg = Number(value?.avg);
    const deltaPct = Number(value?.deltaPct);

    return {
      count: Number.isFinite(count) ? count : 0,
      avg: Number.isFinite(avg) ? avg : 0,
      deltaPct: Number.isFinite(deltaPct) ? deltaPct : 0
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/external/dashboard/satisfaction-data');
        const items = Array.isArray(res.data.data) ? res.data.data : [];
        const apiStats = res.data.stats;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayKey = `${year}-${month}-${day}`;
        const monthKey = `${year}-${month}`;

        const processStats = (filteredItems) => {
          const count = filteredItems.length;
          const avg = count
            ? filteredItems.reduce((acc, curr) => acc + Number(curr.satisfaction || 0), 0) / count
            : 0;

          let deltaPct = 0;
          if (count >= 2) {
            const currentNote = Number(filteredItems[0]?.satisfaction || 0);
            const previousNote = Number(filteredItems[1]?.satisfaction || 0);

            if (previousNote !== 0) {
              deltaPct = ((currentNote - previousNote) / previousNote) * 100;
            }
          }

          return { count, avg, deltaPct };
        };

        const normalizeDateKey = (value) => {
          if (!value) return '';

          if (value instanceof Date) {
            return value.toISOString().slice(0, 10);
          }

          const parsed = new Date(value);
          if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
          }

          return String(value).slice(0, 10);
        };

        const getReferenceDate = (item) => normalizeDateKey(item.date_answered);

        const fallbackStats = {
          day: processStats(items.filter(item => getReferenceDate(item).startsWith(todayKey))),
          month: processStats(items.filter(item => getReferenceDate(item).startsWith(monthKey))),
          total: processStats(items)
        };

        const nextStats = {
          day: sanitizeStat({ ...(apiStats?.today ?? fallbackStats.day), deltaPct: fallbackStats.day.deltaPct }),
          month: sanitizeStat({ ...(apiStats?.month ?? fallbackStats.month), deltaPct: fallbackStats.month.deltaPct }),
          total: sanitizeStat({ ...(apiStats?.global ?? fallbackStats.total), deltaPct: fallbackStats.total.deltaPct })
        };

        setStats((previousStats) => {
          const hasAnyData = items.length > 0 || nextStats.total.count > 0;

          if (!hasAnyData && previousStats.total.count > 0) {
            return previousStats;
          }

          return nextStats;
        });

        const themesMap = new Map();
        const irritantsMap = new Map();

        items.forEach(item => {
          try {
            const analysis = typeof item.analysis_result === 'string'
              ? JSON.parse(item.analysis_result)
              : item.analysis_result;

            const itemThemes = Array.isArray(analysis?.themes_recurrents) ? analysis.themes_recurrents : [];

            itemThemes.forEach((theme) => {
              if (!theme) return;

              if (!themesMap.has(theme)) {
                themesMap.set(theme, new Map());
              }

              const ticketsMap = themesMap.get(theme);
              const ticketId = item?.tickets_id ?? item?.id ?? 'N/A';
              const createdAt = normalizeDateKey(item?.date_answered) || 'N/A';
              const ticketKey = `${ticketId}__${createdAt}`;

              ticketsMap.set(ticketKey, {
                ticketId,
                createdAt
              });
            });

            const irritant = analysis?.irritants_majeurs;
            const actions = Array.isArray(analysis?.actions_prioritaires) ? analysis.actions_prioritaires : [];

            if (irritant) {
              if (!irritantsMap.has(irritant)) {
                irritantsMap.set(irritant, new Map());
              }

              const actionsMap = irritantsMap.get(irritant);

              actions.forEach((actionItem) => {
                const actionDescription = actionItem?.action_description;
                const urgencyLevel = actionItem?.urgency_level || 'Non défini';

                if (actionDescription) {
                  const actionKey = `${actionDescription}__${urgencyLevel}`;
                  actionsMap.set(actionKey, {
                    action_description: actionDescription,
                    urgency_level: urgencyLevel
                  });
                }
              });
            }
          } catch (e) { console.error("Erreur parse JSON item", item.id); }
        });

        const detailedThemes = Array.from(themesMap.entries()).map(([theme, ticketsMap]) => ({
          theme,
          tickets: Array.from(ticketsMap.values())
        }));

        const topDetailedThemes = detailedThemes.slice(0, 5);

        setThemeDetails(topDetailedThemes);
        setTopThemes(topDetailedThemes.map((item) => ({
          theme: item.theme,
          count: item.tickets.length
        })));

        const detailedIrritants = Array.from(irritantsMap.entries()).map(([irritant, actionsMap]) => {
          const actions = Array.from(actionsMap.values());
          return {
            irritant,
            actions,
            mainUrgency: getMainUrgency(actions)
          };
        });

        const topDetailedIrritants = detailedIrritants.slice(0, 5);

        setIrritantsDetails(topDetailedIrritants);
        setTopIrritants(topDetailedIrritants);
        setLoading(false);
      } catch (err) {
        console.error("Erreur API:", err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center text-center font-bold text-gray-400 animate-pulse">Chargement du Dashboard...</div>;

  return (
  <div className="h-full w-full bg-gray-50 flex flex-col gap-4 font-sans select-none overflow-hidden min-h-0 relative">
      <div className="shrink-0">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <SatisfactionGauge />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard label="Aujourd'hui" count={stats.day.count} average={stats.day.avg} deltaPct={stats.day.deltaPct} />
          <StatCard label="Ce mois-ci" count={stats.month.count} average={stats.month.avg} deltaPct={stats.month.deltaPct} />
          <StatCard label="Global" count={stats.total.count} average={stats.total.avg} deltaPct={stats.total.deltaPct} />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0 overflow-hidden">
    <AnalysisColumn 
        title="Irritants Majeurs" 
        items={topIrritants} 
        color="border-gray-400" 
        type="action"
        onClick={() => setSelectedColumn({ title: 'Irritants Majeurs', type: 'irritants', items: irritantsDetails })}
      />
    <AnalysisColumn 
        title="5 Grands Axes (Thèmes)" 
        items={topThemes} 
      color="border-gray-400" 
        type="theme"
        onClick={() => setSelectedColumn({ title: '5 Grands Axes (Thèmes)', type: 'themes', items: themeDetails })}
      />
    </div>

    {selectedColumn && (
      <div
        className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center px-4"
        onClick={() => setSelectedColumn(null)}
      >
        <div
          className="w-full max-w-xl bg-white rounded-lg border border-gray-300 shadow-lg p-5"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900">{selectedColumn.title}</h2>
            <button
              type="button"
              className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setSelectedColumn(null)}
            >
              Fermer
            </button>
          </div>

          {selectedColumn.items.length > 0 ? (
            <ul className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {selectedColumn.type === 'irritants' ? (
                selectedColumn.items.map((item, index) => (
                  <li key={`${item.irritant}-${index}`} className="text-sm text-gray-800 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${getUrgencyDotClass(item.mainUrgency)}`} />
                      <p className="font-semibold text-gray-900">{item.irritant}</p>
                    </div>
                    {item.actions.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.actions.map((action, actionIndex) => (
                          <div key={`${action.action_description}-${actionIndex}`} className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white">
                            <span className="font-medium">Action:</span> {action.action_description} | <span className="font-medium">Urgence:</span> {action.urgency_level}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic mt-2">Aucune action prioritaire associée</p>
                    )}
                  </li>
                ))
              ) : (
                selectedColumn.items.map((item, index) => (
                  <li key={`${item.theme}-${index}`} className="text-sm text-gray-800 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <p className="font-semibold text-gray-900">{item.theme}</p>
                    {item.tickets.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.tickets.map((ticket, ticketIndex) => (
                          <div key={`${ticket.ticketId}-${ticket.createdAt}-${ticketIndex}`} className="text-xs text-gray-700 border border-gray-200 rounded px-2 py-1 bg-white">
                            <span className="font-medium">Ticket ID:</span> {ticket.ticketId} | <span className="font-medium">Créé le:</span> {ticket.createdAt}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic mt-2">Aucun ticket associé</p>
                    )}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    )}
  </div>
  );
}