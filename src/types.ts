export interface Coordinates {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  weathercode: number;
  windspeed_10m: number;
  relativehumidity_2m: number;
  precipitation: number;
  rain: number;
}

export interface ModelTemperature {
  ecmwf: number | null;
  gfs: number | null;
  icon: number | null;
}

export interface DailyForecast {
  date: string;
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
  precipitation_sum: number;
}

export interface WeatherData {
  current: CurrentWeather;
  modelTemps: ModelTemperature;
  daily: DailyForecast[];
  timezone: string;
  locationName: string;
}

export interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}