export type SimpleStreamTypes =
  | 'heartrate'
  | 'time'
  | 'distance'
  | 'altitude'
  | 'velocity_smooth'
  | 'latlng'
  | 'grade_smooth'
  | 'watts'
  | 'cadence';

export type LatLng = [lat: number, lon: number];

export interface StreamBase {
  type: SimpleStreamTypes;
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface Stream extends StreamBase {
  data: number[];
}

export interface LatLngStream extends StreamBase {
  type: 'latlng';
  data: LatLng[];
}

export type StravaStreamSet = (Stream | LatLngStream)[];
