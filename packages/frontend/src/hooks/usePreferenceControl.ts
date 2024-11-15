import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fastDeepEqual from 'fast-deep-equal';
import { selectPreferenceFree } from '../reducers/preferences';
import {
  setPrefsFreeAct,
  triggerSetActivityPrefs,
  triggerSetUserPrefs,
} from '../reducers/preferences-actions';
import useDispatchAsyncAction from './useDispatchAsyncAction';

const usePreferenceControl = (
  keyPath: [string, string, ...string[]],
  defaultValue: any
) => {
  const dispatch = useDispatch();
  const dispatchAsync = useDispatchAsyncAction();
  const value = useSelector((state) => selectPreferenceFree(state, keyPath), fastDeepEqual);

  const setValue = useCallback(
    (newValue: any) => dispatch(setPrefsFreeAct(keyPath, newValue)),
    [dispatch, keyPath]
  );

  const savePreferences = useCallback(({ activityId }: any & { activityId: string } = {}) => {
    if (activityId) {
      return dispatchAsync(triggerSetActivityPrefs(activityId));
    };
    dispatchAsync(triggerSetUserPrefs());
  }, [dispatch]);

  return [
    typeof value === 'undefined' ? defaultValue : value,
    setValue,
    savePreferences
  ];
};

export default usePreferenceControl;

