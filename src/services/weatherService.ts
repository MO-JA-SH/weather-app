import { Coordinates, WeatherData, CurrentWeather, ModelTemperature, DailyForecast, GeocodingResult } from '../types';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCity(query: string): Promise<GeocodingResult | null> {
  if (!query.trim()) return null;
  
  // **التعديل الأساسي: استخدام اللغة العربية في طلب الترميز الجغرافي**
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=ar&format=json`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

export async function fetchWeatherData(coords: Coordinates): Promise<WeatherData | null> {
  const { lat, lon, name } = coords;

  const url = new URL(WEATHER_URL);
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '16');
  url.searchParams.set('models', 'ecmwf_ifs,gfs_seamless,icon_seamless');
  url.searchParams.set('hourly', 'temperature_2m,relativehumidity_2m,precipitation,rain,windspeed_10m,weathercode');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('Weather API response not OK:', res.status);
      return null;
    }
    const data = await res.json();

    // **تحسين اختيار أقرب ساعة متوقعة للوقت الحالي**
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);
    
    let idx = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));
    
    if (idx === -1) {
      const nowTime = now.getTime();
      for (let i = 0; i < data.hourly.time.length; i++) {
        const forecastTime = new Date(data.hourly.time[i]).getTime();
        if (forecastTime >= nowTime) {
          idx = i;
          break;
        }
      }
    }
    if (idx === -1) idx = 0;

    // استخراج درجات الحرارة من النماذج المختلفة لحساب المتوسط
    const tempEcmwf = data.hourly.temperature_2m_ecmwf_ifs?.[idx];
    const tempGfs = data.hourly.temperature_2m_gfs_seamless?.[idx];
    const tempIcon = data.hourly.temperature_2m_icon_seamless?.[idx];

    const validTemps = [tempEcmwf, tempGfs, tempIcon].filter(t => t !== null && t !== undefined);
    const avgTemp = validTemps.length > 0 
      ? validTemps.reduce((sum, t) => sum + t, 0) / validTemps.length 
      : tempEcmwf ?? 0;

    const modelTemps: ModelTemperature = {
      ecmwf: tempEcmwf ?? null,
      gfs: tempGfs ?? null,
      icon: tempIcon ?? null,
    };

    const current: CurrentWeather = {
      time: data.hourly.time[idx],
      temperature_2m: avgTemp,
      weathercode: data.hourly.weathercode_ecmwf_ifs?.[idx] ?? 0,
      windspeed_10m: data.hourly.windspeed_10m_ecmwf_ifs?.[idx] ?? 0,
      relativehumidity_2m: data.hourly.relativehumidity_2m_ecmwf_ifs?.[idx] ?? 0,
      precipitation: data.hourly.precipitation_ecmwf_ifs?.[idx] ?? 0,
      rain: data.hourly.rain_ecmwf_ifs?.[idx] ?? 0,
    };

    const daily: DailyForecast[] = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      daily.push({
        date: data.daily.time[i],
        weathercode: data.daily.weathercode_ecmwf_ifs?.[i] ?? 0,
        temperature_2m_max: data.daily.temperature_2m_max_ecmwf_ifs?.[i] ?? 0,
        temperature_2m_min: data.daily.temperature_2m_min_ecmwf_ifs?.[i] ?? 0,
        precipitation_sum: data.daily.precipitation_sum_ecmwf_ifs?.[i] ?? 0,
      });
    }

    return {
      current,
      modelTemps,
      daily,
      timezone: data.timezone,
      locationName: name || 'الموقع الحالي',
    };
  } catch (err) {
    console.error('Weather fetch error:', err);
    return null;
  }
}