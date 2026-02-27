import React from 'react';
import { CurrentWeather, ModelTemperature } from '../types';
import { getWeatherIcon, getWeatherDescription } from '../constants';

interface Props {
  current: CurrentWeather;
  modelTemps: ModelTemperature;
  locationName: string;
}

const CurrentWeatherComponent: React.FC<Props> = ({ current, modelTemps, locationName }) => {
  const weatherIcon = getWeatherIcon(current.weathercode);
  const weatherDesc = getWeatherDescription(current.weathercode);

  // **حساب درجة الحرارة المحسوسة**
  const T = current.temperature_2m;
  const v = current.windspeed_10m;
  const vPow = Math.pow(v, 0.16);
  const feelsLike = 13.12 + (0.6215 * T) - (11.37 * vPow) + (0.3965 * T * vPow);

  // **تنسيق التاريخ يدوياً: يوم - شهر - سنة**
  const dateObj = new Date(current.time);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // شهور من 0-11
  const year = dateObj.getFullYear();
  const formattedDate = `${day} - ${month} - ${year}`;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl mx-4 mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{locationName}</h2>
      <p className="text-gray-600 mb-4">{formattedDate}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* أيقونة ودرجة الحرارة الرئيسية + المحسوسة */}
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

        {/* درجات الحرارة من النماذج مع أعلام الدول */}
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

        {/* المؤشرات الأربعة مع الرموز */}
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