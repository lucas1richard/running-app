declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface Activitiy {
  id: number;
  start_date: string;
  start_date_local: string;
  distance: number;
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