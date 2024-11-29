import React from 'react';
import HeartZonesChartDisplay from './HeartZonesChartDisplay';
import { useSelector } from 'react-redux';
import { selectActivity, selectActivityDetails, selectStreamType } from '../../reducers/activities';
import { selectHeartZones } from '../../reducers/heartzones';
import usePreferenceControl from '../../hooks/usePreferenceControl';

const HeartZonesChartContainer = ({ id }) => {
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const latlngStream = useSelector((state) => selectStreamType(state, id, 'latlng'));
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const velocityStream = useSelector((state) => selectStreamType(state, id, 'velocity_smooth'));
  const altitudeStream = useSelector((state) => selectStreamType(state, id, 'altitude'));
  const timeStream = useSelector((state) => selectStreamType(state, id, 'time'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date));
  const details = useSelector((state) => selectActivityDetails(state, id));
  const bestEfforts = details?.best_efforts || [];
  const laps = details?.laps || [];
  const splitsMi = details?.splits_standard || [];

  const [
    zonesBandsDirection,
    setZonesBandsDirection,
    savePreferences,
  ] = usePreferenceControl(['activities', id, 'zonesBandsDirection'], 'xAxis');

  return (
    <div>
      <HeartZonesChartDisplay
        id={id}
        data={heartRateStream?.data || []}
        latlng={latlngStream?.data || []}
        velocity={velocityStream?.data || []}
        altitude={altitudeStream?.data || []}
        time={timeStream?.data || []}
        zones={zones}
        zonesBandsDirection={zonesBandsDirection}
        laps={laps}
        bestEfforts={bestEfforts}
        splitsMi={splitsMi}
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
