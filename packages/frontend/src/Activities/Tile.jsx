import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { makeSelectStreamType } from '../reducers/activities';
import styles from './Tile.module.css';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';

const Tile = ({ activity, zones }) => {
  const streamSelector = useCallback(makeSelectStreamType(activity.id, 'heartrate'), [activity.id]);
  const heartRateStream = useSelector(streamSelector);
  
  return (
    <div>
      <div className={styles.container}>
        <GoogleMapImage
          polyline={activity.map.summary_polyline}
          alt="summary route"
          className={styles.summaryImg}
        />
        <div style={{ width: '100%' }}>
          <div>
            {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
          </div>
          <div>
            <Link to={`/${activity.id}/detail`}><h2>{activity.name}</h2></Link>
          </div>
          <div>
            {convertMetersToMiles(activity.distance).toFixed(2)} miles in <DurationDisplay numSeconds={activity.elapsed_time}/></div>
          <div>
            Avg Speed - {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
          </div>
          <div>
            Avg HR - {(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
          </div>
          <div style={{ width: '100%' }}>
            {heartRateStream && <ZonesWidth zones={zones} heartData={heartRateStream.data} />}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Tile;
