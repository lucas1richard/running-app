import {
  type FC,
  type ChangeEventHandler,
  type FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import { selectActivity } from '../../reducers/activities';
import { useGetApiStatus } from '../../reducers/apiStatus';
import { triggerFetchWeather } from '../../reducers/activities-actions';
import { useAppSelector } from '../../hooks/redux';
import Shimmer from '../../Loading/Shimmer';
import dayjs from 'dayjs';
import { WeatherCondition, wmoToCondition } from './utils';

type Props = {
  id: number;
};

const WeatherReporter: FC<Props> = ({ id }) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const [startWeather, endWeather] = activity?.hourly_weather || [];
  const [skyStart, setSkyStart] = useState<WeatherCondition>(wmoToCondition(startWeather?.weather_code));
  const [skyEnd, setSkyEnd] = useState<WeatherCondition>(wmoToCondition(endWeather?.weather_code));
  const [tempStart, setTempStart] = useState(startWeather?.temperature_2m);
  const [tempEnd, setTempEnd] = useState(endWeather?.temperature_2m);
  const [humidityStart, setHumidityStart] = useState(startWeather?.relative_humidity_2m);
  const [humidityEnd, setHumidityEnd] = useState(endWeather?.relative_humidity_2m);
  const [windStart, setWindStart] = useState(startWeather?.wind_speed_10m);
  const [windEnd, setWindEnd] = useState(endWeather?.wind_speed_10m);
  const [precipStart, setPrecipStart] = useState(startWeather?.precipitation);
  const [precipEnd, setPrecipEnd] = useState(endWeather?.precipitation);
  const weatherDataStatus = useGetApiStatus(`weather/FETCH_WEATHER-${id}`);
  
  const dispatch = useDispatch();

  useEffect(() => {
    if (!activity?.start_latlng?.x || !activity?.start_latlng?.y) {
      return;
    }
    if (activity.hourly_weather?.length) return;
    const weatherArchive = ({ lat, lon, date }) => `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=sunset,sunrise&hourly=temperature_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation,wind_gusts_10m,precipitation_probability,relative_humidity_2m,dew_point_2m,cloud_cover&timezone=America%2FNew_York`
    fetch(weatherArchive({
      lat: activity.start_latlng.x,
      lon: activity.start_latlng.y,
      date: dayjs(activity.start_date_local).format('YYYY-MM-DD'),
    }))
      .then((response) => response.json())
      .then((data) => {
        console.log('weather data', data);
        
        const hourIndex = dayjs(activity.start_date_local).utc().hour();
        const endHourIndex = dayjs(activity.start_date_local).add(activity.elapsed_time, 'second').utc().hour();
        const weatherCode = data.hourly.weather_code[hourIndex];
        let skyCondition: WeatherCondition = 'Unknown';

        // get WMO code and map to sky condition
        skyCondition = wmoToCondition(weatherCode);

        setSkyStart(skyCondition);
        setTempStart(Math.round(data.hourly.temperature_2m[hourIndex] * 9/5 + 32)); // convert C to F
        setHumidityStart(data.hourly.relative_humidity_2m[hourIndex]);
        setWindStart(data.hourly.wind_speed_10m[hourIndex]);
        setPrecipStart(data.hourly.precipitation[hourIndex]);
        setSkyEnd(wmoToCondition(data.hourly.weather_code[endHourIndex]));
        setTempEnd(Math.round(data.hourly.temperature_2m[endHourIndex] * 9/5 + 32)); // convert C to F
        setHumidityEnd(data.hourly.relative_humidity_2m[endHourIndex]);
        setWindEnd(data.hourly.wind_speed_10m[endHourIndex]);
        setPrecipEnd(data.hourly.precipitation[endHourIndex]);

        dispatch(triggerFetchWeather(id,
        {
          apparent_temperature: data.hourly.apparent_temperature[hourIndex],
          cloud_cover: data.hourly.cloud_cover[hourIndex],
          dew_point_2m: data.hourly.dew_point_2m[hourIndex],
          precipitation: data.hourly.precipitation[hourIndex],
          precipitation_probability: data.hourly.precipitation_probability[hourIndex],
          relative_humidity_2m: data.hourly.relative_humidity_2m[hourIndex],
          temperature_2m: data.hourly.temperature_2m[hourIndex],
          time: data.hourly.time[hourIndex],
          weather_code: data.hourly.weather_code[hourIndex],
          wind_gusts_10m: data.hourly.wind_gusts_10m[hourIndex],
          wind_speed_10m: data.hourly.wind_speed_10m[hourIndex],
        }));

        dispatch(triggerFetchWeather(id,
        {
          apparent_temperature: data.hourly.apparent_temperature[endHourIndex],
          cloud_cover: data.hourly.cloud_cover[endHourIndex],
          dew_point_2m: data.hourly.dew_point_2m[endHourIndex],
          precipitation: data.hourly.precipitation[endHourIndex],
          precipitation_probability: data.hourly.precipitation_probability[endHourIndex],
          relative_humidity_2m: data.hourly.relative_humidity_2m[endHourIndex],
          temperature_2m: data.hourly.temperature_2m[endHourIndex],
          time: data.hourly.time[endHourIndex],
          weather_code: data.hourly.weather_code[endHourIndex],
          wind_gusts_10m: data.hourly.wind_gusts_10m[endHourIndex],
          wind_speed_10m: data.hourly.wind_speed_10m[endHourIndex],
        }));
      });
  }, [activity.id]);

  return (
    <div className="p-4">
      <Shimmer
        isVisible={weatherDataStatus === 'loading'}
      />
      <div className="flex justify-center gap-8">
        <div>
          <div className="text-h4">
            Start Conditions:
          </div>
          <div>{wmoToCondition(activity.hourly_weather?.[0].weather_code)}</div>
          <div>{Math.round(activity.hourly_weather?.[0].temperature_2m * 9/5 + 32)} &deg;F</div>
          <div><small>Relative Humidity:</small> {activity.hourly_weather?.[0].relative_humidity_2m}%</div>
          <div><small>Wind:</small> {activity.hourly_weather?.[0].wind_speed_10m} mph</div>
          <div><small>Precipitation:</small> {activity.hourly_weather?.[0].precipitation} mm</div>
        </div>
        <div>
          <div className="text-h4">
            End Conditions:
          </div>
          <div>{wmoToCondition(activity.hourly_weather?.[1]?.weather_code)}</div>
          <div>{Math.round(activity.hourly_weather?.[1]?.temperature_2m * 9/5 + 32)} &deg;F</div>
          <div><small>Relative Humidity:</small> {activity.hourly_weather?.[1]?.relative_humidity_2m}%</div>
          <div><small>Wind:</small> {activity.hourly_weather?.[1]?.wind_speed_10m} mph</div>
          <div><small>Precipitation:</small> {activity.hourly_weather?.[1]?.precipitation} mm</div>
        </div>
      </div>
    </div>
  );
}

export default WeatherReporter;
