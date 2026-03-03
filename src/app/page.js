"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import AnalysisColumn from '../components/AnalysisColumn';
import SatisfactionGauge from '../components/Satisfaction';
import Motivation from '../components/Motivation';
import SectionDistribution from '../components/SectionDistribution';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
  const [expandedThemeRows, setExpandedThemeRows] = useState({});
  const [commentGroups, setCommentGroups] = useState({ day: [], month: [], total: [] });
  const [motivationItems, setMotivationItems] = useState([]);
  const [selectedCommentGroup, setSelectedCommentGroup] = useState(null);
  const [expandedCommentRows, setExpandedCommentRows] = useState({});
  const [sectionDistribution, setSectionDistribution] = useState([
    { key: 'ERP', label: 'ERP', count: 0 },
    { key: 'Admin', label: 'Admin', count: 0 },
    { key: 'Support', label: 'Support', count: 0 }
  ]);
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
        const [satisfactionResult, sectionsResult] = await Promise.allSettled([
          axios.get(`${BASE_PATH}/api/external/dashboard/satisfaction-data`),
          axios.get(`${BASE_PATH}/api/external/dashboard/sections-distribution`)
        ]);

        if (satisfactionResult.status !== 'fulfilled') {
          throw satisfactionResult.reason;
        }

        const satisfactionRes = satisfactionResult.value;
        const sectionsRes = sectionsResult.status === 'fulfilled' ? sectionsResult.value : null;

        const items = Array.isArray(satisfactionRes.data.data) ? satisfactionRes.data.data : [];
        const apiStats = satisfactionRes.data.stats;

        const sections = Array.isArray(sectionsRes?.data?.sections)
          ? sectionsRes.data.sections
          : [];

        setSectionDistribution([
          sections.find((section) => section.key === 'ERP') ?? { key: 'ERP', label: 'ERP', count: 0 },
          sections.find((section) => section.key === 'Admin') ?? { key: 'Admin', label: 'Admin', count: 0 },
          sections.find((section) => section.key === 'Support') ?? { key: 'Support', label: 'Support', count: 0 }
        ]);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayKey = `${year}-${month}-${day}`;
        const monthKey = `${year}-${month}`;

        const processStats = (filteredItems) => {
          const sortedItems = [...filteredItems].sort((left, right) => {
            return Number(right.id || 0) - Number(left.id || 0);
          });

          const count = filteredItems.length;
          const avg = count
            ? filteredItems.reduce((acc, curr) => acc + Number(curr.satisfaction || 0), 0) / count
            : 0;

          let deltaPct = 0;
          if (sortedItems.length >= 2) {
            const total = sortedItems.reduce((acc, curr) => acc + Number(curr.satisfaction || 0), 0);
            const currentAvg = total / sortedItems.length;
            const previousTotal = total - Number(sortedItems[0]?.satisfaction || 0);
            const previousAvg = previousTotal / (sortedItems.length - 1);
            deltaPct = currentAvg - previousAvg;
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

        const dayItems = items.filter(item => getReferenceDate(item).startsWith(todayKey));
        const monthItems = items.filter(item => getReferenceDate(item).startsWith(monthKey));
        const totalItems = items;

        const mapCommentRows = (rows) => rows.map((item, index) => ({
          rowId: `${item?.tickets_id ?? item?.id ?? 'N/A'}-${getReferenceDate(item)}-${index}`,
          ticketId: item?.tickets_id ?? item?.id ?? 'N/A',
          createdAt: getReferenceDate(item) || 'N/A',
          comment: item?.comment || 'Aucun commentaire',
          satisfaction: Number(item?.satisfaction ?? 0)
        }));

        setCommentGroups({
          day: mapCommentRows(dayItems),
          month: mapCommentRows(monthItems),
          total: mapCommentRows(totalItems)
        });

        const positiveComments = totalItems
          .filter((item) => Number(item?.satisfaction ?? 0) >= 4 && String(item?.comment || '').trim() !== '')
          .map((item, index) => ({
            rowId: `motivation-${item?.tickets_id ?? item?.id ?? 'N/A'}-${index}`,
            ticketId: item?.tickets_id ?? item?.id ?? 'N/A',
            createdAt: getReferenceDate(item) || 'N/A',
            comment: item?.comment,
            satisfaction: Number(item?.satisfaction ?? 0)
          }))
          .slice(0, 20);

        setMotivationItems(positiveComments);

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
                createdAt,
                comment: item?.comment || 'Aucun commentaire',
                satisfaction: Number(item?.satisfaction ?? 0)
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

        const detailedThemes = Array.from(themesMap.entries())
          .map(([theme, ticketsMap]) => ({
            theme,
            tickets: Array.from(ticketsMap.values())
          }))
          .sort((left, right) => {
            const countDiff = right.tickets.length - left.tickets.length;
            if (countDiff !== 0) return countDiff;
            return String(left.theme).localeCompare(String(right.theme), 'fr');
          });

        setThemeDetails(detailedThemes);
        setTopThemes(detailedThemes.map((item) => ({
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
          <StatCard
            label="Aujourd'hui"
            count={stats.day.count}
            average={stats.day.avg}
            deltaPct={stats.day.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: "Commentaires - Aujourd'hui", items: commentGroups.day });
            }}
          />
          <StatCard
            label="Ce mois-ci"
            count={stats.month.count}
            average={stats.month.avg}
            deltaPct={stats.month.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: 'Commentaires - Ce mois-ci', items: commentGroups.month });
            }}
          />
          <StatCard
            label="Global"
            count={stats.total.count}
            average={stats.total.avg}
            deltaPct={stats.total.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: 'Commentaires - Global', items: commentGroups.total });
            }}
          />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0 overflow-hidden">
    <AnalysisColumn 
        title="Irritants Majeurs" 
        items={topIrritants} 
        color="border-gray-400" 
        type="action"
        onClick={() => {
          setExpandedThemeRows({});
          setSelectedColumn({ title: 'Irritants Majeurs', type: 'irritants', items: irritantsDetails });
        }}
      />
    <AnalysisColumn 
        title="Axes principale (Thèmes)" 
        items={topThemes} 
      color="border-gray-400" 
        type="theme"
        onClick={() => {
          setExpandedThemeRows({});
          setSelectedColumn({ title: 'Axes principale (Thèmes)', type: 'themes', items: themeDetails });
        }}
      />
    <div className="lg:col-span-2 min-h-0">
      <SectionDistribution sections={sectionDistribution} />
    </div>
    <div className="min-h-0">
      <Motivation items={motivationItems} />
    </div>
    </div>

    {selectedColumn && (
      <div
        className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center px-4"
        onClick={() => {
          setExpandedThemeRows({});
          setSelectedColumn(null);
        }}
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
              onClick={() => {
                setExpandedThemeRows({});
                setSelectedColumn(null);
              }}
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
                        {item.tickets.map((ticket, ticketIndex) => {
                          const rowKey = `${item.theme}-${ticket.ticketId}-${ticket.createdAt}-${ticketIndex}`;
                          const isExpanded = Boolean(expandedThemeRows[rowKey]);

                          return (
                            <div key={rowKey} className="text-xs text-gray-700 border border-gray-200 rounded bg-white overflow-hidden">
                              <button
                                type="button"
                                className="w-full px-2 py-1.5 flex items-center justify-between gap-3 text-left hover:bg-gray-50"
                                onClick={() => {
                                  setExpandedThemeRows((previous) => ({
                                    ...previous,
                                    [rowKey]: !previous[rowKey]
                                  }));
                                }}
                              >
                                <span>
                                  <span className="font-medium">Ticket ID:</span> {ticket.ticketId} | <span className="font-medium">Créé le:</span> {ticket.createdAt}
                                </span>
                                <span className="text-gray-700 font-black text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 bg-gray-100">
                                  {isExpanded ? '▾' : '▸'}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="px-2 py-2 border-t border-gray-200 bg-gray-50 space-y-1">
                                  <p><span className="font-medium">Note:</span> {ticket.satisfaction}</p>
                                  <p><span className="font-medium">Commentaire:</span> {ticket.comment}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
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

    {selectedCommentGroup && (
      <div
        className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center px-4"
        onClick={() => {
          setExpandedCommentRows({});
          setSelectedCommentGroup(null);
        }}
      >
        <div
          className="w-full max-w-xl bg-white rounded-lg border border-gray-300 shadow-lg p-5"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-gray-900">{selectedCommentGroup.title}</h2>
            <button
              type="button"
              className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setExpandedCommentRows({});
                setSelectedCommentGroup(null);
              }}
            >
              Fermer
            </button>
          </div>

          {selectedCommentGroup.items.length > 0 ? (
            <ul className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {selectedCommentGroup.items.map((ticket) => {
                const isExpanded = Boolean(expandedCommentRows[ticket.rowId]);

                return (
                  <li key={ticket.rowId} className="text-xs text-gray-700 border border-gray-200 rounded bg-white overflow-hidden">
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 flex items-center justify-between gap-3 text-left hover:bg-gray-50"
                      onClick={() => {
                        setExpandedCommentRows((previous) => ({
                          ...previous,
                          [ticket.rowId]: !previous[ticket.rowId]
                        }));
                      }}
                    >
                      <span>
                        <span className="font-medium">Ticket ID:</span> {ticket.ticketId} | <span className="font-medium">Créé le:</span> {ticket.createdAt}
                      </span>
                      <span className="text-gray-700 font-black text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md border border-gray-300 bg-gray-100">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-2 py-2 border-t border-gray-200 bg-gray-50 space-y-1">
                        <p><span className="font-medium">Note:</span> {ticket.satisfaction}</p>
                        <p><span className="font-medium">Commentaire:</span> {ticket.comment}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun commentaire disponible</p>
          )}
        </div>
      </div>
    )}
  </div>
  );
}