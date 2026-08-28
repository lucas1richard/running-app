import DurationDisplay from '@/Common/DurationDisplay';
import D3BarChart from '@/DLS/D3BarChart';
import Surface from '@/DLS/Surface';
import { useAppSelector } from '@/hooks/redux';
import { selectActivityDetails, selectStreamTypeData } from '@/reducers/activities';
import { convertMetersToFt, convertMetersToMiles, convertMetricSpeedToMPH } from '@/utils';
import calculateCardioResponse from '@/utils/calculateCardioResponse';
import calculateRecoveryTau from '@/utils/calculateRecoveryTau';
import detectTransitions from '@/utils/findTransitions';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import CardioResponse from './CardioResponse';


// calculateRecoveryTau
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

const getLapHrData = (laps, hr, time, ix) => {
  const lap = laps[ix];
  if (!lap) return;
  const startIx = lap.start_index; // 2 seconds grace period
  const startHr = hr[startIx];
  const diffThreshhold = 10;
  const ixSf = hr
    .findIndex((v, i) => i >= startIx && i <= (laps[ix + 1]?.start_index || hr.length) - 1 && Math.abs(v - startHr) >= diffThreshhold);

  const sfs = time[ixSf] - time[startIx];
  if (isNaN(sfs) || sfs < 0) return;

  return {
    startHr,
    sfs,
    sfhr: hr[ixSf]
  }
}

const Laps = ({ id }) => {
  const details = useSelector((state) => selectActivityDetails(state, id));
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const velocityStream = useAppSelector((state) => selectStreamTypeData(state, id, 'velocity_smooth'));
  const timeStream = useAppSelector((state) => selectStreamTypeData(state, id, 'time'));
  const transitions = useMemo(() => detectTransitions(
    velocityStream.map((value, ix) => ({ time: timeStream[ix], value })),
    20,
    0.5 // meters/second
  ), [velocityStream, timeStream]);

  const laps = details?.laps || [];

  return (
    <div className="mt-4 card">
      <Surface className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th colSpan="7" className="raised-1 bg-neutral-800 text-white text-center">Laps</th>
            </tr>
            <tr className="raised-1 bg-neutral-800 text-white">
              <th className="px-4">Index</th>
              <th className="px-4">Time</th>
              <th className="px-4">Distance</th>
              <th className="px-4">Pace</th>
              <th className="px-4">Heart Rate</th>
              <th className="px-4">Max Heart Rate</th>
              <th className="px-4">Elevation Gain</th>
              <th className="px-4">HR</th>
              <th className="px-4">Cardio Response</th>
            </tr>
          </thead>
          <tbody>
            {transitions.filter(Boolean).map((lap, ix) => {
              return (
                <tr key={lap.name} className={`text-right text-white bg-neutral-700 ${ix % 2 === 0 ? 'sunken-1' : ''}`}>
                  <td>{lap.start_index}</td>
                  <td><DurationDisplay numSeconds={lap.time} /></td>
                  <td>{lap.dist} <small>{lap.distUnit}</small></td>
                  <td>
                    {/* <DurationDisplay
                      numSeconds={Math.floor((1 / convertMetersToMiles(lap.distance)) * lap.elapsed_time)} units={['', ':']}
                    /> */}
                  </td>
                  <td className="text-center">{Math.round(lap.average_heartrate)} <abbr>bpm</abbr></td>
                  <td className="text-center">{lap.max_heartrate} <abbr>bpm</abbr></td>
                  <td>{lap.totalElevationGainFt} <small>ft</small></td>
                  <td>{(() => {
                    const hrData = (getLapHrData(transitions, heartRateStream, timeStream, ix));
                    if (!hrData) return '';
                    const dir = hrData.sfhr > hrData.startHr ? '^' : 'v'
                    return <span>{`${hrData.sfs}s for ${hrData.startHr}`} &rarr; {`${hrData.sfhr}`}</span>
                  })()}</td>
                  <td><CardioResponse lap={lap} activityId={id} /></td>
                </tr>
              )
            }
            )}
          </tbody>
        </table>
        <b>Recovery τ</b> is the time it takes your heart rate to drop about 63% of the way from its post-run level back toward your normal walking heart rate.
        <div>
          <div><b>averageWorkload</b> = Your average estimated running workload (VO₂) during the first 60 seconds of the interval.</div>
          <div><b>hrRise30s</b> = How many BPM your heart rate increased during the first 30 seconds of running.</div>
          <div><b>hrRise60s</b> = How many BPM your heart rate increased during the first 60 seconds of running.</div>
          <div><b>hrAuc60s</b> = The cumulative amount of heart-rate elevation above your starting HR during the first 60 seconds.</div>
          <div><b>efficiency</b> = Your estimated running workload divided by your average heart-rate elevation, where higher means more workload for the same HR response.</div>
        </div>
      </Surface>

      {/* <Surface>
        <D3BarChart
          series={[
            {
              id: 'Start Heartrate',
              data: processLaps(laps).map((l, ix) => ({ label: ix + 1, value: heartRateStream[l.start_index] })),
              color: (p, ix) => ix % 2 === 0 ? 'rgba(255, 255, 0, 1)' : 'rgba(255, 255, 0, 0.2)'
            },
            {
              id: 'Average Heartrate',
              data: processLaps(laps).map((l, ix) => ({ label: ix + 1, value: l.average_heartrate })),
              color: (p, ix) => ix % 2 === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 0, 0, 0.2)',
            },
            {
              id: 'End Heartrate',
              data: processLaps(laps).map((l, ix) => ({ label: ix + 1, value: heartRateStream[l.end_index] })),
              color: (p, ix) => ix % 2 === 0 ? 'rgba(255, 153, 0, 1)' : 'rgba(255, 153, 0, 0.2)'
            },
          ]}
        />
        <D3BarChart
          series={[
            {
              id: 'Pace',
              data: processLaps(laps).map((l, ix) => ({ label: ix + 1, value: l.distance / l.elapsed_time })),
              color: 'orange'
            },
          ]}
        />
      </Surface> */}
    </div>
  );
};

export default Laps;
