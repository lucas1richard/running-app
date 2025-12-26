import { memo, useMemo } from 'react';
import { useAppSelector } from '../hooks/redux';
import { success, useGetApiStatus, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { fetchHeatMapDataAct } from '../reducers/activities-actions';
import HeatMapMapLibre from '../Common/HeatMapMapLibre';
import { selectSportTypePreferences } from '../reducers/preferences';

const HeatMapContainer: React.FC<any> = ({ referenceTime, timeframe }) => {
  const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
  const baseData = useAppSelector((state) => state.activities.heatMap[key]) || [];
  const typePrefs = useAppSelector(selectSportTypePreferences) || {};

  const action = fetchHeatMapDataAct(timeframe, referenceTime, key);
  
  useTriggerActionIfStatus(action, 'idle');

  const apiStatus = useGetApiStatus(action);

  const data = useMemo(() => baseData.filter(({ sportType }) => typePrefs[sportType]), [baseData, typePrefs]);
  const maximumValue = useMemo(() => {
    return Math.max(...data.map((d) => d.total_seconds || 0));
  }, [data]);
  const minimumValue = useMemo(() => {
    return Math.min(...data.map((d) => d.total_seconds || 0));
  }, [data]);

  const numSteps = 400;
  const ranges = useMemo(() => {
    const step = (maximumValue - minimumValue) / numSteps;
    return Array(numSteps + 1).fill(0).map((_, i) => minimumValue + step * i);
  }, [maximumValue, minimumValue]);

  const dataInRanges = useMemo(() => {
    const counts = Array(numSteps).fill(0);
    data.forEach(({ total_seconds }) => {
      const value = total_seconds || 0;
      const percent = (value - minimumValue) / (maximumValue - minimumValue);
      const index = Math.min(numSteps - 1, Math.max(0, Math.floor(percent * numSteps)));
      counts[index] += 1;
    });
    return counts;
  }, [data, maximumValue, minimumValue]);

  const maxDataInRange = useMemo(() => {
    return Math.max(...dataInRanges);
  }, [dataInRanges]);

  return (
    <>
      <HeatMapMapLibre
        data={data}
        // floorValue={1000}
        ceilingValue={400}
        measure="total_seconds"
        deferRender={apiStatus !== success}
      />
      <div className="flex" style={{ height: '200px' }}>
        {dataInRanges.map((value, index) => {
          const percent = (value - minimumValue) / (maximumValue - minimumValue);
          const color = `rgba(
            ${Math.round(255 - 255 * percent)},
            ${Math.round(255 * percent)},
            0,
            ${Math.max(0.1, percent)}
          )`;
          return (
            <div
              key={index}
              className="flex-item-grow"
              style={{ backgroundColor: color, height: `${(value / maxDataInRange) * 100}%`, position: 'relative' }}
            >
            </div>
          );
        })}
      </div>
    </>
  );
};

export default memo(HeatMapContainer);
