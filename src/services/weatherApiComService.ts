import { Coordinates } from '../types';

// استبدل هذا بالرابط الفعلي من Netlify
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

    const current = data.current;
    const forecast = data.forecast;

    // تحويل سرعة الرياح من كم/س إلى م/ث (تقريباً)
    const windSpeedMs = current.wind_kph * 0.27778;

    const daily = forecast.forecastday.map((day: any) => ({
      date: day.date + 'T12:00:00Z',
      weathercode: day.day.condition.code,
      temperature_2m_max: day.day.maxtemp_c,
      temperature_2m_min: day.day.mintemp_c,
      precipitation_sum: day.day.totalprecip_mm,
    }));

    return {
      current: {
        time: current.last_updated,
        temperature_2m: current.temp_c,
        weathercode: current.condition.code,
        windspeed_10m: windSpeedMs,
        relativehumidity_2m: current.humidity,
        precipitation: current.precip_mm,
        rain: current.precip_mm,
        feelslike: current.feelslike_c,
        condition: current.condition.text,
      },
      daily,
    };
  } catch (err) {
    console.error('WeatherAPI.com fetch error:', err);
    return null;
  }
}