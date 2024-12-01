import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { selectStreamType } from '../reducers/activities';
import styles from './Tile.module.css';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH, getSummaryPolyline, getWeatherStyles } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';
import { selectHeartZones } from '../reducers/heartzones';
import DetailDataFetcher from '../Detail/DetailDataFetcher';
import PRMedal from '../Common/Icons/PRMedal';

const Tile = ({ activity, backgroundIndicator }) => {
  const [hovered, setHovered] = React.useState(false);
  const heartRateStream = useSelector((state) => selectStreamType(state, activity.id, 'heartrate'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date))
  const bestEfforts = activity?.bestEfforts || [];

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const duration = <DurationDisplay numSeconds={activity.elapsed_time} units={['s ', 'm ', 'h ']} />;
  
  const { backgroundColor } = (backgroundIndicator === 'weather' && getWeatherStyles(activity.weather || {})) || {};
  
  return (
    <div className="dls-white-bg border-radius-1 border-2">
      {hovered && <DetailDataFetcher id={activity.id} />}
      <div className={`${backgroundColor} ${styles.container} gap`}>
        <GoogleMapImage
          activityId={activity.id}
          polyline={getSummaryPolyline(activity)}
          alt="summary route"
          imgWidth={400}
          imgHeight={200}
          width="100"
          height="75"
        />
        <div className="flex flex-justify-between flex-column flex-item-grow">
          <div className="flex flex-justify-between">
            <div>
              <div>
                {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
              </div>
              <Link onMouseEnter={onMouseEnter} onFocus={onMouseEnter} className="heading-4" to={`/${activity.id}/detail`}>{activity.name}</Link>
            </div>
            <div className="flex-item-grow text-right">
              <div>
                {duration}
                <span className="margin-l heading-4 dls-dark-gold">
                  {convertMetersToMiles(activity.distance).toFixed(2)} <abbr>mi</abbr>
                </span>
              </div>
              <div>
                <small>Average Speed</small>
                <span className="margin-l heading-4">
                  {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
                </span>
              </div>
              <div>
                <small>Average HR</small>
                <span className="margin-l heading-4">
                  {Math.round(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
                </span>
              </div>
            </div>
          </div>
          <div className="full-width">
            {(heartRateStream || activity.zonesCaches[zones.id]) && (
              <ZonesWidth
                id={activity.id}
                zonesCaches={activity.zonesCaches}
                zones={zones}
                heartData={heartRateStream?.data}
              />
            )}
          </div>
          {bestEfforts.length > 0 && (
            <div className="flex gap flex-wrap margin-t">
              {bestEfforts.map((effort) => (
                <div key={effort.effort_id} className="valign-middle">
                  <span><PRMedal color={effort.pr_rank} type="native" /></span>
                  <small>
                    {effort.name} &rarr; <DurationDisplay numSeconds={effort.elapsed_time} />
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default Tile;
