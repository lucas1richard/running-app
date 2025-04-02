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
import { Basic, Flex, Grid } from '../DLS';
import ZonesWidth from './ZonesWidth';

type Props = {
  activity: Activity;
  isCompact?: boolean;
  backgroundIndicator?: string;
  children?: React.ReactNode;
}

const compactAreas = `
  "image title title"
  "stats stats stats"
  "zonesWidth zonesWidth zonesWidth"
  "children children children"
`;

const Tile: React.FC<Props> = ({ activity, backgroundIndicator, isCompact, children }) => {
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

  const { backgroundColor } = (backgroundIndicator === 'weather' && getWeatherStyles(activity.weather)) || { backgroundColor: 'dls-white-bg' };

  return (
    <Basic.Div $pad={0.5} className={`${backgroundColor}`}>
      {hovered && <DetailDataFetcher id={activity.id} />}
      <Grid
        $gap={isCompact ? 0.5 : 1}
        $templateColumns={isCompact ? '1fr auto auto' : 'auto 1fr auto'}
        $templateAreas={isCompact
          ? compactAreas
          : `
          "image title stats"
          "zonesWidth zonesWidth zonesWidth"
          "bestEfforts bestEfforts bestEfforts"
          "children children children"
        `}
        $templateColumnsSmDown={'auto'}
        $templateAreasSmDown={compactAreas}
      >
        <Basic.Div $gridArea="image">
          <GoogleMapImage
            activityId={activity.id}
            polyline={getSummaryPolyline(activity)}
            alt="summary route"
            imgWidth={400}
            imgHeight={200}
            width={100}
            height={75}
          />
        </Basic.Div>

        <Basic.Div $gridArea="title" $textAlign={isCompact ? 'right' : 'left'} $textAlignSmDown="right">
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
        </Basic.Div>

        <Basic.Div $gridArea="stats">
          <Basic.Div $textAlign={isCompact ? 'left' : 'right'} $textAlignSmDown='left'>
            <div>
              {duration}
              <Basic.Span $marginL={1} $fontSize="h4" $color="darkGold">
                {activity.distance_miles} <abbr>mi</abbr>
              </Basic.Span>
            </div>

            <div>
              <Basic.Span $fontSize="sm">Average Speed</Basic.Span>
              <Basic.Span $marginL={1} $fontSize="h4">
                {convertMetricSpeedToMPH(activity.average_speed).toFixed(2)} mph
              </Basic.Span>
            </div>

            <div>
              <Basic.Span $fontSize="sm">Average HR</Basic.Span>
              <Basic.Span $marginL={1} $fontSize="h4">
                {Math.round(activity.average_heartrate)} bpm (max {activity.max_heartrate} bpm)
              </Basic.Span>
            </div>

            <div className="dls-blue">
              <Basic.Span $fontSize="sm">Efficiency Factor</Basic.Span>
              <Basic.Span $marginL={1} $fontSize="h4">
                {calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2)} y/b
              </Basic.Span>
            </div>
          </Basic.Div>
        </Basic.Div>

        <Basic.Div $gridArea="zonesWidth">
          {(heartRateStream || activity.zonesCaches[zones.id]) && (
            <ZonesWidth
              id={activity.id}
              zonesCaches={activity.zonesCaches}
              zones={zones}
              heartData={heartRateStream}
            />
          )}
        </Basic.Div>

        {!isCompact && (<Basic.Div $gridArea="bestEfforts" $display="flex" $gap={1}>
          {bestEfforts.length > 0 && (
            bestEfforts.filter(({ pr_rank }) => pr_rank).map((effort) => (
              <Flex $flexShrink="1" $flexGrow="1" $alignItems='center' key={effort.distance}>
                <span><PRMedal color={effort.pr_rank || 'black'} type={effort.pr_rank <= 3 ? 'native' : 'svg'} /></span>
                <small>
                  {effort.name} &rarr; <DurationDisplay numSeconds={effort.elapsed_time} />
                </small>
              </Flex>
            ))
          )}
        </Basic.Div>)}

        <Basic.Div $gridArea="children">
          {children}
        </Basic.Div>
      </Grid>
    </Basic.Div>
  )
};

export default memo(Tile);
