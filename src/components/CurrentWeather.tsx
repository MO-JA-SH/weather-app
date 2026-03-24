import React from 'react';
import { CurrentWeather, ModelTemperature, DailyForecast } from '../types';
import { getWeatherIcon, getWeatherDescription } from '../constants';

interface Props {
  current: CurrentWeather;
  modelTemps: ModelTemperature;
  locationName: string;
  dailyForecast?: DailyForecast;
}

const CurrentWeatherComponent: React.FC<Props> = ({ current, modelTemps, locationName, dailyForecast }) => {
  const weatherIcon = getWeatherIcon(current.weathercode);
  const weatherDesc = getWeatherDescription(current.weathercode);

  const T = current.temperature_2m;
  const v = current.windspeed_10m;
  const vPow = Math.pow(v, 0.16);
  const feelsLike = 13.12 + (0.6215 * T) - (11.37 * vPow) + (0.3965 * T * vPow);

  const dateObj = new Date(current.time);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const formattedDate = `${day} - ${month} - ${year}`;

  const getWeatherDescriptionForSummary = (code: number): string => {
    if (code === 0) return 'مشمساً';
    if (code === 1 || code === 2) return 'غائماً جزئياً';
    if (code === 3) return 'غائماً';
    if (code >= 45 && code <= 48) return 'ضبابياً';
    if (code >= 51 && code <= 67) return 'ممطراً (خفيف)';
    if (code >= 61 && code <= 65) return 'ممطراً';
    if (code >= 71 && code <= 77) return 'ثلجياً';
    if (code >= 80 && code <= 82) return 'ممطراً (زخات)';
    if (code >= 85 && code <= 86) return 'ثلجياً (زخات)';
    if (code >= 95 && code <= 99) return 'عاصفاً مع رعد';
    return 'متغيراً';
  };

  const LTR = "\u202A";
  const PDF = "\u202C";

  const summaryText = dailyForecast
    ? `“يتوقع اليوم أن يكون الطقس ${getWeatherDescriptionForSummary(dailyForecast.weathercode)}، ودرجة الحرارة العظمى ${LTR}${dailyForecast.temperature_2m_max.toFixed(0)}°م${PDF} والصغرى ${LTR}${dailyForecast.temperature_2m_min.toFixed(0)}°م${PDF}.”`
    : `“يتوقع أن يكون الطقس اليوم ${getWeatherDescriptionForSummary(current.weathercode)}، ودرجة الحرارة ${LTR}${current.temperature_2m.toFixed(0)}°م${PDF}.”`;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl mx-4 mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-1">{locationName}</h2>
      <div className="text-blue-700 text-base mb-2">{summaryText}</div>
      <p className="text-gray-600 mb-4">{formattedDate}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 flex items-center gap-4">
          <span className="text-7xl">{weatherIcon}</span>
          <div>
            <div className="text-5xl font-light">{current.temperature_2m.toFixed(1)}°C</div>
            <div className="text-gray-700">{weatherDesc}</div>
            <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <span>🌡️</span> محسوسة: {feelsLike.toFixed(1)}°C
            </div>
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-3 gap-2">
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-gray-700">ECMWF</div>
            <div className="text-2xl font-semibold my-1">{modelTemps.ecmwf?.toFixed(1) ?? '—'}°</div>
            <div className="text-3xl">🇪🇺</div>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-gray-700">GFS</div>
            <div className="text-2xl font-semibold my-1">{modelTemps.gfs?.toFixed(1) ?? '—'}°</div>
            <div className="text-3xl">🇺🇸</div>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm font-semibold text-gray-700">ICON</div>
            <div className="text-2xl font-semibold my-1">{modelTemps.icon?.toFixed(1) ?? '—'}°</div>
            <div className="text-3xl">🇩🇪</div>
          </div>
        </div>

        <div className="col-span-1 grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">☔</span>
            <div>
              <div className="text-xs text-gray-500">مطر</div>
              <div className="text-lg font-medium">{current.precipitation.toFixed(1)} mm</div>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <div>
              <div className="text-xs text-gray-500">رطوبة</div>
              <div className="text-lg font-medium">{current.relativehumidity_2m.toFixed(0)}%</div>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">💨</span>
            <div>
              <div className="text-xs text-gray-500">رياح</div>
              <div className="text-lg font-medium">{current.windspeed_10m.toFixed(1)} km/h</div>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">🌡️</span>
            <div>
              <div className="text-xs text-gray-500">محسوسة</div>
              <div className="text-lg font-medium">{feelsLike.toFixed(1)}°C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherComponent;