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

const prsMap = {
  1: 'bg-gold-200 text-gold-900 raised-1 elevation-3',
  2: 'bg-silver-500 text-neutral-100 raised-1 elevation-2',
  3: 'bg-bronze-500 text-neutral-900 raised-1 elevation-1',
  4: 'bg-emerald-300 text-neutral-900 raised-1 elevation-1',
  5: 'bg-emerald-400 text-neutral-900 raised-1 elevation-1',
  6: 'bg-emerald-500 text-neutral-900 raised-1 elevation-1',
  7: 'bg-emerald-600 text-neutral-100 raised-1 elevation-1',
  8: 'bg-emerald-700 text-neutral-100 raised-1 elevation-1',
  9: 'bg-emerald-800 text-neutral-100 raised-1 elevation-1',
  10: 'bg-emerald-900 text-neutral-100 raised-1 elevation-1',
};

const prsRibbonMap = {
  1: '1',
  2: '2',
  3: '3',
  4: 'var(--color-emerald-900)',
  5: 'var(--color-emerald-900)',
  6: 'var(--color-emerald-900)',
  7: 'var(--color-emerald-100)',
  8: 'var(--color-emerald-100)',
  9: 'var(--color-emerald-100)',
  10: 'var(--color-emerald-100)',
};

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
    <Surface className={`p-4 raised-1 card container ${backgroundColor} ${className}`}>
      {hovered && <DetailDataFetcher id={activity.id} />}
      <div
        className={styles.grid}
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

            <div>
              <span className={`${smallText}`}><HeartRateSvg /></span>
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
              {/* <span className={`${smallText} text-efficiencyFactor`}>Efficiency Factor</span> */}
              <span className={`${largeText} text-efficiencyFactor`}>
                {calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2)} y/b
              </span>
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
              <div key={effort.distance} className={`${prsMap[effort.pr_rank]} card flex flex-align-center px-2 py-1`}>
                <PRMedal color={prsRibbonMap[effort.pr_rank]} rank={effort.pr_rank} type={effort.pr_rank <= 3 ? 'native' : 'svg'} />
                <span className="ml-1 text-sm">
                  <span className="text-bold">{effort.name}</span> &rarr; <DurationDisplay numSeconds={effort.elapsed_time} units={['', ':', ':']} />
                </span>
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
