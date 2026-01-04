import { useSelector } from 'react-redux';
import { selectActivityDetails } from '../../reducers/activities';
import Surface from '../../DLS/Surface';
import DurationDisplay from '../../Common/DurationDisplay';

const SplitsKm = ({ id }) => {
  const details = useSelector((state) => selectActivityDetails(state, id));
  
  return (
    <div className="mt-4 card">
      <Surface className="overflow-x-auto">
        <table>
          <thead>
            <tr className={`raised-1 bg-neutral-800 text-white text-center`}>
              <th colSpan={6}>Kilometer Splits</th>
            </tr>
            <tr className={`raised-1 bg-neutral-800 text-white`}>
              <th className="px-4">Name</th>
              <th className="px-4">Time</th>
              <th className="px-4">Distance</th>
              <th className="px-4">Pace</th>
              <th className="px-4">Heart Rate</th>
              <th className="px-4">Elevation Gain</th>
            </tr>
          </thead>
          <tbody>
            {details.splits_metric.map((split, ix) => {
              return (
                <tr key={split.split} className={`text-right bg-neutral-700 text-white ${ix % 2 === 0 ? 'sunken-1' : ''}`}>
                  <td>{split.split}</td>
                  <td><DurationDisplay numSeconds={split.elapsed_time} units={['', ':']} /></td>
                  <td>{split.distance} <small>m</small></td>
                  <td>
                    <DurationDisplay
                      numSeconds={Math.floor((1 / (split.distance / 1000)) * split.elapsed_time)} units={['', ':']}
                    />
                  </td>
                  <td className="text-center">{Math.round(split.average_heartrate)} <abbr>bpm</abbr></td>
                  <td>{split.elevation_difference} <small>ft</small></td>
                </tr>
              )}
            )}
          </tbody>
        </table>
      </Surface>
    </div>
  );
};

export default SplitsKm;