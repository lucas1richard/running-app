import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { selectStreamType } from '../reducers/activities';
import styles from './Tile.module.css';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH, getSummaryPolyline } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';
import { selectHeartZones } from '../reducers/heartszones';
import DetailDataFetcher from '../Detail/DetailDataFetcher';

const Tile = ({ activity }) => {
  const [hovered, setHovered] = React.useState(false);
  const heartRateStream = useSelector((state) => selectStreamType(state, activity.id, 'heartrate'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date))

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  
  return (
    <div>
      {hovered && <DetailDataFetcher id={activity.id} />}
      <div className={`dls-white-bg ${styles.container}`}>
        <GoogleMapImage
          activityId={activity.id}
          polyline={getSummaryPolyline(activity)}
          alt="summary route"
          className={styles.summaryImg}
          imgWidth={400}
          imgHeight={200}
          width="100"
          height="75"
        />
        <div className="flex flex-justify-between flex-column full-width">
          <div className="flex flex-justify-between">
            <div>
              <div>
                {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
              </div>
              <Link onMouseEnter={onMouseEnter} onFocus={onMouseEnter} className="heading-4" to={`/${activity.id}/detail`}>{activity.name}</Link>
            </div>
            <div>
              <div>
                {convertMetersToMiles(activity.distance).toFixed(2)} miles in <DurationDisplay numSeconds={activity.elapsed_time}/>
              </div>
              <div>
                Avg Speed - {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
              </div>
              <div>
                Avg HR - {(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
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
        </div>
      </div>
    </div>
  )
};

export default Tile;
