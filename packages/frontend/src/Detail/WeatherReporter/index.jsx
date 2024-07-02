import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../Detail.module.css';
import { selectActivity } from '../../reducers/activities';
import { useGetApiStatus } from '../../reducers/apiStatus';
import Shimmer from '../../Loading/Shimmer';
import { triggerFetchWeather } from '../../reducers/activities-actions';

const WeatherReporter = ({ id }) => {
  const activity = useSelector((state) => selectActivity(state, id));
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

  const handlePrecipChange = useCallback((event) => {
    setPrecipitation(event.target.value);
  }, []);

  const handleSkyChange = useCallback((event) => {
    setSky(event.target.value);
  }, []);

  const handleTemperatureChange = useCallback((event) => {
    setTemperature(event.target.value);
  }, []);

  const handleHumidityChange = useCallback((event) => {
    setHumidity(event.target.value);
  }, []);

  const handleWindChange = useCallback((event) => {
    setWind(event.target.value);
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    dispatch(triggerFetchWeather(id, { sky, temperature, humidity, wind, precipitation }));
  }, [dispatch, id, sky, temperature, humidity, wind, precipitation]);

  return (
    <div className="border-radius-1 pad">
      <Shimmer
        isVisible={weatherDataStatus === 'loading'}
      />
      <div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap flex-align-center">
            <select
              id="sky"
              name="sky"
              value={sky}
              onChange={handleSkyChange}
              className={`${styles.quietInput} heading-4`}
            >
              <option value={undefined}>Weather</option>
              <option value="sunny">Sunny</option>
              <option value="partly cloudy">Partly Cloudy</option>
              <option value="mostly cloudy">Mostly Cloudy</option>
              <option value="overcast">Overcast</option>
            </select>
          </div>

          <div className="flex gap flex-align-center">
            <select
              id="rain"
              name="rain"
              value={precipitation}
              onChange={handlePrecipChange}
              className={`${styles.quietInput} heading-4`}
            >
              <option value={undefined}>Rain Condition</option>
              <option value="none">No Rain</option>
              <option value="light">Light Rain</option>
              <option value="moderate">Moderate Rain</option>
              <option value="heavy">Heavy Rain</option>
              <option value="torrential">Torrential Rain</option>
            </select>
          </div>

          <div className="flex gap flex-align-center">
            <input 
              type="number"
              id="temperature" 
              name="temperature" 
              value={temperature} 
              onChange={handleTemperatureChange}
              className={`${styles.quietInput} heading-4 text-right`}
              style={{ paddingRight: 30 }}
              min={-100}
              max={150}
              placeholder="Temp"
            />
            <span style={{ marginLeft: -40 }} className="heading-4">&deg;F</span>
          </div>

          <div className="flex gap flex-align-center">
            <input 
              type="number" 
              id="humidity" 
              name="humidity" 
              value={humidity} 
              onChange={handleHumidityChange}
              style={{ paddingRight: 30 }}
              min={0}
              max={100}
              className={`${styles.quietInput} heading-4 text-right`}
              placeholder="Humidity"
            />
            <span style={{ marginLeft: -40 }} className="heading-4">%</span>
          </div>

          <div className="flex gap flex-align-center">
            <select
              id="wind"
              name="wind"
              value={wind}
              onChange={handleWindChange}
              className={`${styles.quietInput} heading-4`}
            >
              <option value={undefined}>Select a wind condition</option>
              <option value="calm">Calm</option>
              <option value="moderate">Moderate Breeze</option>
              <option value="strong">Strong Breeze</option>
              <option value="gale">Gale</option>
            </select>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default WeatherReporter;
