import { type FC, useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';

const rankMap = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

type Props = {
  bestEfforts: BestEffort[];
};

const BestEfforts: FC<Props> = ({ bestEfforts }) => {
  const bestEffortsList = useMemo(() => bestEfforts.filter(({ pr_rank }) => pr_rank !== null), [bestEfforts]);

  return (
    <div>
      <table className="dls-white-bg">
        <thead>
          <tr>
            <th colSpan={3}>Best Efforts</th>
          </tr>
          <tr>
            <th>Rank</th>
            <th>Distance</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {bestEffortsList.length === 0 && (
            <tr>
              <td colSpan={3}>None</td>
            </tr>
          )}
          {bestEffortsList.map(({ pr_rank, name, elapsed_time }) => (
            <tr key={name}>
              <td>{pr_rank} {rankMap[pr_rank]}</td>
              <td>{name}</td>
              <td><DurationDisplay numSeconds={elapsed_time}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BestEfforts;
