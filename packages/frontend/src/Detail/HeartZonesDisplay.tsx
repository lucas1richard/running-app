import React, { useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';
import { hrZonesBg, hrZonesText } from '../colors/hrZones';
import { convertHeartDataToZoneSpeeds, convertHeartDataToZoneTimes, convertMetricSpeedToMPH } from '../utils';
import styled from 'styled-components';
import { Basic, Flex } from '../DLS';
import Surface from '../DLS/Surface';
import ZonesWidth from '../Activities/ZonesWidth';

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

const CellWrapper = styled.div<{ ix: number, $isMaxPercentage?: boolean }>`
  padding: ${(props) => props.theme.getStandardUnit(1)};
  background: ${(props) => hrZonesBg[props.ix + 1]};
  border: 1px solid ${(props) => hrZonesBg[props.ix + 1]};
  ${(props) => props.$isMaxPercentage
    ?`box-shadow: inset 0 0 ${(props) => props.theme.getStandardUnit(1)}; ${hrZonesText[props.ix + 1]};`
    : ''
  }
`;

const DataWrapper = styled(Basic.Div)`
  &:not(:last-child) {
    margin-bottom: ${(props) => props.theme.getStandardUnit(1)};
  }
  display: flex;
  ${(props) => props.theme.breakpoints.down('xl')} {
    flex-direction: column;
    justify-items: flex-start;
  }
`;

const Cell: React.FC<CellProps> = ({ ix, title, range, percents, totalTimes, avg }) => {
  if (Number(percents[ix]) === 0) {
    return null;
  }
  const isMaxPercentage = Number(percents[ix]) === Math.max.apply(null, percents.map(Number));
  return (
    <CellWrapper
      ix={ix}
      className="text-white"
      $isMaxPercentage={isMaxPercentage}
    >
      <DataWrapper $textAlign="center" $marginB={1}>
        <b>{title}</b>&nbsp;<span>({range})</span>
      </DataWrapper>
      <DataWrapper $flexJustify="space-between">
        <b>Time in Zone:</b>
        <div>
          <DurationDisplay numSeconds={totalTimes[ix]} /> <span>({percents[ix]}%)</span>
        </div>
      </DataWrapper>
      {avg[ix] && (
        <>
          <DataWrapper $flexJustify="space-between">
            <b>Avg Pace in Zone:</b>
            <div>
              <DurationDisplay numSeconds={Math.floor((3660 / convertMetricSpeedToMPH(avg[ix].avg)))} />/mi
            </div>
          </DataWrapper>
          <DataWrapper $flexJustify="space-between">
            <b>Fastest Pace in Zone:</b>
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
    <Surface>
      {isUsingNonNativeZones && (
        <div>
          <small>Note: Using Non-native Heart Rate Zones</small>
        </div>
      )}
      <Basic.Div>
        <Flex $direction="column" $directionMdUp="row">
          <ZonesWidth
            zones={zones}
            heartData={heartData}
            id={zones.id}
            zonesCaches={{}}
            variant="circular"
            height="12rem"
            width="12rem"
          />
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
      </Basic.Div>
    </Surface>
  );
};

export default HeartZonesDisplay;
