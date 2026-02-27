import React, { useState } from 'react';
import { DailyForecast } from '../types';
import { getWeatherIcon, getWeatherDescription } from '../constants';
import HourlyForecastModal from './HourlyForecastModal';

interface Props {
  daily: DailyForecast[];
}

const Forecast: React.FC<Props> = ({ daily }) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (day: DailyForecast) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  // دالة مساعدة لعرض كمية المطر بشكل مصغر
  const renderPrecipitation = (value: number | null) => {
    if (value === null || value === undefined) return '—';
    return value.toFixed(1);
  };

  return (
    <>
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
              <div 
                key={idx} 
                className="bg-white/70 rounded-xl p-3 text-center shadow-sm hover:shadow-md transition cursor-pointer hover:scale-105 transform duration-200"
                onClick={() => handleDayClick(day)}
              >
                <div className="font-medium text-gray-700">{weekday}</div>
                <div className="text-xs text-gray-500 mb-2">{dayMonth}</div>
                <div className="text-3xl mb-1">{icon}</div>
                <div className="text-xs text-gray-600 mb-2 truncate" title={desc}>{desc}</div>
                
                {/* درجات الحرارة (متوسط النماذج) */}
                <div className="flex justify-center gap-2 text-sm mb-2">
                  <span className="font-semibold">{day.temperature_2m_max.toFixed(0)}°</span>
                  <span className="text-gray-500">{day.temperature_2m_min.toFixed(0)}°</span>
                </div>
                
                {/* كميات الأمطار من كل نموذج - بشكل مصغر */}
                <div className="grid grid-cols-3 gap-1 text-[10px] border-t border-gray-200 pt-2 mt-1">
                  <div className="text-center">
                    <span className="block font-semibold text-blue-800">EC</span>
                    <span className="text-gray-700">{renderPrecipitation(day.modelPrecipitation.ecmwf)}</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-green-800">GFS</span>
                    <span className="text-gray-700">{renderPrecipitation(day.modelPrecipitation.gfs)}</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-semibold text-purple-800">ICON</span>
                    <span className="text-gray-700">{renderPrecipitation(day.modelPrecipitation.icon)}</span>
                  </div>
                </div>
                <div className="text-[8px] text-gray-400 mt-1">mm</div>
              </div>
            );
          })}
        </div>
      </div>

      <HourlyForecastModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        day={selectedDay} 
      />
    </>
  );
};

export default Forecast;