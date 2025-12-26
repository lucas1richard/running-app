import React, { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { selectStreamTypeData } from '../reducers/activities';
import { convertMetricSpeedToMPH, getSummaryPolyline, getWeatherStyles } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';
import DurationDisplay from '../Common/DurationDisplay';
import PRMedal from '../Common/Icons/PRMedal';
import { selectHeartZones } from '../reducers/heartzones';
import DetailDataFetcher from '../Detail/DetailDataFetcher';
import calcEfficiencyFactor from '../utils/calcEfficiencyFactor';
import { emptyArray } from '../constants';
import { useAppSelector } from '../hooks/redux';
import ZonesWidth from './ZonesWidth';
import styles from './Tile.module.css';
import Surface from '../DLS/Surface';
import { ReactComponent as HeartRateSvg } from '../assets/heart-rate.svg';
import { ReactComponent as AveragePaceSvg } from '../assets/avg_pace.svg';

type Props = {
  activity: Activity;
  isCompact?: boolean;
  backgroundIndicator?: string;
  children?: React.ReactNode;
  className?: string;
}

const Tile: React.FC<Props> = ({
  activity,
  backgroundIndicator,
  isCompact,
  children,
  className = '',
}) => {
  const [hovered, setHovered] = React.useState(false);
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, activity.id, 'heartrate'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity.start_date))
  const bestEfforts = activity?.calculatedBestEfforts || emptyArray;

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const duration = useMemo(
    () => <DurationDisplay numSeconds={activity.elapsed_time} units={['s ', 'm ', 'h ']} />,
    [activity.elapsed_time]
  );

  const { backgroundColor } = (backgroundIndicator === 'weather' && getWeatherStyles(activity.weather)) || { backgroundColor: '' };
  const largeText = isCompact ? 'text-h5' : 'text-h4';
  const smallText = isCompact ? 'text-sm' : 'text-md';

  return (
    <Surface className={`p-4 raised-1 card ${backgroundColor} ${className}`}>
      {hovered && <DetailDataFetcher id={activity.id} />}
      <div
        className={isCompact ? styles.gridCompact : styles.grid}
      >
        <div className={styles.gridImage}>
          <GoogleMapImage
            activityId={activity.id}
            polyline={getSummaryPolyline(activity)}
            alt="summary route"
            imgWidth={400}
            imgHeight={200}
            width={100}
            height={75}
          />
        </div>

        <div className={`${styles.gridTitle} text-${isCompact ? 'right' : 'left'}`}>
          <div>
            {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
          </div>

          <Link
            to={`/${activity.id}/detail`}
            className={`${largeText} dls-blue`}
            onMouseEnter={onMouseEnter}
            onFocus={onMouseEnter}
          >
            {activity.name}
          </Link>
        </div>

        <div className={styles.gridStats}>
          <div className={`text-${isCompact ? 'left' : 'right'}`}>
            <div>
              <span className={`${smallText}`}>
                {duration}
                </span>
              <span className={`ml-4 ${largeText} dls-dark-gold`}>
                {activity.distance_miles} <abbr>mi</abbr>
              </span>
            </div>

            <div>
              <span className={`${smallText}`}><AveragePaceSvg /></span>
              <span className={`ml-2 ${largeText}`}>
                {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
              </span>
            </div>

            <div className="flex align-center">
              <span className={`${smallText} align-center`}><HeartRateSvg /></span>
              <span className={`ml-2 ${largeText}`}>
                {Math.round(activity.average_heartrate)} bpm
              </span>
            </div>

            <div>
              <span className={`${smallText}`}>Max HR</span>
              <span className={`ml-4 ${largeText}`}>
                {activity.max_heartrate} bpm
              </span>
            </div>

            <div>
              <span className={`${smallText} text-efficiencyFactor`}>Efficiency Factor</span>
              <span className={`ml-4 ${largeText} text-efficiencyFactor`}>
                {calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2)} y/b
              </span>
            </div>
          </div>
        </div>

        <div  className={styles.gridZonesWidth}>
          {(heartRateStream || activity.zonesCaches[zones.id]) && (
            <ZonesWidth
              id={activity.id}
              zonesCaches={activity.zonesCaches}
              zones={zones}
              heartData={heartRateStream}
            />
          )}
        </div>

        {!isCompact && (<div className={styles.gridBestEfforts}>
          {bestEfforts.length > 0 && (
            bestEfforts.filter(({ pr_rank }) => pr_rank).map((effort) => (
              <div key={effort.distance} className="flex flex-align-center">
                <span><PRMedal color={effort.pr_rank || 'black'} type={effort.pr_rank <= 3 ? 'native' : 'svg'} /></span>
                <small>
                  {effort.name} &rarr; <DurationDisplay numSeconds={effort.elapsed_time} />
                </small>
              </div>
            ))
          )}
        </div>)}

        <div className={styles.gridChildren}>
          {children}
        </div>
      </div>
    </Surface>
  )
};

export default memo(Tile);
