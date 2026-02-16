const wmoCodeMap = {
  0: 'Clear Sky',
  1: 'Mainly clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow fall',
  73: 'Moderate Snow fall',
  75: 'Heavy Snow fall',
  77: 'Snow grains',
  80: 'Slight Rain showers',
  81: 'Moderate Rain showers',
  82: 'Violent Rain showers',
  85: 'Slight Snow showers',
  86: 'Heavy Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
} as const;

export type WeatherCode = keyof typeof wmoCodeMap;
export type WeatherCondition = typeof wmoCodeMap[keyof typeof wmoCodeMap] | 'Unknown';

export const wmoToCondition = (wmoCode: number): WeatherCondition => wmoCodeMap[wmoCode] || 'Unknown';
