import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPreferenceFree } from '../reducers/preferences';

const usePreferenceControl = (keyPath, defaultValue) => {
  const dispatch = useDispatch();
  const value = useSelector((state) => selectPreferenceFree(state, keyPath));

  const setValue = useCallback((newValue) => dispatch({
    type: 'preferencesReducer/SET_PREFERENCE_FREE',
    payload: { keyPath: keyPath, value: newValue },
  }),
  [dispatch, keyPath]);
  
  const savePreferences = useCallback(({ activityId } = {}) => {
    if (activityId) {
      return dispatch({ type: 'preferences/SET_ACTIVITY_PREFERENCES', payload: { activityId } });
    };
    dispatch({ type: 'preferences/SET_USER_PREFERENCES' });
  }, [dispatch]);

  return [value || defaultValue, setValue, savePreferences];
};

export default usePreferenceControl;
