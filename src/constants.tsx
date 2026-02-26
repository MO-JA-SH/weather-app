import React from 'react';

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

export const getWeatherIcon = (code: number): string => {
  return weatherCodeMap[code]?.icon || '❓';
};

export const getWeatherDescription = (code: number): string => {
  return weatherCodeMap[code]?.description || 'غير معروف';
};