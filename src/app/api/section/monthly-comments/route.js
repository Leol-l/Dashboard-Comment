const EMPTY_PAYLOAD = {
  total: 0,
  data: [],
  stats: {
    today: { count: 0, avg: 0, deltaPct: 0 },
    month: { count: 0, avg: 0, deltaPct: 0 },
    global: { count: 0, avg: 0, deltaPct: 0 }
  },
  monthlyComments: []
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'Support';

    const response = await fetch(`http://localhost:3000/api/dashboard/section-monthly-comments?section=${encodeURIComponent(section)}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const payload = await response.json();
      return Response.json(payload);
    }

    if (response.status === 404) {
      return Response.json({
        ...EMPTY_PAYLOAD,
        section,
        warning: 'Route section-monthly-comments introuvable sur API-GLPI. Redémarre API-GLPI pour charger la nouvelle route.'
      });
    }

    return Response.json({ ...EMPTY_PAYLOAD, section });
  } catch (error) {
    console.error('Erreur proxy section dashboard:', error);
    return Response.json(EMPTY_PAYLOAD);
  }
}
