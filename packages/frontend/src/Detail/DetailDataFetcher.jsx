import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import requestor from '../utils/requestor/index';
import { convertHeartDataToZoneTimes } from '../utils';
import { selectActivity, selectStreamType } from '../reducers/activities';
import { makeSelectApplicableHeartZone, selectAllHeartZones } from '../reducers/heartszones';
import { selectPreferencesZonesId } from '../reducers/preferences';
import { useGetApiStatus } from '../reducers/apiStatus';

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

  const streamDataStatus = useGetApiStatus(`activities/FETCH_STREAM_DATA-${id}`);
  const detailDataStatus = useGetApiStatus(`activities/FETCH_ACTIVITY_DETAIL-${id}`);
  const prefDataStatus = useGetApiStatus(`preferences/FETCH_ACTIVITY_PREFERENCES-${id}`);

  useEffect(() => {
    if (streamDataStatus === 'idle') {
      dispatch({ type: 'activities/FETCH_STREAM_DATA', id, types: streamTypes });
    }
    if (detailDataStatus === 'idle') {
      dispatch({ type: 'activities/FETCH_ACTIVITY_DETAIL', payload: id });
    }
    if (prefDataStatus === 'idle') {
      dispatch({ type: 'preferences/FETCH_ACTIVITY_PREFERENCES', payload: { activityId: id } });
    }
  }, [detailDataStatus, dispatch, id, prefDataStatus, streamDataStatus]);

  useEffect(() => {
    if (!zones || streamDataStatus !== 'success') return;
    if (activity?.zonesCaches?.[zones.id]) return;

    requestor.post('/heartzones/set-cache', {
      times: convertHeartDataToZoneTimes(heartRateStream.data, zones),
      id: activity.id,
      zonesId: zones.id,
    });
  }, [activity.id, activity?.zonesCaches, heartRateStream?.data, streamDataStatus, zones]);

  return null;
}

export default DetailDataFetcher;
