export const handler = async (event: any, context: any) => {
  // السماح فقط لموقع GitHub Pages والـ localhost
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

  const API_KEY = 'RYUF8W6ZBGAXQHH8MGX7JHPPF';

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&include=days,hours,current&key=${API_KEY}&lang=ar`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('فشل الاتصال بـ Visual Crossing');
    }
    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('خطأ في دالة Netlify:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'فشل جلب البيانات من Visual Crossing' }),
    };
  }
};