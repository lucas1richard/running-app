import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import requestor from '../utils/requestor/index';
import { convertHeartDataToZoneTimes } from '../utils';
import { selectActivity, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartzones';
import { selectPreferencesZonesId } from '../reducers/preferences';
import { success, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { triggerFetchActivityDetail, triggerFetchActivityStreamData } from '../reducers/activities-actions';
import { triggerFetchActivityPrefs } from '../reducers/preferences-actions';

const streamTypes = ['heartrate', 'velocity_smooth', 'latlng', 'altitude', 'time'];
const emptyObj = {};

const DetailDataFetcher = ({ id }) => {
  const activity = useSelector((state) => selectActivity(state, id)) || emptyObj;
  const configZonesId = useSelector(selectPreferencesZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector((state) => makeSelectApplicableHeartZone(state, activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));

  useTriggerActionIfStatus(triggerFetchActivityDetail(id));
  useTriggerActionIfStatus(triggerFetchActivityPrefs(id));
  const streamStatus = useTriggerActionIfStatus(triggerFetchActivityStreamData(id, streamTypes));

  useEffect(() => {
    if (!zones || streamStatus !== success) return;
    if (activity?.zonesCaches?.[zones.id]) return;

    requestor.post('/heartzones/set-cache', {
      times: convertHeartDataToZoneTimes(heartRateStream.data, zones),
      id: activity.id,
      zonesId: zones.id,
    });
  }, [activity.id, activity?.zonesCaches, heartRateStream?.data, streamStatus, zones]);

  return null;
}

export default DetailDataFetcher;
