import React from 'react';
import { useSelector } from '../../../node_modules/react-redux/dist/react-redux';
import { selectActivityDetails } from '../../reducers/activities';
import { convertMetersToFt, convertMetersToMiles, convertMetricSpeedToMPH } from '../../utils';
import DurationDisplay from '../../Common/DurationDisplay';

const processLaps = (laps) => {
  let timeStart = 0;

  const processed = laps.map((lap, ix) => {
    const {
      average_speed,
      elapsed_time,
      distance,
      total_elevation_gain,
    } = lap;

    let dist = convertMetersToMiles(distance);
    let distUnit = 'mi';
    if (dist < 0.1) {
      dist = convertMetersToFt(distance);
      distUnit = 'ft';
    }

    const processedLap = {
      ...lap,
      dist,
      distUnit,
      timeStart: timeStart,
      timeEnd: timeStart + elapsed_time - 1,
      secondsPerMile: Math.floor((3660 / convertMetricSpeedToMPH(average_speed))),
      totalElevationGainFt: convertMetersToFt(total_elevation_gain),
    };
    
    timeStart += elapsed_time;

    return processedLap
  });

  return processed;
};

const Laps = ({ id }) => {
  const details = useSelector((state) => selectActivityDetails(state, id));
  const laps = details?.laps;

  if (!laps) return null;

  return (
    <div>
      <table className="dls-white-bg">
        <thead>
          <tr>
            <th colSpan="7" className="text-center">Laps</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Time</th>
            <th>Distance</th>
            <th>Pace</th>
            <th>Heart Rate</th>
            <th>Max Heart Rate</th>
            <th>Elevation Gain</th>
          </tr>
        </thead>
        <tbody>
          {processLaps(laps).map((lap) => {
            return (
              <tr key={lap.name} className="text-right">
                <td>{lap.name}</td>
                <td><DurationDisplay numSeconds={lap.elapsed_time} /></td>
                <td>{lap.dist} <small>{lap.distUnit}</small></td>
                <td><DurationDisplay numSeconds={Math.floor((1 / convertMetersToMiles(lap.distance)) * lap.elapsed_time)} units={['', ':']} /></td>
                <td className="text-center">{Math.round(lap.average_heartrate)} <abbr>bpm</abbr></td>
                <td className="text-center">{lap.max_heartrate} <abbr>bpm</abbr></td>
                <td>{lap.totalElevationGainFt} <small>ft</small></td>
              </tr>
            )}
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Laps;
