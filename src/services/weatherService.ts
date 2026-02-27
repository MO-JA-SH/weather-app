import { Coordinates, WeatherData, CurrentWeather, ModelTemperature, ModelPrecipitation, DailyForecast, HourlyForecast, GeocodingResult } from '../types';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchCity(query: string): Promise<GeocodingResult | null> {
  if (!query.trim()) return null;
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
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

    // **1. تحديد الساعة الحالية**
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

    // **2. متوسط درجات الحرارة للساعة الحالية (للعرض الرئيسي)**
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

    // **3. تجهيز بيانات كل الساعات**
    const allHourly: HourlyForecast[] = [];
    for (let i = 0; i < data.hourly.time.length; i++) {
      const hTempEcmwf = data.hourly.temperature_2m_ecmwf_ifs?.[i];
      const hTempGfs = data.hourly.temperature_2m_gfs_seamless?.[i];
      const hTempIcon = data.hourly.temperature_2m_icon_seamless?.[i];
      
      allHourly.push({
        time: data.hourly.time[i],
        temperature_2m: hTempEcmwf ?? 0,
        weathercode: data.hourly.weathercode_ecmwf_ifs?.[i] ?? 0,
        windspeed_10m: data.hourly.windspeed_10m_ecmwf_ifs?.[i] ?? 0,
        relativehumidity_2m: data.hourly.relativehumidity_2m_ecmwf_ifs?.[i] ?? 0,
        precipitation: data.hourly.precipitation_ecmwf_ifs?.[i] ?? 0,
        rain: data.hourly.rain_ecmwf_ifs?.[i] ?? 0,
        modelTemps: {
          ecmwf: hTempEcmwf ?? null,
          gfs: hTempGfs ?? null,
          icon: hTempIcon ?? null,
        },
      });
    }

    // **4. التوقعات اليومية مع متوسط درجات الحرارة وكميات الأمطار لكل نموذج**
    const daily: DailyForecast[] = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      // استخراج درجات الحرارة العظمى لكل نموذج
      const maxEcmwf = data.daily.temperature_2m_max_ecmwf_ifs?.[i];
      const maxGfs = data.daily.temperature_2m_max_gfs_seamless?.[i];
      const maxIcon = data.daily.temperature_2m_max_icon_seamless?.[i];
      const validMax = [maxEcmwf, maxGfs, maxIcon].filter(t => t !== null && t !== undefined);
      const avgMax = validMax.length > 0 ? validMax.reduce((sum, t) => sum + t, 0) / validMax.length : maxEcmwf ?? 0;

      // استخراج درجات الحرارة الصغرى لكل نموذج
      const minEcmwf = data.daily.temperature_2m_min_ecmwf_ifs?.[i];
      const minGfs = data.daily.temperature_2m_min_gfs_seamless?.[i];
      const minIcon = data.daily.temperature_2m_min_icon_seamless?.[i];
      const validMin = [minEcmwf, minGfs, minIcon].filter(t => t !== null && t !== undefined);
      const avgMin = validMin.length > 0 ? validMin.reduce((sum, t) => sum + t, 0) / validMin.length : minEcmwf ?? 0;

      // استخراج كميات الأمطار لكل نموذج
      const precipEcmwf = data.daily.precipitation_sum_ecmwf_ifs?.[i] ?? null;
      const precipGfs = data.daily.precipitation_sum_gfs_seamless?.[i] ?? null;
      const precipIcon = data.daily.precipitation_sum_icon_seamless?.[i] ?? null;

      daily.push({
        date: data.daily.time[i],
        weathercode: data.daily.weathercode_ecmwf_ifs?.[i] ?? 0,
        temperature_2m_max: avgMax,
        temperature_2m_min: avgMin,
        precipitation_sum: precipEcmwf ?? 0, // نحتفظ بالمتوسط للاستخدام العام (اختياري)
        modelPrecipitation: {
          ecmwf: precipEcmwf,
          gfs: precipGfs,
          icon: precipIcon,
        },
      });
    }

    // **5. ربط الساعات بكل يوم**
    const dailyWithHourly = daily.map(day => {
      const dayDate = day.date.split('T')[0];
      const dayHours = allHourly.filter(h => h.time.startsWith(dayDate));
      return {
        ...day,
        hourly: dayHours,
      };
    });

    return {
      current,
      modelTemps,
      daily: dailyWithHourly,
      timezone: data.timezone,
      locationName: name || 'الموقع الحالي',
      allHourly,
    };
  } catch (err) {
    console.error('Weather fetch error:', err);
    return null;
  }
}