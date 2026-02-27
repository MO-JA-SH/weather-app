import React from 'react';
import { DailyForecast } from '../types';
import { getWeatherIcon, getWeatherDescription } from '../constants';

interface Props {
  daily: DailyForecast[];
}

const Forecast: React.FC<Props> = ({ daily }) => {
  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-6 shadow-xl mx-4 mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">توقعات 16 يوم</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {daily.map((day, idx) => {
          const date = new Date(day.date);
          const weekday = date.toLocaleDateString('ar', { weekday: 'short' });
          const dayMonth = date.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
          const icon = getWeatherIcon(day.weathercode);
          const desc = getWeatherDescription(day.weathercode);
          return (
            <div key={idx} className="bg-white/70 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition">
              <div className="font-medium text-gray-700">{weekday}</div>
              <div className="text-xs text-gray-500 mb-2">{dayMonth}</div>
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-xs text-gray-600 mb-2 truncate" title={desc}>{desc}</div>
              <div className="flex justify-center gap-2 text-sm">
                <span className="font-semibold">{day.temperature_2m_max.toFixed(0)}°</span>
                <span className="text-gray-500">{day.temperature_2m_min.toFixed(0)}°</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">{day.precipitation_sum.toFixed(1)} mm</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;