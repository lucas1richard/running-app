import DurationDisplay from '@/Common/DurationDisplay';
import styles from '@/Detail/BestEfforts.module.scss';
import { type FC, useMemo } from 'react';

const rankMap = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
  8: '8th',
  9: '9th',
  10: '10th',
};

const prsMap = {
  1: 'bg-gold-300 text-gold-900 raised-1',
  2: 'bg-silver-300 text-silver-900 raised-1',
  3: 'bg-bronze-500 text-bronze-900 raised-1',
  4: 'bg-emerald-300 text-black raised-1',
  5: 'bg-emerald-400 text-black raised-1',
  6: 'bg-emerald-500 text-black raised-1',
  7: 'bg-emerald-600 text-white raised-1',
  8: 'bg-emerald-700 text-white raised-1',
  9: 'bg-emerald-800 text-white raised-1',
  10: 'bg-emerald-900 text-white raised-1',
};

type Props = {
  bestEfforts: BestEffort[];
};

const BestEfforts: FC<Props> = ({ bestEfforts }) => {
  const bestEffortsList = useMemo(() => (
    bestEfforts || [])
    .filter(({ pr_rank }) => pr_rank !== null)
    .sort((a, b) => a.distance - b.distance),
    [bestEfforts]
  );

  return (
    <div className="mt-4 card">
      <div className="flex flex-wrap gap-4 mt-4">
        {bestEffortsList.map(({ pr_rank, name, elapsed_time }) => (
          <div
            key={name}
            className={[
              `shine-button rounded-full square flex flex-col justify-center p-4`,
              styles['width-150'],
              prsMap[pr_rank],
            ].join(' ')}
          >
            <div className={`text-center text-h5`}>{rankMap[pr_rank]}</div>
            <div className="text-center text-h4">{name}</div>
            <div className="text-center"><DurationDisplay numSeconds={elapsed_time} units={['', ':', ':']} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestEfforts;
