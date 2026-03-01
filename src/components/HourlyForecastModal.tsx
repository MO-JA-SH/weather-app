import React from 'react';
import { DailyForecast } from '../types';
import { getWeatherIcon, getWeatherDescription } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  day: DailyForecast | null;
}

const HourlyForecastModal: React.FC<Props> = ({ isOpen, onClose, day }) => {
  if (!isOpen || !day) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-4 rounded-t-3xl flex justify-between items-center">
          <h2 className="text-xl font-bold">
            تفاصيل {new Date(day.date).toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
        </div>
        
        <div className="p-4">
          {day.hourly && day.hourly.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {day.hourly.map((hour, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 shadow-md border border-gray-100">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {new Date(hour.time).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{getWeatherIcon(hour.weathercode)}</span>
                    <span className="text-sm text-gray-600">{getWeatherDescription(hour.weathercode)}</span>
                  </div>
                  <div className="text-lg font-bold text-center mb-2">{hour.temperature_2m.toFixed(1)}°C</div>
                  
                  <div className="grid grid-cols-3 gap-1 text-center text-xs mb-2">
                    <div className="bg-blue-50 p-1 rounded">
                      <div className="font-semibold">ECMWF</div>
                      <div>{hour.modelTemps.ecmwf?.toFixed(1) ?? '—'}°</div>
                    </div>
                    <div className="bg-blue-50 p-1 rounded">
                      <div className="font-semibold">GFS</div>
                      <div>{hour.modelTemps.gfs?.toFixed(1) ?? '—'}°</div>
                    </div>
                    <div className="bg-blue-50 p-1 rounded">
                      <div className="font-semibold">ICON</div>
                      <div>{hour.modelTemps.icon?.toFixed(1) ?? '—'}°</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-1 rounded text-center">
                      <span className="text-gray-500">تساقط</span>
                      <div className="font-medium">{hour.precipitation.toFixed(1)} mm</div>
                    </div>
                    <div className="bg-gray-50 p-1 rounded text-center">
                      <span className="text-gray-500">رطوبة</span>
                      <div className="font-medium">{hour.relativehumidity_2m.toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-50 p-1 rounded text-center">
                      <span className="text-gray-500">رياح</span>
                      <div className="font-medium">{hour.windspeed_10m.toFixed(1)} km/h</div>
                    </div>
                    <div className="bg-gray-50 p-1 rounded text-center">
                      <span className="text-gray-500">مطر</span>
                      <div className="font-medium">{hour.rain.toFixed(1)} mm</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات متاحة لهذا اليوم</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecastModal;