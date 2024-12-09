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

interface Activitiy {
  id: number;
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
  
}

interface ActivityDetails {
  
}