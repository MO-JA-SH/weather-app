export const onRequest = async ({ request, env }) => {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');
  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: 'missing lat/lon' }), { status: 400 });
  }
  const apiKey = env.WEATHERAPI_KEY;
  const fetchUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;
  const res = await fetch(fetchUrl);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};