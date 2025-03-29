import { useAppSelector } from '../hooks/redux';
import { success, useGetApiStatus, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { fetchHeatMapDataAct } from '../reducers/activities-actions';
import HeatMapMapLibre from '../Common/HeatMapMapLibre';

const HeatMapContainer: React.FC<any> = ({ referenceTime, timeframe }) => {
  const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
  const data = useAppSelector((state) => state.activities.heatMap[key]) || [];

  const action = fetchHeatMapDataAct(timeframe, referenceTime, key);
  
  useTriggerActionIfStatus(action, 'idle');

  const apiStatus = useGetApiStatus(action);

  return (
    <HeatMapMapLibre data={data} measure="total_seconds" deferRender={apiStatus !== success} />
  );
};

export default HeatMapContainer;
