import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchWeatherData, searchCity } from './services/weatherService';
import { fetchWeatherApiComData } from './services/weatherApiComService';
import { WeatherData, Coordinates, GeocodingResult } from './types';
import { getWeatherDescription, convertWeatherApiCode, getWeatherIcon } from './constants'; // <-- تأكد من وجود getWeatherIcon هنا

interface CombinedWeatherData {
  openMeteo: WeatherData | null;
  weatherApiCom: any | null;
}

function App() {
  const [weather, setWeather] = useState<CombinedWeatherData>({
    openMeteo: null,
    weatherApiCom: null
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [showOpenMeteoForecast, setShowOpenMeteoForecast] = useState<boolean>(false);
  const [showWeatherApiComForecast, setShowWeatherApiComForecast] = useState<boolean>(false);

  // عداد محلي
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem('visitorCount');
      const count = storedCount ? parseInt(storedCount, 10) + 1 : 1;
      localStorage.setItem('visitorCount', count.toString());
      setVisitorCount(count);
    } catch (error) {
      console.error('فشل العداد المحلي:', error);
    }
  }, []);

  const calculateFeelsLike = (temp: number, wind: number, humidity: number): number => {
    const v = wind;
    const vPow = Math.pow(v, 0.16);
    return 13.12 + (0.6215 * temp) - (11.37 * vPow) + (0.3965 * temp * vPow);
  };

  const loadWeatherData = useCallback(async (coords: Coordinates) => {
    setLoading(true);
    setError(null);
    try {
      const [openMeteoData, weatherApiComData] = await Promise.all([
        fetchWeatherData(coords),
        fetchWeatherApiComData(coords)
      ]);

      // تحويل رموز WeatherAPI.com
      if (weatherApiComData) {
        weatherApiComData.current.weathercode = convertWeatherApiCode(weatherApiComData.current.weathercode);
        weatherApiComData.daily = weatherApiComData.daily.map((day: any) => ({
          ...day,
          weathercode: convertWeatherApiCode(day.weathercode),
        }));
      }

      setWeather({
        openMeteo: openMeteoData,
        weatherApiCom: weatherApiComData
      });

      if (openMeteoData) {
        setLocationName(coords.name || openMeteoData.locationName);
      } else if (weatherApiComData) {
        setLocationName(coords.name || 'الموقع الحالي');
      }
    } catch (err) {
      setError('فشل جلب بيانات الطقس من أحد المصادر.');
      console.error(err);
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
        await loadWeatherData(coords);
      },
      () => {
        setError('تعذر الحصول على موقعك. يرجى البحث عن مدينة.');
        setLoading(false);
      }
    );
  }, [loadWeatherData]);

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
        await loadWeatherData(coords);
      } else {
        setError('المدينة غير موجودة.');
        setLoading(false);
      }
    } catch {
      setError('فشل البحث عن المدينة.');
      setLoading(false);
    }
  }, [loadWeatherData]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return (
    <div className="min-h-screen pb-8 bg-gradient-to-br from-sky-50 to-blue-100 flex flex-col">
      <header className="text-center py-3 bg-black/30 backdrop-blur-sm text-white text-sm font-bold tracking-wider">
        MOHAMMED JAFER ALSHOUHA
      </header>

      <main className="flex-1">
        <SearchBar onSearch={handleSearch} onUseLocation={getUserLocation} isLoading={loading} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mx-4 mt-4">
            {error}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && (
          <>
            {/* Open-Meteo */}
            {weather.openMeteo && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 mx-4 mb-2">☀️ Open-Meteo</h2>
                <CurrentWeather
                  current={weather.openMeteo.current}
                  modelTemps={weather.openMeteo.modelTemps}
                  locationName={locationName}
                />

                <div className="mx-4 mt-4 mb-2">
                  <button
                    onClick={() => setShowOpenMeteoForecast(!showOpenMeteoForecast)}
                    className="w-full flex items-center justify-center gap-2 text-gray-800 hover:text-gray-900 bg-white/40 backdrop-blur-sm rounded-xl py-3 text-lg font-bold shadow-md hover:shadow-lg transition"
                  >
                    <span className="text-2xl">{showOpenMeteoForecast ? '▼' : '▶'}</span>
                    <span>توقعات Open-Meteo</span>
                  </button>
                </div>

                {showOpenMeteoForecast && (
                  <div className="mx-4 p-2 bg-white/20 rounded-2xl shadow-lg">
                    <Forecast daily={weather.openMeteo.daily} showModels={true} />
                  </div>
                )}
              </div>
            )}

            {/* WeatherAPI.com */}
            {weather.weatherApiCom && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mx-4 mb-2">🌍 WeatherAPI.com</h2>

                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl mx-4">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-7xl">{getWeatherIcon(weather.weatherApiCom.current.weathercode)}</span>
                    <div>
                      <div className="text-5xl font-light">{weather.weatherApiCom.current.temperature_2m.toFixed(1)}°C</div>
                      <div className="text-gray-700">{weather.weatherApiCom.current.condition || getWeatherDescription(weather.weatherApiCom.current.weathercode)}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <span>🌡️</span> محسوسة: {weather.weatherApiCom.current.feelslike.toFixed(1)}°C
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-2xl">☔</span>
                      <div>
                        <div className="text-xs text-gray-500">مطر</div>
                        <div className="text-lg font-medium">{weather.weatherApiCom.current.precipitation.toFixed(1)} mm</div>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-2xl">💧</span>
                      <div>
                        <div className="text-xs text-gray-500">رطوبة</div>
                        <div className="text-lg font-medium">{weather.weatherApiCom.current.relativehumidity_2m.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-2xl">💨</span>
                      <div>
                        <div className="text-xs text-gray-500">رياح</div>
                        <div className="text-lg font-medium">{weather.weatherApiCom.current.windspeed_10m.toFixed(1)} km/h</div>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-2xl">🌡️</span>
                      <div>
                        <div className="text-xs text-gray-500">محسوسة</div>
                        <div className="text-lg font-medium">{weather.weatherApiCom.current.feelslike.toFixed(1)}°C</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mx-4 mt-4 mb-2">
                  <button
                    onClick={() => setShowWeatherApiComForecast(!showWeatherApiComForecast)}
                    className="w-full flex items-center justify-center gap-2 text-gray-800 hover:text-gray-900 bg-white/40 backdrop-blur-sm rounded-xl py-3 text-lg font-bold shadow-md hover:shadow-lg transition"
                  >
                    <span className="text-2xl">{showWeatherApiComForecast ? '▼' : '▶'}</span>
                    <span>توقعات WeatherAPI.com (3 أيام)</span>
                  </button>
                </div>

                {showWeatherApiComForecast && weather.weatherApiCom.daily && weather.weatherApiCom.daily.length > 0 && (
                  <div className="mx-4 p-2 bg-white/20 rounded-2xl shadow-lg">
                    <Forecast daily={weather.weatherApiCom.daily} showModels={false} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="text-center py-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold tracking-wider mt-6">
        <div>BY MOHAMMED JAFER ALSHOUHA © {new Date().getFullYear()}</div>
        <div className="mt-2 text-white/80 flex items-center justify-center gap-2">
          <span>👥</span>
          <span>مرات مشاهدة الصفحة: {visitorCount}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;