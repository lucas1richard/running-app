declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

type BestEffort = {
  pr_rank: number;
  name: string;
  elapsed_time: number;
  effort_id: number;
  activityId: number;
  start_date_local: string;
  distance: number;
};

type Weather = {
  sky: string;
  temperature: number;
  humidity: number;
  wind: string;
  precipitation: number;
};

type ZonesCaches = {};

interface Activity {
  id: number;
  name: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  distance_miles: number;
  bestEfforts: BestEffort[];
  weather: Weather;
  zonesCaches: ZonesCaches[];
  elapsed_time: number;
  average_seconds_per_mile: number;
  average_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  summary_polyline?: string;
  map: {
    summary_polyline: string;
  };
}

interface ActivityDetails {
  
}

type HeartZone = {
  id: number;
  z1: number;
  z2: number;
  z3: number;
  z4: number;
  z5: number;
};

type HeartZoneCache = {
  heartZoneId: number;
  seconds_z1: number;
  seconds_z2: number;
  seconds_z3: number;
  seconds_z4: number;
  seconds_z5: number;
};

interface Stream<T> {
  type: 'heartrate' | 'time' | 'distance' | 'altitude' | 'velocity_smooth' | 'grade_smooth';
  data: T extends 'latlng' ? [number, number][] : number[];
  series_type: string;
  original_size: number;
  resolution: string;
}
