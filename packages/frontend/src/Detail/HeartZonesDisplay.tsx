import React, { useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';
import { hrZonesBg, hrZonesText } from '../colors/hrZones';
import { convertHeartDataToZoneSpeeds, convertHeartDataToZoneTimes, convertMetricSpeedToMPH } from '../utils';
import styled from 'styled-components';
import { Flex } from '../DLS';

type HeartZonesDisplayProps = {
  zones: HeartZone;
  nativeZones: HeartZone;
  heartData: number[];
  velocityData: number[];
};

type CellProps = {
  ix: number;
  title: string;
  range: string | JSX.Element;
  percents: string[];
  totalTimes: number[];
  avg: { avg: number; max: number }[];
};

const CellWrapper = styled.div<{ ix: number, isMaxPercentage?: boolean }>`
  padding: 1rem;
  background: ${(props) => hrZonesBg[props.ix + 1]};
  border: 1px solid ${(props) => hrZonesBg[props.ix + 1]};
  ${(props) => props.isMaxPercentage
    ?`box-shadow: inset 0 0 1rem ${hrZonesText[props.ix + 1]};`
    : ''
  }
`;

const DataWrapper = styled.div`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
  display: flex;
  ${(props) => props.theme.breakpoints.down('xl')} {
    flex-direction: column;
    justify-items: flex-start;
  }
`;

const Cell: React.FC<CellProps> = ({ ix, title, range, percents, totalTimes, avg }) => {
  const isMaxPercentage = Number(percents[ix]) === Math.max.apply(null, percents.map(Number));
  return (
    <CellWrapper
      ix={ix}
      className="flex-item-grow"
      isMaxPercentage={isMaxPercentage}
    >
      <DataWrapper className="text-center margin-b">
        <b>{title}</b>
        <span>({range})</span>
      </DataWrapper>
      <DataWrapper className="flex flex-justify-between">
        <b>
          Time in Zone:
        </b>
        <div>
          <DurationDisplay numSeconds={totalTimes[ix]} /> <span>({percents[ix]}%)</span>
        </div>
      </DataWrapper>
      {avg[ix] && (
        <>
          <DataWrapper className="flex flex-justify-between">
            <b>
              Avg Pace in Zone:
            </b>
            <div>
              <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(avg[ix].avg)))} />/mi
            </div>
          </DataWrapper>
          <DataWrapper className="flex flex-justify-between">
            <b>
              Fastest Pace in Zone:
            </b>
            <div>
              <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(avg[ix].max)))} />/mi
            </div>
          </DataWrapper>
        </>
      )}
    </CellWrapper>
  );
};

const HeartZonesDisplay: React.FC<HeartZonesDisplayProps> = ({ zones, nativeZones, heartData, velocityData }) => {
  const totalTimes = useMemo(() => {
    return convertHeartDataToZoneTimes(heartData, zones);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- we have the sub-array in the dependency array
  }, [heartData, zones.z1, zones.z2, zones.z3, zones.z4, zones.z5]);

  const percents = useMemo(
    () => totalTimes.map((time) => (100 * time / heartData?.length).toFixed(2)),
    [totalTimes, heartData?.length]
  );

  const avg = useMemo(() => convertHeartDataToZoneSpeeds(zones, heartData, velocityData), [heartData, velocityData, zones]);

  const isUsingNonNativeZones = nativeZones.id !== zones.id;

  return (
    <div className='dls-white-bg'>
      {isUsingNonNativeZones && (
        <div>
          <small>Note: Using Non-native Heart Rate Zones</small>
        </div>
      )}
      <div className="border-1">
        <Flex
          direction="column"
          directionMd="row"
          directionLg="row"
          directionXl="row"
        >
          <Cell
            ix={0}
            title="Zone 1"
            range={`${zones.z1} - ${zones.z2 - 1}`}
            percents={percents}
            totalTimes={totalTimes}
            avg={avg}
          />
          <Cell
            ix={1}
            title="Zone 2"
            range={`${zones.z2} - ${zones.z3 - 1}`}
            percents={percents}
            totalTimes={totalTimes}
            avg={avg}
          />
          <Cell
            ix={2}
            title="Zone 3"
            range={`${zones.z3} - ${zones.z4 - 1}`}
            percents={percents}
            totalTimes={totalTimes}
            avg={avg}
          />
          <Cell
            ix={3}
            title="Zone 4"
            range={`${zones.z4} - ${zones.z5 - 1}`}
            percents={percents}
            totalTimes={totalTimes}
            avg={avg}
          />
          <Cell
            ix={4}
            title="Zone 5"
            range={<span>&ge; {zones.z5}</span>}
            percents={percents}
            totalTimes={totalTimes}
            avg={avg}
          />
        </Flex>
      </div>
    </div>
  );
};

export default HeartZonesDisplay;
