import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import classNames from 'classnames';
import styled from 'styled-components';
import { selectStreamTypeData } from '../reducers/activities';
import ZonesWidth from './ZonesWidth';
import DurationDisplay from '../Common/DurationDisplay';
import { convertMetricSpeedToMPH, getSummaryPolyline, getWeatherStyles } from '../utils';
import GoogleMapImage from '../Common/GoogleMapImage';
import { selectHeartZones } from '../reducers/heartzones';
import DetailDataFetcher from '../Detail/DetailDataFetcher';
import PRMedal from '../Common/Icons/PRMedal';
import calcEfficiencyFactor from '../utils/calcEfficiencyFactor';
import { emptyArray } from '../constants';
import { useAppSelector } from '../hooks/redux';
import { Grid, GridArea } from '../DLS';

type Props = {
  activity: Activity;
  isCompact?: boolean;
  backgroundIndicator?: string;
}

const Title = styled.div`
  grid-area: title;
  text-align: left;
  ${props => props.theme.breakpoints.down('md')} {
    text-align: right;
  }
`;

const StatsWrapper = styled.div`
  text-align: right;
  ${props => props.theme.breakpoints.down('md')} {
    text-align: left;
  }
`;

const compactAreas = `
  "image title title"
  "stats stats stats"
  "zonesWidth zonesWidth zonesWidth"
  "bestEfforts bestEfforts bestEfforts"`;

const Tile: React.FC<Props> = ({ activity, backgroundIndicator, isCompact }) => {
  const [hovered, setHovered] = React.useState(false);
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, activity.id, 'heartrate'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity.start_date))
  const bestEfforts = activity?.bestEfforts || emptyArray;

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const duration = useMemo(
    () => <DurationDisplay numSeconds={activity.elapsed_time} units={['s ', 'm ', 'h ']} />,
    [activity.elapsed_time]
  );
  
  const { backgroundColor } = (backgroundIndicator === 'weather' && getWeatherStyles(activity.weather)) || { backgroundColor: 'dls-white-bg' };
  
  return (
    <div className={`${backgroundColor} pad full-height`}>
      {hovered && <DetailDataFetcher id={activity.id} />}
      <Grid 
        gap="1rem"
        templateColumns={isCompact ? '1fr auto auto' : 'auto 1fr auto'}
        templateAreas={isCompact
          ? compactAreas
          : `
          "image title stats"
          "zonesWidth zonesWidth zonesWidth"
          "bestEfforts bestEfforts bestEfforts"
        `}
        templateColumnsSmDown={'auto'}
        templateAreasSmDown={compactAreas}
      >
        <GridArea area="image">
          <GoogleMapImage
            activityId={activity.id}
            polyline={getSummaryPolyline(activity)}
            alt="summary route"
            imgWidth={400}
            imgHeight={200}
            width={100}
            height={75}
          />
        </GridArea>
        <Title className={classNames({ 'text-right': isCompact })}>
          <div>
            {dayjs(activity.start_date_local).format('MMMM DD, YYYY')}
          </div>
          <Link
            to={`/${activity.id}/detail`}
            className="heading-4"
            onMouseEnter={onMouseEnter}
            onFocus={onMouseEnter}
          >
            {activity.name}
          </Link>
        </Title>
        <GridArea area="stats">
          <StatsWrapper className={classNames({ 'text-left': isCompact })}>
            <div>
              {duration}
              <span className="margin-l heading-4 dls-dark-gold">
                {activity.distance_miles} <abbr>mi</abbr>
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
            <div className="dls-blue">
              <small>Efficiency Factor</small>
              <span className="margin-l heading-4">
                {calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2)} y/b
              </span>
            </div>
          </StatsWrapper>
        </GridArea>
          {(heartRateStream || activity.zonesCaches[zones.id]) && (
            <ZonesWidth
              id={activity.id}
              zonesCaches={activity.zonesCaches}
              zones={zones}
              heartData={heartRateStream}
            />
          )}
        <GridArea area="bestEfforts" className="flex flex-wrap gap">
          {bestEfforts.length > 0 && (
            bestEfforts.map((effort) => (
              <div key={effort.effort_id} className="valign-middle">
                <span><PRMedal color={effort.pr_rank} type="native" /></span>
                <small>
                  {effort.name} &rarr; <DurationDisplay numSeconds={effort.elapsed_time} />
                </small>
              </div>
            ))
          )}
        </GridArea>
      </Grid>
    </div>
  )
};

export default Tile;
