declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.svg' {
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

type TODO = any;

type BestEffort = {
  pr_rank: null | number;
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

type StreamPin = {
  id: number;
  /** not necessarily a strava stream type, it can be anything */
  stream_key: string;
  index: number;
  label: string;
  description: string;
  activityId: number;
};

type HeatMapData = {
  lat: string;
  lon: string;
  total_seconds: number;
  sportType: string;
};

interface Activity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  description?: string;
  distance: number;
  distance_miles: number;
  calculatedBestEfforts: BestEffort[];
  weather: Weather;
  zonesCaches: Record<string, HeartZoneCache>;
  elapsed_time: number;
  average_seconds_per_mile: number;
  average_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  summary_polyline?: string;
  stream_pins?: StreamPin[];
  hidden: boolean;
  map: {
    summary_polyline: string;
  };
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

type SimpleStreamTypes = 
  | 'heartrate'
  | 'time'
  | 'distance'
  | 'altitude'
  | 'velocity_smooth'
  | 'latlng'
  | 'grade_smooth';

type LatLng = [lat: number, lon: number];

interface Stream {
  type: SimpleStreamTypes;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

interface LatLngStream extends Stream {
  data: LatLng[];
 }