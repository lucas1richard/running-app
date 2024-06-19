import React from 'react';
import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { useSelector } from 'react-redux';
import { selectActivity, selectStreamType } from '../../reducers/activities';
import { selectHeartZones } from '../../reducers/heartzones';
import usePreferenceControl from '../../hooks/usePreferenceControl';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  const altitudeStream = useSelector((state) => selectStreamType(state, id, 'altitude'));
  const timeStream = useSelector((state) => selectStreamType(state, id, 'time'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date));

  const [
    zonesBandsDirection,
    setZonesBandsDirection,
    savePreferences,
  ] = usePreferenceControl(['activities', id, 'zonesBandsDirection'], 'xAxis');

  return (
    <div>
      <HeartZonesChartDisplay
        data={heartRateStream?.data || []}
        velocity={velocityStream?.data || []}
        altitude={altitudeStream?.data || []}
        time={timeStream?.data || []}
        zones={zones}
        zonesBandsDirection={zonesBandsDirection}
      />
      <form onSubmit={(ev) => ev.preventDefault()}>
        <label>
          <input
            type="radio"
            value="xAxis"
            checked={zonesBandsDirection === 'xAxis'}
            onChange={(e) => setZonesBandsDirection('xAxis')}
          />
          xAxis
        </label>
        <label>
          <input
            type="radio"
            value="yAxis"
            checked={zonesBandsDirection === 'yAxis'}
            onChange={(e) => setZonesBandsDirection('yAxis')}
          />
          yAxis
        </label>
        <label>
          <input
            type="radio"
            value="none"
            checked={zonesBandsDirection === 'none'}
            onChange={(e) => setZonesBandsDirection('none')}
          />
          None
        </label>
        <button type="button" onClick={() => savePreferences({ activityId: id })}>Save</button>
      </form>
    </div>
  );
};

export default HeartZonesChartContainer;
