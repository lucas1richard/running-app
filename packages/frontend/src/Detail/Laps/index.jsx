import React from 'react';
import { useSelector } from '../../../node_modules/react-redux/dist/react-redux';
import { selectActivityDetails } from '../../reducers/activities';
import { convertMetersToFt, convertMetersToMiles, convertMetricSpeedToMPH } from '../../utils';
import DurationDisplay from '../../Common/DurationDisplay';
import Surface from '../../DLS/Surface';

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
    <div className="mt-4 card">
      <Surface className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th colSpan="7" className="raised-1 bg-neutral-800 text-white text-center">Laps</th>
            </tr>
            <tr className="raised-1 bg-neutral-800 text-white">
              <th className="px-4">Name</th>
              <th className="px-4">Time</th>
              <th className="px-4">Distance</th>
              <th className="px-4">Pace</th>
              <th className="px-4">Heart Rate</th>
              <th className="px-4">Max Heart Rate</th>
              <th className="px-4">Elevation Gain</th>
            </tr>
          </thead>
          <tbody>
            {processLaps(laps).map((lap, ix) => {
              return (
                <tr key={lap.name} className={`text-right text-white bg-neutral-700 ${ix % 2 === 0 ? 'sunken-1' : ''}`}>
                  <td>{lap.name}</td>
                  <td><DurationDisplay numSeconds={lap.elapsed_time} /></td>
                  <td>{lap.dist} <small>{lap.distUnit}</small></td>
                  <td>
                    <DurationDisplay
                      numSeconds={Math.floor((1 / convertMetersToMiles(lap.distance)) * lap.elapsed_time)} units={['', ':']}
                    />
                  </td>
                  <td className="text-center">{Math.round(lap.average_heartrate)} <abbr>bpm</abbr></td>
                  <td className="text-center">{lap.max_heartrate} <abbr>bpm</abbr></td>
                  <td>{lap.totalElevationGainFt} <small>ft</small></td>
                </tr>
              )}
            )}
          </tbody>
        </table>
      </Surface>
    </div>
  );
};

export default Laps;
