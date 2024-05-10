import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { GOOGLE_API_KEY } from '../constants';
import dayjs from 'dayjs';
import { makeSelectActivitySummary } from '../reducers/activities';
import styles from './Tile.module.css';

const Tile = ({ activity }) => {
  const summary = useSelector(makeSelectActivitySummary(activity.id));
  
  return (
    <div className={styles.container}>
      <img
        src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&path=enc:${activity.map.summary_polyline}&key=${GOOGLE_API_KEY}`}
        alt="summary route"
        className={styles.summaryImg}
      />
      <div>
        <div>
          {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
        </div>
        <div>
          <Link to={`/${activity.id}/detail`}><h2>{activity.name}</h2></Link>
        </div>
        <div>
          {activity.sport_type} - {(activity.distance / 1609).toFixed(2)} miles
        </div>
        <div>
          {summary.has_streams ? 'View More Detail' : ''}
        </div>
      </div>
    </div>
  )
};

export default Tile;
