export async function GET() {
  try {
    const res = await fetch('http://localhost:3000/api/dashboard/satisfaction-data');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const apiData = await res.json();
    const total = apiData.total;
    const data = apiData.data;
    if (data.length === 0) {
      return Response.json({ average: null, total: 0 });
    }
    const average = data.reduce((sum, item) => sum + item.satisfaction, 0) / data.length;
    return Response.json({ average, total });
  } catch (error) {
    console.error('Error fetching from external API:', error);
    return Response.json({ error: 'Failed to fetch satisfaction data' }, { status: 500 });
  }
}