import {
  type FC,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import { WeatherCondition, wmoToCondition } from '@/Detail/WeatherReporter/utils';
import { useAppSelector } from '@/hooks/redux';
import { selectActivity } from '@/reducers/activities';
import { setWeatherDataAct } from '@/reducers/activities-actions';
import dayjs from 'dayjs';

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
  const dispatch = useDispatch();

  useEffect(() => {
    if (!activity?.start_latlng?.x || !activity?.start_latlng?.y) {
      return;
    }
    if (activity.hourly_weather?.length) return;
    fetch(`http://localhost:3001/activities/${id}/weather`)
      .then((response) => response.json())
      .then((data) => {
        const hourlyWeather = Array.isArray(data) ? data : [];
        if (!hourlyWeather.length) {
          return;
        }

        const sortedWeather = [...hourlyWeather].sort(
          (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf()
        );

        const findClosest = (targetTime, records) => records.reduce((closest, current) => {
          if (!closest) {
            return current;
          }

          const closestDiff = Math.abs(dayjs(closest.time).valueOf() - targetTime.valueOf());
          const currentDiff = Math.abs(dayjs(current.time).valueOf() - targetTime.valueOf());
          return currentDiff < closestDiff ? current : closest;
        }, null);

        const startTime = dayjs(activity.start_date_local).utc();
        const endTime = dayjs(activity.start_date_local).add(activity.elapsed_time, 'second').utc();

        const startRecord = findClosest(startTime, sortedWeather);
        const endRecord = findClosest(endTime, sortedWeather);

        if (!startRecord || !endRecord) {
          return;
        }

        dispatch(setWeatherDataAct([startRecord, endRecord]));

        setSkyStart(wmoToCondition(startRecord.weather_code));
        setTempStart(Math.round(startRecord.temperature_2m * 9 / 5 + 32));
        setHumidityStart(startRecord.relative_humidity_2m);
        setWindStart(startRecord.wind_speed_10m);
        setPrecipStart(startRecord.precipitation);

        setSkyEnd(wmoToCondition(endRecord.weather_code));
        setTempEnd(Math.round(endRecord.temperature_2m * 9 / 5 + 32));
        setHumidityEnd(endRecord.relative_humidity_2m);
        setWindEnd(endRecord.wind_speed_10m);
        setPrecipEnd(endRecord.precipitation);
      });
  }, [activity?.id, id, dispatch]);

  return (
    <div className="p-4">
      <div className="flex justify-center gap-8">
        <div>
          <div className="text-h4">
            Start Conditions:
          </div>
          <div>{skyStart}</div>
          <div>{tempStart} &deg;F</div>
          <div><small>Relative Humidity:</small> {humidityStart}%</div>
          <div><small>Wind:</small> {windStart} mph</div>
          <div><small>Precipitation:</small> {precipStart} mm</div>
        </div>
        <div>
          <div className="text-h4">
            End Conditions:
          </div>
          <div>{skyEnd}</div>
          <div>{tempEnd} &deg;F</div>
          <div><small>Relative Humidity:</small> {humidityEnd}%</div>
          <div><small>Wind:</small> {windEnd} mph</div>
          <div><small>Precipitation:</small> {precipEnd} mm</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherReporter;
