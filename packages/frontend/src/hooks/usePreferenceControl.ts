import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import fastDeepEqual from 'fast-deep-equal';
import { type PreferencesKeyPath, selectPreferenceFree } from '../reducers/preferences';
import {
  setPrefsFreeAct,
  triggerSetActivityPrefs,
  triggerSetUserPrefs,
} from '../reducers/preferences-actions';
import useDispatchAsyncAction from './useDispatchAsyncAction';
import { useAppSelector } from './redux';

const usePreferenceControl = (
  keyPath: PreferencesKeyPath,
  defaultValue?: any
) => {
  const dispatch = useDispatch();
  const dispatchAsync = useDispatchAsyncAction();
  const value = useAppSelector((state) => selectPreferenceFree(state, keyPath), fastDeepEqual);

  const setValue = useCallback(
    (newValue: any) => dispatch(setPrefsFreeAct(keyPath, newValue)),
    [dispatch, keyPath]
  );

  const savePreferences = useCallback(({ activityId }: any & { activityId: number } = {}) => {
    if (activityId) {
      return dispatchAsync(triggerSetActivityPrefs(activityId));
    };
    dispatchAsync(triggerSetUserPrefs());
  }, [dispatchAsync]);

  return [
    typeof value === 'undefined' ? defaultValue : value,
    setValue,
    savePreferences
  ];
};

export default usePreferenceControl;

