import dayjs from 'dayjs';
import { selectPRsByDate } from '../reducers/prs';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { Basic } from '../DLS';
import { useMemo } from 'react';
import { getDurationString } from '../utils';
import Surface from '../DLS/Surface';
import PRCalendarChart from './PRCalendarChart';
import './personalrecords.module.scss';

const prsMap = {
  1: 'shine-button transition-all-2s bg-gold-200 hover:bg-gold-300 text-gold-900 raised-1',
  2: 'shine-button transition-all-2s bg-silver-200 hover:bg-silver-300 text-silver-900 raised-1',
  3: 'shine-button transition-all-2s bg-bronze-500 hover:bg-bronze-400 text-bronze-900 raised-1',
  4: 'bg-emerald-300 hover:bg-emerald-400 text-black raised-1',
  5: 'bg-emerald-400 hover:bg-emerald-500 text-black raised-1',
  6: 'bg-emerald-500 hover:bg-emerald-600 text-black raised-1',
  7: 'bg-emerald-600 hover:bg-emerald-700 text-white raised-1',
  8: 'bg-emerald-700 hover:bg-emerald-800 text-white raised-1',
  9: 'bg-emerald-800 hover:bg-emerald-900 text-white raised-1',
  10: 'bg-emerald-900 hover:bg-emerald-800 text-white raised-1',
};

const PRs = () => {
  const navigate = useNavigate();
  const prsByDate = useAppSelector(selectPRsByDate);
  const names = useMemo(() => Object.keys(prsByDate), [prsByDate]);

  return (
    <Basic.Div $marginMdUp={2} $marginSm={1}>
      <div className="mt-4">
        <h2>PRs By Date</h2>
        <span>Most recent &rarr; least recent</span>
        <div className="mt-2">
          <PRCalendarChart records={prsByDate} />
        </div>
        <div className="mt-2">
          <Basic.Div $marginT={1} $display="flex" $directionMdDown="column" $directionLgUp="row" $gap={1}>
            {names.map((name) => name.startsWith('100') ? null : (
              <div key={name} className="full-width">
                <Basic.Div
                  $fontSize="h2"
                  $textAlign="center"
                  $position="sticky"
                  $top="0"
                >
                  <Surface>
                    {name}
                  </Surface>
                </Basic.Div>
                <table className="bg-foreground w-full elevation-1" key={name}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Rank</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prsByDate[name].map((pr, ix) => {
                      let colorBg: 'white' | 'gold' | 'silver' | 'bronze' = 'white';
                      if (pr.pr_rank === 1) colorBg = 'gold';
                      if (pr.pr_rank === 2) colorBg = 'silver';
                      if (pr.pr_rank === 3) colorBg = 'bronze';
                      return (
                      <tr
                        role="button"
                        key={pr.start_date_local}
                        className={prsMap[pr.pr_rank as keyof typeof prsMap]}
                        onClick={() => navigate(`/${pr.activityId}/detail`)}
                      >
                        <td>
                          {dayjs(pr.start_date_local).format('DD MMM YYYY')}
                        </td>
                        <td className="text-center">
                          {pr.pr_rank}
                        </td>
                        <td>
                          {getDurationString(pr.elapsed_time, ['s', 'm ', 'h '])}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            ))}
          </Basic.Div>
        </div>
      </div>
    </Basic.Div>
  );
};

export default PRs;
