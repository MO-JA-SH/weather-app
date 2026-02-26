import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWeatherData, searchCity } from './services/weatherService';
import { WeatherData, Coordinates, GeocodingResult } from './types';

const getWeatherBackground = (weatherCode: number): string => {
  if (weatherCode === 0) return 'sunny';
  if (weatherCode === 1 || weatherCode === 2) return 'partly-cloudy';
  if (weatherCode === 3) return 'cloudy';
  if (weatherCode >= 45 && weatherCode <= 48) return 'foggy';
  if (weatherCode >= 51 && weatherCode <= 67) return 'rainy';
  if (weatherCode >= 71 && weatherCode <= 77) return 'snowy';
  if (weatherCode >= 80 && weatherCode <= 82) return 'rainy';
  if (weatherCode >= 85 && weatherCode <= 86) return 'snowy';
  if (weatherCode >= 95 && weatherCode <= 99) return 'stormy';
  return 'default';
};

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [backgroundClass, setBackgroundClass] = useState<string>('default');

  const loadWeather = useCallback(async (coords: Coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(coords);
      if (data) {
        setWeather(data);
        setLocationName(coords.name || data.locationName);
      } else {
        setError('فشل جلب بيانات الطقس.');
      }
    } catch {
      setError('حدث خطأ أثناء جلب الطقس.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('المتصفح لا يدعم تحديد الموقع.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'موقعك الحالي',
        };
        await loadWeather(coords);
      },
      () => {
        setError('تعذر الحصول على موقعك. يرجى البحث عن مدينة.');
        setLoading(false);
      }
    );
  }, [loadWeather]);

  const handleSearch = useCallback(async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const result: GeocodingResult | null = await searchCity(city);
      if (result) {
        const coords: Coordinates = {
          lat: result.latitude,
          lon: result.longitude,
          name: `${result.name}, ${result.country}`,
        };
        await loadWeather(coords);
      } else {
        setError('المدينة غير موجودة.');
        setLoading(false);
      }
    } catch {
      setError('فشل البحث عن المدينة.');
      setLoading(false);
    }
  }, [loadWeather]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // تحديث الخلفية عند تغير الطقس
  useEffect(() => {
    if (weather) {
      const bg = getWeatherBackground(weather.current.weathercode);
      setBackgroundClass(bg);
    }
  }, [weather]);

  return (
    <div className={`min-h-screen pb-8 transition-all duration-1000 ${backgroundClass}`}>
      <SearchBar onSearch={handleSearch} onUseLocation={getUserLocation} isLoading={loading} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mx-4 mt-4">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && weather && (
        <>
          <CurrentWeather current={weather.current} modelTemps={weather.modelTemps} locationName={locationName} />
          <Forecast daily={weather.daily} />
        </>
      )}
    </div>
  );
}

export default App;