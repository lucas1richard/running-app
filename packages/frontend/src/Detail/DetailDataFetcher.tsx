import { FC, useEffect } from 'react';
import requestor from '../utils/requestor/index';
import { convertHeartDataToZoneTimes } from '../utils';
import { selectActivity, selectStreamTypeData } from '../reducers/activities';
import { selectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartzones';
import { selectPreferencesZonesId } from '../reducers/preferences';
import { success, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchActivityDetail, triggerFetchActivityStreamData } from '../reducers/activities-actions';
import { triggerFetchActivityPrefs } from '../reducers/preferences-actions';
import { useAppSelector } from '../hooks/redux';
import { triggerFetchSimilarStart } from '../reducers/activitydetail-actions';

export const streamTypes: SimpleStreamTypes[] = [
  'heartrate', 'velocity_smooth', 'latlng', 'altitude', 'time', 'grade_smooth', 'distance'
];

type Props = {
  id: number;
}

const DetailDataFetcher: FC<Props> = ({ id }) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const configZonesId = useAppSelector(selectPreferencesZonesId);
  const allZones = useAppSelector(selectAllHeartZones);
  const nativeZones = useAppSelector((state) => selectApplicableHeartZone(state, activity?.start_date));
  const zonesId = configZonesId === -1 ? nativeZones?.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));

  useTriggerActionIfStatus(triggerFetchActivityDetail(id));
  useTriggerActionIfStatus(triggerFetchActivityPrefs(id));
  useTriggerActionIfStatus(triggerFetchSimilarStart(id, 0.001));
  const streamStatus = useTriggerActionIfStatus(triggerFetchActivityStreamData(id, streamTypes));

  useEffect(() => {
    if (!zones || streamStatus !== success) return;
    if (activity?.zonesCaches?.[zones?.id]) return;

    requestor.post('/heartzones/set-cache', {
      times: convertHeartDataToZoneTimes(heartRateStream, zones),
      id: activity?.id,
      zonesId: zones?.id,
    });
  }, [activity?.id, activity?.zonesCaches, heartRateStream, streamStatus, zones]);

  return null;
};

export default DetailDataFetcher;
