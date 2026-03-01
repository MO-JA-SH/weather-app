import { Coordinates } from '../types';

const NETLIFY_FUNCTION_URL = 'https://celebrated-figolla-ce3d88.netlify.app/.netlify/functions/getWeatherAPI';

export interface WeatherApiComData {
  current: {
    time: string;
    temperature_2m: number;
    weathercode: number;
    windspeed_10m: number;
    relativehumidity_2m: number;
    precipitation: number;
    rain: number;
    feelslike: number;
    condition: string;
  };
  daily: {
    date: string;
    weathercode: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
    precipitation_sum: number;
  }[];
}

export async function fetchWeatherApiComData(coords: Coordinates): Promise<WeatherApiComData | null> {
  const { lat, lon } = coords;

  const url = new URL(NETLIFY_FUNCTION_URL);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('WeatherAPI.com response not OK:', res.status);
      return null;
    }
    const data = await res.json();

    // التحقق من هيكل البيانات
    console.log('WeatherAPI.com raw data:', data);

    // البيانات الحالية (موجودة في data.current)
    const currentData = data.current;

    // بيانات التوقعات (المسار الصحيح: data.forecast.forecast.forecastday)
    const forecastData = data.forecast?.forecast?.forecastday;

    if (!forecastData) {
      console.error('لم يتم العثور على بيانات التوقعات في الـ response', data);
      return null;
    }

    // تحويل سرعة الرياح من كم/س إلى م/ث (تقريباً)
    const windSpeedMs = currentData.wind_kph * 0.27778;

    const daily = forecastData.map((day: any) => ({
      date: day.date + 'T12:00:00Z',
      weathercode: day.day.condition.code,
      temperature_2m_max: day.day.maxtemp_c,
      temperature_2m_min: day.day.mintemp_c,
      precipitation_sum: day.day.totalprecip_mm,
    }));

    return {
      current: {
        time: currentData.last_updated,
        temperature_2m: currentData.temp_c,
        weathercode: currentData.condition.code,
        windspeed_10m: windSpeedMs,
        relativehumidity_2m: currentData.humidity,
        precipitation: currentData.precip_mm,
        rain: currentData.precip_mm,
        feelslike: currentData.feelslike_c,
        condition: currentData.condition.text,
      },
      daily,
    };
  } catch (err) {
    console.error('WeatherAPI.com fetch error:', err);
    return null;
  }
}