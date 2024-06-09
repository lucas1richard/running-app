import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import requestor from '../utils/requestor/index';
import { convertHeartDataToZoneTimes } from '../utils';
import { selectActivity, selectActivityDetails, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartszones';
import { selectPreferencesZonesId } from '../reducers/preferences';

const streamTypes = ['heartrate', 'velocity_smooth', 'latlng', 'altitude'];

const DetailDataFetcher = ({ id }) => {
  const dispatch = useDispatch();
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const configZonesId = useSelector(selectPreferencesZonesId);
  const allZones = useSelector(selectAllHeartZones);
  const nativeZones = useSelector((state) => makeSelectApplicableHeartZone(state, activity.start_date));
  const zonesId = configZonesId === -1 ? nativeZones.id : configZonesId;
  const zones = allZones.find(({ id }) => id === zonesId) || nativeZones;

  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const details = useSelector((state) => selectActivityDetails(state, id));

  useEffect(() => {
    if (!heartRateStream?.data) dispatch({ type: 'activities/FETCH_STREAM_DATA', id, types: streamTypes });
    if (!details) dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: id });
    dispatch({ type: 'preferences/FETCH_ACTIVITY_PREFERENCES', payload: { activityId: id } });
  }, [details, dispatch, heartRateStream?.data, id]);

  useEffect(() => {
    if (!zones || !heartRateStream?.data) return;
    if (activity?.zonesCaches?.[zones.id]) return;

    requestor.post('/heartzones/set-cache', {
      times: convertHeartDataToZoneTimes(heartRateStream.data, zones),
      id: activity.id,
      zonesId: zones.id,
    });
  }, [activity.id, heartRateStream, id, zones.id]);

  return null;
}

export default DetailDataFetcher;
