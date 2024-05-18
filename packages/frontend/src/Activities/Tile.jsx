import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { makeSelectStreamType } from '../reducers/activities';
import styles from './Tile.module.css';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';
import { convertMetersToMiles, convertMetricSpeedToMPH, getSummaryPolyline } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';
import { makeSelectZones } from '../reducers/heartszones';

const Tile = ({ activity }) => {
  const streamSelector = useCallback(makeSelectStreamType(activity.id, 'heartrate'), [activity.id]);
  const heartRateStream = useSelector(streamSelector);
  const zones = useSelector(makeSelectZones(activity.start_date))

  return (
    <div>
      <div className={styles.container}>
        <GoogleMapImage
          polyline={getSummaryPolyline(activity)}
          alt="summary route"
          className={styles.summaryImg}
          width="100"
          height="75"
        />
        <div className="flex flex-justify-between flex-column fullwidth">
          <div className="flex flex-justify-between">
            <div>
              <div>
                {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
              </div>
              <div>
                <h2 className={styles.title}>
                  <Link to={`/${activity.id}/detail`}>{activity.name}</Link>
                </h2>
              </div>
            </div>
            <div>
              <div>
                {convertMetersToMiles(activity.distance).toFixed(2)} miles in <DurationDisplay numSeconds={activity.elapsed_time}/></div>
              <div>
                Avg Speed - {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
              </div>
              <div>
                Avg HR - {(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
              </div>
            </div>
          </div>
          <div style={{ width: '100%' }}>
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
