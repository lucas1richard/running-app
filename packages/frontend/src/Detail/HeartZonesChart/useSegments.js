import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectActivityDetailsMulti } from '../../reducers/activities';
import roundToNearest from '../../utils/roundToNearest';
import { convertMetricSpeedToMPH } from '../../utils';
import { emptyArray } from '../../constants';

/**
 * Returns the segments for the given activity ids.
 * If laps are present, returns laps, otherwise returns mile splits
 */
const useSegments = (ids = []) => {
  const multiDetails = useSelector((state) => selectActivityDetailsMulti(state, ids));
  const lapsMulti = useMemo(() => multiDetails.map((val) => val?.laps || emptyArray), [multiDetails]);
  const splitsMiMulti = useMemo(() => multiDetails.map((val) => val?.splits_standard || emptyArray), [multiDetails]);

  const lapsData = useMemo(
    () => {
      let offset = 0;
      return lapsMulti.map((laps) => laps.map((val, ix) => {
        const datum = [
          offset,
          roundToNearest(convertMetricSpeedToMPH(val.average_speed), 100),
          val.elapsed_time
        ];
        offset += val.elapsed_time;
        return datum;
      }))},
    [lapsMulti]
  );
  const splitsMiData = useMemo(
    () => {
      return splitsMiMulti.map((splitsMi) => {
        let offset = 0;
        return splitsMi.map((val, ix) => {
          const datum = [
            offset,
            roundToNearest(convertMetricSpeedToMPH(val.average_speed), 100),
            val.elapsed_time
          ];
          offset += val.elapsed_time;
          return datum;
        })
      });
    },
    [splitsMiMulti]
    );

    const segments = useMemo(() => ids.map((_, ix) => lapsData[ix]?.length > 1
      ? {
        name: 'Laps',
        data: lapsData[ix],
      }
      : {
        name: 'Mile Splits',
        data: splitsMiData[ix],
      }
    ), [ids, lapsData, splitsMiData]);
    
    return segments;
};

export default useSegments;
