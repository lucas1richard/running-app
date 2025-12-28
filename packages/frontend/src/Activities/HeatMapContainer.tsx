import { memo, useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import { success, useGetApiStatus, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { fetchHeatMapDataAct } from '../reducers/activities-actions';
import HeatMapMapLibre from '../Common/HeatMapMapLibre';
import { selectSportTypePreferences } from '../reducers/preferences';

const HeatMapContainer: React.FC<any> = ({ referenceTime, timeframe, localStorageKey }) => {
  const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
  const baseData = useAppSelector((state) => state.activities.heatMap[key]) || [];
  const typePrefs = useAppSelector(selectSportTypePreferences) || {};
  
  const action = fetchHeatMapDataAct(timeframe, referenceTime, key);
  
  useTriggerActionIfStatus(action, 'idle');
  
  const apiStatus = useGetApiStatus(action);
  
  const data = useMemo(() => baseData.filter(({ sportType }) => typePrefs[sportType]), [baseData, typePrefs]);


  const getPercentile = (p: number) => {
    const index = Math.floor(p * data.length);
    return data[index]?.total_seconds || 0;
  }

  return (
    <>
      <HeatMapMapLibre
        data={data}
        localStorageKey={localStorageKey}
        floorValue={getPercentile(0.5)}
        ceilingValue={getPercentile(0.97)}
        measure="total_seconds"
        deferRender={apiStatus !== success}
      />
    </>
  );
};

export default memo(HeatMapContainer);
