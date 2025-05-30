import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import DurationDisplay from '../Common/DurationDisplay';
import { useAppSelector } from '../hooks/redux';
import { selectActivity } from '../reducers/activities';
import { Basic, Card } from '../DLS';
import propSelector from '../utils/propSelector';



const PRDateCard = ({ pr }) => {
  const activity = useAppSelector(state => selectActivity(state, pr.activityId));
  let colorBg: 'white' | 'gold' | 'silver' | 'bronze' = 'white';
  if (pr.pr_rank === 1) colorBg = 'gold';
  if (pr.pr_rank === 2) colorBg = 'silver';
  if (pr.pr_rank === 3) colorBg = 'bronze';

  return (
    <Card key={pr.id} $textAlign="center" $flexShrink="0" $flexGrow="1" $colorBg={colorBg}>
      <Basic.Div $fontSize="h3">
        <DurationDisplay numSeconds={pr.elapsed_time} />
      </Basic.Div>
      <Basic.Div $fontSize="h6" $marginT={1}>
        {dayjs(pr.start_date_local).format('MMMM DD, YYYY')}
      </Basic.Div>
      <Basic.Div $fontSize="h5" $marginT={1}>
        {activity?.name}
      </Basic.Div>
      <div>
        <Link className="heading-5 btn" to={`/${pr.activityId}/detail`}>
          View Activity
        </Link>
      </div>
    </Card>
  );
};

export default PRDateCard;
