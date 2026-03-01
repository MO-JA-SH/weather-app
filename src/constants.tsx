export const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'سماء صافية', icon: '☀️' },
  1: { description: 'صافي غالباً', icon: '🌤️' },
  2: { description: 'غائم جزئياً', icon: '⛅' },
  3: { description: 'غائم كلياً', icon: '☁️' },
  45: { description: 'ضباب', icon: '🌫️' },
  48: { description: 'ضباب متجمد', icon: '🌫️❄️' },
  51: { description: 'رذاذ خفيف', icon: '🌧️' },
  53: { description: 'رذاذ متوسط', icon: '🌧️' },
  55: { description: 'رذاذ كثيف', icon: '🌧️' },
  56: { description: 'رذاذ متجمد خفيف', icon: '🌧️❄️' },
  57: { description: 'رذاذ متجمد كثيف', icon: '🌧️❄️' },
  61: { description: 'مطر خفيف', icon: '🌦️' },
  63: { description: 'مطر متوسط', icon: '🌧️' },
  65: { description: 'مطر غزير', icon: '🌧️💧' },
  66: { description: 'مطر متجمد', icon: '🌨️' },
  67: { description: 'مطر متجمد غزير', icon: '🌨️❄️' },
  71: { description: 'ثلج خفيف', icon: '🌨️' },
  73: { description: 'ثلج متوسط', icon: '❄️' },
  75: { description: 'ثلج غزير', icon: '❄️❄️' },
  77: { description: 'حبيبات ثلج', icon: '❄️' },
  80: { description: 'زخات مطر خفيفة', icon: '🌦️' },
  81: { description: 'زخات مطر متوسطة', icon: '🌧️' },
  82: { description: 'زخات مطر قوية', icon: '🌧️💧' },
  85: { description: 'زخات ثلج خفيفة', icon: '🌨️' },
  86: { description: 'زخات ثلج كثيفة', icon: '❄️' },
  95: { description: 'عاصفة رعدية', icon: '⛈️' },
  96: { description: 'عاصفة رعدية مع برد خفيف', icon: '⛈️🌨️' },
  99: { description: 'عاصفة رعدية مع برد كثيف', icon: '⛈️❄️' },
};

// دالة لتحويل رموز WeatherAPI.com إلى رموز WMO
export function convertWeatherApiCode(code: number): number {
  const mapping: Record<number, number> = {
    1000: 0,  // Sunny/Clear
    1003: 2,  // Partly cloudy
    1006: 3,  // Cloudy
    1009: 3,  // Overcast
    1030: 45, // Mist
    1063: 61, // Patchy rain possible
    1066: 71, // Patchy snow possible
    1069: 66, // Patchy sleet possible
    1072: 66, // Patchy freezing drizzle possible
    1087: 95, // Thundery outbreaks possible
    1114: 75, // Blowing snow
    1117: 86, // Blizzard
    1135: 45, // Fog
    1147: 45, // Freezing fog
    1150: 51, // Patchy light drizzle
    1153: 53, // Light drizzle
    1168: 66, // Freezing drizzle
    1171: 67, // Heavy freezing drizzle
    1180: 61, // Patchy light rain
    1183: 63, // Light rain
    1186: 63, // Moderate rain at times
    1189: 63, // Moderate rain
    1192: 65, // Heavy rain at times
    1195: 65, // Heavy rain
    1201: 67, // Moderate or heavy freezing rain
    1204: 66, // Light sleet
    1207: 67, // Moderate or heavy sleet
    1210: 71, // Patchy light snow
    1213: 73, // Light snow
    1216: 73, // Patchy moderate snow
    1219: 73, // Moderate snow
    1222: 75, // Patchy heavy snow
    1225: 75, // Heavy snow
    1237: 77, // Ice pellets
    1240: 80, // Light rain shower
    1243: 81, // Moderate or heavy rain shower
    1246: 82, // Torrential rain shower
    1249: 85, // Light sleet showers
    1252: 86, // Moderate or heavy sleet showers
    1255: 85, // Light snow showers
    1258: 86, // Moderate or heavy snow showers
    1261: 77, // Light showers of ice pellets
    1264: 77, // Moderate or heavy showers of ice pellets
    1273: 95, // Patchy light rain with thunder
    1276: 95, // Moderate or heavy rain with thunder
    1279: 96, // Patchy light snow with thunder
    1282: 99, // Moderate or heavy snow with thunder
  };
  return mapping[code] || 0;
}

export const getWeatherIcon = (code: number): string => {
  return weatherCodeMap[code]?.icon || '❓';
};

export const getWeatherDescription = (code: number): string => {
  return weatherCodeMap[code]?.description || 'غير معروف';
};