declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

type BestEffort = {};
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
}

interface PR {
  id: number;
  name: string;
  distance: number;
  start_date_local: string;
  elapsed_time: number;
  pr_rank: number;
  activityId: number;
}