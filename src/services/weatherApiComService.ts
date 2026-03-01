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
    hourly?: any[]; // إضافة بيانات الساعات
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
    console.log('WeatherAPI.com raw data:', data);

    if (!data.current?.current) {
      console.error('لا توجد بيانات حالية في الـ response', data);
      return null;
    }

    const currentData = data.current.current;
    const forecastday = data.forecast?.forecast?.forecastday;
    if (!forecastday || !Array.isArray(forecastday)) {
      console.error('لا توجد بيانات توقعات في الـ response', data);
      return null;
    }

    const windSpeedMs = currentData.wind_kph * 0.27778;

    // تجهيز التوقعات اليومية مع بيانات الساعات
    const daily = forecastday.map((day: any) => {
      // تحويل بيانات الساعات إلى الشكل المطلوب للمودال
      const hourly = day.hour.map((hour: any) => {
        // سرعة الرياح لكل ساعة (تحويل من كم/س إلى م/ث)
        const hourWindMs = hour.wind_kph * 0.27778;
        return {
          time: hour.time,
          temperature_2m: hour.temp_c,
          weathercode: hour.condition.code,
          windspeed_10m: hourWindMs,
          relativehumidity_2m: hour.humidity,
          precipitation: hour.precip_mm,
          rain: hour.precip_mm,
          modelTemps: { // لا توجد نماذج متعددة، نضع null
            ecmwf: null,
            gfs: null,
            icon: null,
          },
        };
      });

      return {
        date: day.date + 'T12:00:00Z',
        weathercode: day.day.condition.code,
        temperature_2m_max: day.day.maxtemp_c,
        temperature_2m_min: day.day.mintemp_c,
        precipitation_sum: day.day.totalprecip_mm,
        hourly: hourly, // إضافة بيانات الساعات
      };
    });

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