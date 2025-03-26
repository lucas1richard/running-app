import { useAppSelector } from '../hooks/redux';
import { success, useGetApiStatus, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { fetchHeatMapDataAct } from '../reducers/activities-actions';
import HeatMap from '../Common/HeatMap';

const HeatMapContainer = () => {
  const data = useAppSelector((state) => state.activities.heatMap) || [];

  useTriggerActionIfStatus(fetchHeatMapDataAct(), 'idle');

  const apiStatus = useGetApiStatus(fetchHeatMapDataAct());

  return (
    <HeatMap data={data} measure="total_seconds" deferRender={apiStatus !== success} />
  );
};

export default HeatMapContainer;
