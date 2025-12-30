import { type FC, useMemo } from 'react';
import DurationDisplay from '../Common/DurationDisplay';
import { Basic } from '../DLS';
import Surface from '../DLS/Surface';

const rankMap = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
};

const prsMap = {
  1: 'bg-gold-200 text-neutral-900 raised-1 elevation-3',
  2: 'bg-silver-500 text-neutral-100 raised-1 elevation-2',
  3: 'bg-bronze-500 text-neutral-900 raised-1 elevation-1',
  4: 'bg-emerald-300 text-neutral-900 raised-1 elevation-1',
  5: 'bg-emerald-400 text-neutral-900 raised-1 elevation-1',
  6: 'bg-emerald-500 text-neutral-900 raised-1 elevation-1',
  7: 'bg-emerald-600 text-neutral-100 raised-1 elevation-1',
  8: 'bg-emerald-700 text-neutral-100 raised-1 elevation-1',
  9: 'bg-emerald-800 text-neutral-100 raised-1 elevation-1',
  10: 'bg-emerald-900 text-neutral-100 raised-1 elevation-1',
};

type Props = {
  bestEfforts: BestEffort[];
};

const BestEfforts: FC<Props> = ({ bestEfforts }) => {
  const bestEffortsList = useMemo(() => (bestEfforts || []).filter(({ pr_rank }) => pr_rank !== null), [bestEfforts]);

  return (
    <Surface>
      <table>
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
              <td className={`text-center ${prsMap[pr_rank]}`}>{rankMap[pr_rank]}</td>
              <td>{name}</td>
              <td><DurationDisplay numSeconds={elapsed_time} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
};

export default BestEfforts;
