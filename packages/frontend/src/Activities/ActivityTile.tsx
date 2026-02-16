import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useGetApiStatus } from '../reducers/apiStatus';
import { TRIGGER_UPDATE_ACTIVITY, triggerUpdateActivity } from '../reducers/activitydetail-actions';
import Spinner from '../Loading/Spinner';
import Tile from './Tile';
import useViewSize from '../hooks/useViewSize';
import { useAppSelector } from '../hooks/redux';
import { selectActivity } from '../reducers/activities';
import { ReactComponent as SunnySnowingSvg } from '../assets/sunny-snowing.svg';
import { ReactComponent as HumidityPercentSvg } from '../assets/humudity-percent.svg';
import { ReactComponent as ThermometerSvg } from '../assets/thermometer.svg';

type ActivityTileProps = {
  activity: Activity;
  backgroundIndicator: string;
  showHideFunction: boolean;
};

const ActivityTile: React.FC<ActivityTileProps> = ({
  activity: { id, hidden = false },
  backgroundIndicator,
  showHideFunction,
}) => {
  const activity = useAppSelector((state) => selectActivity(state, id));
  const dispatch = useDispatch();
  const isLoading = useGetApiStatus(`${TRIGGER_UPDATE_ACTIVITY}-${id}`) === 'loading';
  const hideActivity = useCallback(() => {
    dispatch(triggerUpdateActivity({ id: id, hidden: !hidden }));
  }, [hidden, id, dispatch]);
  const viewSize = useViewSize();

  return activity ? (
    <div key={activity.id}>
      <Tile
        isCompact={viewSize.lte('sm')}
        activity={activity}
        backgroundIndicator={backgroundIndicator}
      >
        {activity.hourly_weather?.length > 0 && (
          <div>
            <div className="flex gap-2">
              <span className="sunken-1 py-1 px-2 flex-inline align-center">
                <SunnySnowingSvg />&nbsp;{activity.weather.overview}
              </span>
              <span className="sunken-1 py-1 px-2 flex-inline align-center">
                <ThermometerSvg /> {activity.weather.temperature_2m_f}°F
              </span>
              <span className="sunken-1 py-1 px-2 flex-inline align-center">
                <HumidityPercentSvg />&nbsp;{activity.weather.relative_humidity_2m}%
                </span>
            </div>
          </div>
        )}
      </Tile>

      {showHideFunction && (
        <div className="text-right">
          {isLoading
            ? <Spinner />
            : (
            <label htmlFor={`${activity.id}-hider`}>
              Hide Activity&nbsp;
              <input
                id={`${activity.id}-hider`}
                type="checkbox"
                checked={activity.hidden}
                onChange={hideActivity}
              />
            </label>
            )}
        </div>
      )}
    </div>
  ) : null;
};

export default ActivityTile;
