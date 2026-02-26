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

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl mx-4 mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{locationName}</h2>
      <p className="text-gray-600 mb-4">{new Date(current.time).toLocaleString('ar')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* أيقونة ودرجة الحرارة الرئيسية */}
        <div className="col-span-1 flex items-center gap-4">
          <span className="text-7xl">{weatherIcon}</span>
          <div>
            <div className="text-5xl font-light">{current.temperature_2m.toFixed(1)}°C</div>
            <div className="text-gray-700">{weatherDesc}</div>
          </div>
        </div>

        {/* درجات الحرارة من النماذج */}
        <div className="col-span-1 grid grid-cols-3 gap-2">
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm text-gray-600">ECMWF</div>
            <div className="text-2xl font-semibold">{modelTemps.ecmwf?.toFixed(1) ?? '—'}°</div>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm text-gray-600">GFS</div>
            <div className="text-2xl font-semibold">{modelTemps.gfs?.toFixed(1) ?? '—'}°</div>
          </div>
          <div className="bg-blue-50/70 rounded-xl p-3 text-center">
            <div className="text-sm text-gray-600">ICON</div>
            <div className="text-2xl font-semibold">{modelTemps.icon?.toFixed(1) ?? '—'}°</div>
          </div>
        </div>

        {/* مؤشرات إضافية */}
        <div className="col-span-1 grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-xs text-gray-500">تساقط</div>
            <div className="text-lg font-medium">{current.precipitation.toFixed(1)} mm</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-xs text-gray-500">رطوبة</div>
            <div className="text-lg font-medium">{current.relativehumidity_2m.toFixed(0)}%</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-xs text-gray-500">رياح</div>
            <div className="text-lg font-medium">{current.windspeed_10m.toFixed(1)} km/h</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <div className="text-xs text-gray-500">مطر</div>
            <div className="text-lg font-medium">{current.rain.toFixed(1)} mm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherComponent;