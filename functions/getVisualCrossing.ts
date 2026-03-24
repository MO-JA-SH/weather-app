export const onRequest = async ({ request, env }) => {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: 'missing lat/lon' }), { status: 400 });
  }
  const apiKey = env.VISUALCROSSING_KEY;
  const fetchUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&include=days&key=${apiKey}`;
  const res = await fetch(fetchUrl);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};