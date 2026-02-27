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

  // دالة لحساب الحرارة المحسوسة بدقة أكبر
  const calculateFeelsLike = (temp: number, wind: number, humidity: number): number => {
    // إذا كانت الحرارة أقل من 10 درجات، نستخدم معادلة Wind Chill
    if (temp < 10) {
      // معادلة Wind Chill (لكل من C و km/h)
      const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
      return Math.round(windChill * 10) / 10; // تقريب لرقم عشري واحد
    } 
    // إذا كانت الحرارة أعلى من 20، نستخدم Heat Index (بسيط)
    else if (temp > 20) {
      // معادلة تقريبية لـ Heat Index
      const heatIndex = temp + (humidity * 0.1);
      return Math.round(heatIndex * 10) / 10;
    }
    // في المنطقة المعتدلة، نستخدم متوسط بسيط
    else {
      return Math.round((temp - (wind * 0.1) + (humidity * 0.05)) * 10) / 10;
    }
  };

  const feelsLike = calculateFeelsLike(current.temperature_2m, current.windspeed_10m, current.relativehumidity_2m);

  // تنسيق التاريخ بشكل جميل بدون ساعة
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl mx-4 mt-6">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-3xl font-bold text-gray-800">{locationName}</h2>
        <span className="text-sm text-gray-600 bg-white/30 px-3 py-1 rounded-full">
          {formatDate(current.time)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* أيقونة ودرجة الحرارة الرئيسية + المحسوسة */}
        <div className="col-span-1 flex items-center gap-4">
          <span className="text-7xl">{weatherIcon}</span>
          <div>
            <div className="text-5xl font-light">{current.temperature_2m.toFixed(1)}°C</div>
            <div className="text-gray-700">{weatherDesc}</div>
            <div className="text-sm text-gray-600 mt-2 flex items-center gap-1 bg-blue-100/50 px-2 py-1 rounded-full">
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

        {/* المؤشرات الأربعة: مطر، رطوبة، رياح، محسوسة (بدلاً من التساقط) */}
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