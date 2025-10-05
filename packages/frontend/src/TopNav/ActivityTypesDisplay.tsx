import { useDispatch, useSelector } from 'react-redux';
import { MultiSelect } from '../DLS/MultiSelect';
import { selectActivitiesDisplayTypes } from '../reducers/activities';
import { setActivitiesDisplayTypesAct } from '../reducers/activities-actions';
import { setGlobalPrefsAct, triggerSetUserPrefs } from '../reducers/preferences-actions';

const ActivityTypesDisplay = () => {
  const types = useSelector(selectActivitiesDisplayTypes);
  const dispatch = useDispatch();

  const updateSelectedTypes = (selected: string[]) => {
    const displayTypes = {
      ...Object.keys(types).reduce((acc, type) => ({ ...acc, [type]: false }), {}),
      ...selected.reduce((acc, type) => ({ ...acc, [type]: true }), {}),
    };
    dispatch(setActivitiesDisplayTypesAct(displayTypes));
    dispatch(setGlobalPrefsAct({
      activityDisplayTypes: displayTypes,
    }));
    dispatch(triggerSetUserPrefs({
      activityDispayTypes: displayTypes,
    }));
  };

  return (
    <div>
      <h2>Activity Types</h2>
      <MultiSelect
        options={Object.keys(types).map((displayType) => ({ value: displayType, label: displayType }))}
        selectedValues={Object.keys(types).filter(type => types[type])}
        onChange={updateSelectedTypes}
      />
    </div>
  );
};

export default ActivityTypesDisplay;
