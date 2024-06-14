import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreferenceFree } from '../reducers/preferences';
import {
  setPrefsFreeAct,
  triggerSetActivityPrefs,
  triggerSetUserPrefs,
} from '../reducers/preferences-actions';

const usePreferenceControl = (keyPath, defaultValue) => {
  const dispatch = useDispatch();
  const value = useSelector((state) => selectPreferenceFree(state, keyPath));

  const setValue = useCallback((newValue) => dispatch(setPrefsFreeAct(keyPath, newValue)),
  [dispatch, keyPath]);
  
  const savePreferences = useCallback(({ activityId } = {}) => {
    if (activityId) {
      return dispatch(triggerSetActivityPrefs(activityId));
    };
    dispatch(triggerSetUserPrefs());
  }, [dispatch]);

  return [
    typeof value === 'undefined' ? defaultValue : value,
    setValue,
    savePreferences
  ];
};

export default usePreferenceControl;
