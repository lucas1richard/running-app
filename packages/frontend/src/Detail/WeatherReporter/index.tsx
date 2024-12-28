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
import { Basic, Button, Flex } from '../../DLS';

type Props = {
  id: number;
};

type SelectChangeHandler = ChangeEventHandler<HTMLSelectElement>;
type InputChangeHandler = ChangeEventHandler<HTMLInputElement>;

const WeatherReporter: FC<Props> = ({ id }) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const [sky, setSky] = useState(activity?.weather?.sky);
  const [temperature, setTemperature] = useState(activity?.weather?.temperature);
  const [humidity, setHumidity] = useState(activity?.weather?.humidity);
  const [wind, setWind] = useState(activity?.weather?.wind);
  const [precipitation, setPrecipitation] = useState(activity?.weather?.precipitation);
  const weatherDataStatus = useGetApiStatus(`weather/FETCH_WEATHER-${id}`);

  useEffect(() => {
    setSky(activity?.weather?.sky);
    setTemperature(activity?.weather?.temperature);
    setHumidity(activity?.weather?.humidity);
    setWind(activity?.weather?.wind);
    setPrecipitation(activity?.weather?.precipitation);
  }, [activity]);

  const dispatch = useDispatch();

  const handlePrecipChange = useCallback<SelectChangeHandler>((event) => {
    setPrecipitation(Number(event.target.value));
  }, []);

  const handleSkyChange = useCallback<SelectChangeHandler>((event) => {
    setSky(event.target.value);
  }, []);

  const handleTemperatureChange = useCallback<InputChangeHandler>((event) => {
    setTemperature(Number(event.target.value));
  }, []);

  const handleHumidityChange = useCallback<InputChangeHandler>((event) => {
    setHumidity(Number(event.target.value));
  }, []);

  const handleWindChange = useCallback<SelectChangeHandler>((event) => {
    setWind(event.target.value);
  }, []);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((event) => {
    event.preventDefault();
    dispatch(triggerFetchWeather(id, { sky, temperature, humidity, wind, precipitation }));
  }, [dispatch, id, sky, temperature, humidity, wind, precipitation]);

  return (
    <Basic.Div pad={1} marginT={1} border="1px solid #ddd">
      <Shimmer
        isVisible={weatherDataStatus === 'loading'}
      />
      <div>
        <form onSubmit={handleSubmit}>
          <Flex wrap="wrap" gap={1}>
            <Flex gap={1} alignItems="center">
              <Basic.Select
                id="sky"
                name="sky"
                value={sky}
                onChange={handleSkyChange}
                className="flex-item-grow"
              >
                <option value={undefined}>Weather</option>
                <option value="sunny">Sunny</option>
                <option value="partly cloudy">Partly Cloudy</option>
                <option value="mostly cloudy">Mostly Cloudy</option>
                <option value="overcast">Overcast</option>
              </Basic.Select>
            </Flex>

            <Flex gap={1} alignItems="center">
              <Basic.Select
                id="rain"
                name="rain"
                value={precipitation}
                onChange={handlePrecipChange}
              >
                <option value={undefined}>Rain Condition</option>
                <option value="none">No Rain</option>
                <option value="light">Light Rain</option>
                <option value="moderate">Moderate Rain</option>
                <option value="heavy">Heavy Rain</option>
                <option value="torrential">Torrential Rain</option>
              </Basic.Select>
            </Flex>
          </Flex>

          <Flex gap={1} wrap="wrap">
            <Flex gap={1} alignItems="center">
              <Basic.Input
                type="number"
                id="temperature" 
                name="temperature" 
                value={temperature} 
                onChange={handleTemperatureChange}
                textAlign="right"
                padR="30px"
                min={-100}
                max={150}
                placeholder="Temp"
              />
              <Basic.Span marginL="-40px">&deg;F</Basic.Span>
            </Flex>

            <Flex gap={1} alignItems="center">
              <Basic.Input 
                type="number" 
                id="humidity" 
                name="humidity" 
                value={humidity} 
                onChange={handleHumidityChange}
                padR="30px"
                min={0}
                max={100}
                textAlign="right"
                placeholder="Humidity"
              />
              <Basic.Span marginL="-40px">%</Basic.Span>
            </Flex>
          </Flex>

          <Flex gap={1} alignItems="center">
            <Basic.Select
              id="wind"
              name="wind"
              value={wind}
              onChange={handleWindChange}
              className="full-width"
            >
              <option value={undefined}>Select a wind condition</option>
              <option value="calm">Calm</option>
              <option value="moderate">Moderate Breeze</option>
              <option value="strong">Strong Breeze</option>
              <option value="gale">Gale</option>
            </Basic.Select>
          </Flex>

          <Button type="submit" className="full-width">Submit</Button>
        </form>
      </div>
    </Basic.Div>
  );
}

export default WeatherReporter;
