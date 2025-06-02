import roundToNearest from '@/utils/roundToNearest';
import { convertMetricSpeedToMPH } from '@/utils';
import { emptyArray } from '@/constants';
import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue';

/**
 * Returns the segments for the given activity ids.
 * If laps are present, returns laps, otherwise returns mile splits
 */
const useSegments = (ids: number[] = emptyArray) => {
  const activitiesStore = useActivitiesStore();
  const multiDetails = activitiesStore.getActivityDetailsMulti(ids);
  const lapsMulti = multiDetails.value.map((val) => val?.laps || emptyArray);
  const splitsMiMulti = multiDetails.value.map((val) => val?.splits_standard || emptyArray);

  const lapsData = computed(
    () => {
      let offset = 0;
      return lapsMulti.map((laps) => laps.map((val, ix) => {
        const datum: [number, number, number] = [
          offset,
          roundToNearest(convertMetricSpeedToMPH(val.average_speed), 100),
          val.elapsed_time
        ];
        offset += val.elapsed_time;
        return datum;
      }))}
  );
  const splitsMiData = computed(
    () => {
      return splitsMiMulti.map((splitsMi) => {
        let offset = 0;
        return splitsMi.map((val, ix) => {
          const datum: [number, number, number] = [
            offset,
            roundToNearest(convertMetricSpeedToMPH(val.average_speed), 100),
            val.elapsed_time
          ];
          offset += val.elapsed_time;
          return datum;
        })
      });
    }
    );

    const segments = computed(() => ids.map((_, ix) => lapsData.value[ix]?.length > 1
      ? {
        name: 'Laps',
        data: lapsData.value[ix],
      }
      : {
        name: 'Mile Splits',
        data: splitsMiData.value[ix],
      }
    ));
    
    return segments;
};

export default useSegments;
