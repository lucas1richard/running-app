import { selectActivity, selectStreamTypeMulti } from '../../reducers/activities';
import { useMemo } from 'react';
import getSmoothVal from '../HeartZonesChart/getSmoothVal';
import { condenseZonesFromHeartRate } from '../../utils';
import { selectHeartZones } from '../../reducers/heartzones';
import { hrZonesText } from '../../colors/hrZones';
import { emptyArray } from '../../constants';
import { useAppSelector } from '../../hooks/redux';

const useHRZoneIndicators = (ids: number[], pointer: number, smoothAverageWindow: number) => {
  const activity = useAppSelector((state) => selectActivity(state, ids[0]));
  const heartRateStreamMulti = useAppSelector((state) => selectStreamTypeMulti(state, ids, 'heartrate')) || emptyArray;
  const heartRateArray = heartRateStreamMulti.map((stream) => stream?.data || emptyArray);

  const timeStreamMulti = useAppSelector((state) => selectStreamTypeMulti(state, ids, 'time'));
  const timeArray = timeStreamMulti.map((stream) => stream?.data || emptyArray);

  const fullTimeArray = useMemo(() => {
    return timeArray.map((time) => {
      const maxTime = time[time.length - 1];
      const timeArr = new Array(maxTime).fill(0).map((_, ix) => ix);
      for (let i = 0, j = 0; i < timeArr.length; i++) {
        if (time[j] === i) j++;
        else timeArr[i] = null;
      }
      return timeArr;
    });
  }, [timeArray]);

  const smoothHeartRateArray = useMemo(
    () => fullTimeArray.map((fullTime, ix) => getSmoothVal(fullTime, heartRateArray[ix], smoothAverageWindow)),
    [fullTimeArray, heartRateArray, smoothAverageWindow]
  );

  const zones = useAppSelector((state) => selectHeartZones(state, activity?.start_date));

  const hrzonesArray = useMemo(
    () => ids.map((_, ix) => condenseZonesFromHeartRate(zones, smoothHeartRateArray[ix])),
    [ids, zones, smoothHeartRateArray]
  );

  const indicatorColors = useMemo(() => {
    return ids.map((id, ix) => {
      const hrzones = hrzonesArray[ix];
      if (!hrzones) return { fill: 'black', stroke: 'black'};
      const { zone } = hrzones.find(
        ({ from }, ix) => from <= pointer && hrzones[ix + 1]?.from > pointer
      ) || hrzones[hrzones.length - 1];
      return { fill: hrZonesText[zone], stroke: ix === 0 ? 'black' : 'red' };
    });
  }, [hrzonesArray, ids, pointer]);

  return indicatorColors;
};

export default useHRZoneIndicators;
