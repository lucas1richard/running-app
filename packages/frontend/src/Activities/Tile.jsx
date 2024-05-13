import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GOOGLE_API_KEY } from '../constants';
import dayjs from 'dayjs';
import { makeSelectStreamType } from '../reducers/activities';
import styles from './Tile.module.css';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';

const Tile = ({ activity, zones }) => {
  const streamSelector = useCallback(makeSelectStreamType(activity.id, 'heartrate'), [activity.id]);
  const heartRateStream = useSelector(streamSelector);
  
  return (
    <div>
      <div className={styles.container}>
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&path=enc:${activity.map.summary_polyline}&key=${GOOGLE_API_KEY}`}
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
            {(activity.distance / 1609).toFixed(2)} miles in <DurationDisplay numSeconds={activity.elapsed_time}/></div>
          <div>
            Avg Speed - {(activity.average_speed * 2.237).toFixed(2)} mph
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
