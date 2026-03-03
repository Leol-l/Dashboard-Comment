"use client";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import StatCard from './StatCard';
import AnalysisColumn from './AnalysisColumn';
import Motivation from './Motivation';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function SectionDashboardTemplate({ section }) {
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
  const [sectionItems, setSectionItems] = useState([]);
  const [monthlyComments, setMonthlyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [expandedThemeRows, setExpandedThemeRows] = useState({});
  const [selectedCommentGroup, setSelectedCommentGroup] = useState(null);
  const [expandedCommentRows, setExpandedCommentRows] = useState({});

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
    const fetchSectionData = async () => {
      try {
        const response = await axios.get(`${BASE_PATH}/api/section/monthly-comments`, {
          params: { section }
        });
        const payload = response?.data ?? {};

        setStats({
          day: sanitizeStat(payload?.stats?.today),
          month: sanitizeStat(payload?.stats?.month),
          total: sanitizeStat(payload?.stats?.global)
        });

        setSectionItems(Array.isArray(payload?.data) ? payload.data : []);
        setMonthlyComments(Array.isArray(payload?.monthlyComments) ? payload.monthlyComments : []);
      } catch (error) {
        console.warn(`Données ${section} indisponibles temporairement.`);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchSectionData();
    const interval = setInterval(fetchSectionData, 60000);

    return () => clearInterval(interval);
  }, [section]);

  const chartData = useMemo(
    () =>
      monthlyComments.map((entry) => ({
        ...entry,
        label: String(entry?.date || '').slice(5)
      })),
    [monthlyComments]
  );

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

  const commentGroups = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayKey = `${year}-${month}-${day}`;
    const monthKey = `${year}-${month}`;

    const dayItems = sectionItems.filter(item => getReferenceDate(item).startsWith(todayKey));
    const monthItems = sectionItems.filter(item => getReferenceDate(item).startsWith(monthKey));
    const totalItems = sectionItems;

    const mapCommentRows = (rows) => rows.map((item, index) => ({
      rowId: `${item?.tickets_id ?? item?.id ?? 'N/A'}-${getReferenceDate(item)}-${index}`,
      ticketId: item?.tickets_id ?? item?.id ?? 'N/A',
      createdAt: getReferenceDate(item) || 'N/A',
      comment: item?.comment || 'Aucun commentaire',
      satisfaction: Number(item?.satisfaction ?? 0)
    }));

    return {
      day: mapCommentRows(dayItems),
      month: mapCommentRows(monthItems),
      total: mapCommentRows(totalItems)
    };
  }, [sectionItems]);

  const themeDetails = useMemo(() => {
    const themesMap = new Map();

    sectionItems.forEach((item) => {
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
      } catch (_error) {
      }
    });

    return Array.from(themesMap.entries())
      .map(([theme, ticketsMap]) => ({
        theme,
        tickets: Array.from(ticketsMap.values())
      }))
      .sort((left, right) => {
        const countDiff = right.tickets.length - left.tickets.length;
        if (countDiff !== 0) return countDiff;
        return String(left.theme).localeCompare(String(right.theme), 'fr');
      });
  }, [sectionItems]);

  const topThemes = useMemo(() => {
    return themeDetails
      .map((item) => ({
        theme: item.theme,
        count: item.tickets.length
      }))
      .slice(0, 5);
  }, [themeDetails]);

  const irritantsDetails = useMemo(() => {
    const irritantsMap = new Map();

    sectionItems.forEach((item) => {
      try {
        const analysis = typeof item.analysis_result === 'string'
          ? JSON.parse(item.analysis_result)
          : item.analysis_result;

        const irritant = analysis?.irritants_majeurs;
        const actions = Array.isArray(analysis?.actions_prioritaires) ? analysis.actions_prioritaires : [];

        if (!irritant) return;

        if (!irritantsMap.has(irritant)) {
          irritantsMap.set(irritant, new Map());
        }

        const actionsMap = irritantsMap.get(irritant);

        actions.forEach((actionItem) => {
          const actionDescription = actionItem?.action_description;
          const urgencyLevel = actionItem?.urgency_level || 'Non défini';

          if (!actionDescription) return;

          const actionKey = `${actionDescription}__${urgencyLevel}`;
          actionsMap.set(actionKey, {
            action_description: actionDescription,
            urgency_level: urgencyLevel
          });
        });
      } catch (_error) {
      }
    });

    return Array.from(irritantsMap.entries())
      .map(([irritant, actionsMap]) => {
        const actions = Array.from(actionsMap.values());
        return {
          irritant,
          actions,
          mainUrgency: getMainUrgency(actions)
        };
      })
      .slice(0, 5);
  }, [sectionItems]);

  const topIrritants = useMemo(() => irritantsDetails.slice(0, 5), [irritantsDetails]);

  const motivationItems = useMemo(() => {
    return sectionItems
      .filter((item) => Number(item?.satisfaction ?? 0) >= 4 && String(item?.comment || '').trim() !== '')
      .map((item, index) => ({
        rowId: `motivation-${item?.tickets_id ?? item?.id ?? 'N/A'}-${index}`,
        ticketId: item?.tickets_id ?? item?.id ?? 'N/A',
        createdAt: normalizeDateKey(item?.date_answered) || 'N/A',
        comment: item?.comment,
        satisfaction: Number(item?.satisfaction ?? 0)
      }))
      .slice(0, 20);
  }, [sectionItems]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-center font-bold text-gray-400 animate-pulse">
        Chargement {section}...
      </div>
    );
  }

  return (
    <section className="h-full w-full bg-gray-50 flex flex-col gap-4 min-h-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            label={`Aujourd'hui (${section})`}
            count={stats.day.count}
            average={stats.day.avg}
            deltaPct={stats.day.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: `Commentaires - Aujourd'hui (${section})`, items: commentGroups.day });
            }}
          />
          <StatCard
            label={`Ce mois-ci (${section})`}
            count={stats.month.count}
            average={stats.month.avg}
            deltaPct={stats.month.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: `Commentaires - Ce mois-ci (${section})`, items: commentGroups.month });
            }}
          />
          <StatCard
            label={`Global (${section})`}
            count={stats.total.count}
            average={stats.total.avg}
            deltaPct={stats.total.deltaPct}
            onCommentsClick={() => {
              setExpandedCommentRows({});
              setSelectedCommentGroup({ title: `Commentaires - Global (${section})`, items: commentGroups.total });
            }}
          />
        </div>
        <AnalysisColumn
          title="Irritants Majeurs"
          items={topIrritants}
          color="border-gray-400"
          type="action"
          onClick={() => {
            setExpandedThemeRows({});
            setSelectedColumn({ title: `Irritants Majeurs (${section})`, type: 'irritants', items: irritantsDetails });
          }}
        />
        <AnalysisColumn
          title="Axes principale (Thèmes)"
          items={topThemes}
          color="border-gray-400"
          type="theme"
          onClick={() => {
            setExpandedThemeRows({});
            setSelectedColumn({ title: `Axes principale (Thèmes) - ${section}`, type: 'themes', items: themeDetails });
          }}
        />
      </div>

      <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 min-h-0">
          <Motivation items={motivationItems} />
        </div>

        <div className="lg:col-span-4 min-h-0 rounded-lg border border-blue-300 border-l-4 border-l-blue-500 p-4 bg-white hover:shadow-sm transition-all flex flex-col">
          <h2 className="text-gray-700 text-[13px] font-semibold uppercase tracking-widest mb-4">
            Nombre de commentaires (30 derniers jours) - {section}
          </h2>

          <div className="w-full flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Commentaires']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                />
                <Line type="monotone" dataKey="count" stroke="#0987cf" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
    </section>
  );
}
