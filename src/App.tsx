import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWeatherData, searchCity } from './services/weatherService';
import { WeatherData, Coordinates, GeocodingResult } from './types';
import PageViewCount from 'react-page-view-count'; // استيراد مكتبة العداد

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');

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

  return (
    <div className="min-h-screen pb-8 bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col">
      {/* العلامة المائية في الأعلى */}
      <header className="text-center py-3 bg-black/30 backdrop-blur-sm text-white text-sm font-bold tracking-wider">
        MOHAMMED JAFER ALSHOUHA
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1">
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
      </main>

      {/* العلامة المائية في الأسفل مع عداد الزوار */}
      <footer className="text-center py-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold tracking-wider mt-6">
        <div>BY MOHAMMED JAFER ALSHOUHA © {new Date().getFullYear()}</div>
        <div className="mt-2 text-white/80 flex items-center justify-center gap-2">
          <span>👥</span>
          <PageViewCount loadingPlaceholder="..." />
        </div>
      </footer>
    </div>
  );
}

export default App;