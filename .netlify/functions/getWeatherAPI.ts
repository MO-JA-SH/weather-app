export const handler = async (event: any, context: any) => {
  // السماح بالطلبات فقط من موقع GitHub Pages والـ localhost
  const allowedOrigins = ['https://mo-ja-sh.github.io', 'http://localhost:3000'];
  const origin = event.headers.origin || event.headers.Origin || '';

  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'غير مصرح به من هذا المصدر' }),
    };
  }

  const { lat, lon } = event.queryStringParameters || {};
  if (!lat || !lon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'خط العرض وخط الطول مطلوبان' }),
    };
  }

  // مفتاح API الخاص بـ WeatherAPI.com
  const API_KEY = '1a5f71373156499dbc701501260103';

  const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no&lang=ar`;
  const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=3&aqi=no&lang=ar`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error('فشل الاتصال بـ WeatherAPI.com');
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current: currentData,
        forecast: forecastData
      }),
    };
  } catch (error) {
    console.error('خطأ في دالة Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'فشل جلب البيانات من WeatherAPI.com' }),
    };
  }
};