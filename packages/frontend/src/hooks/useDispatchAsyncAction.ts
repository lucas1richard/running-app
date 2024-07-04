import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { AsyncAction } from '../types';

const useDispatchAsyncAction = () => {
  const dispatch = useDispatch();

  const asyncActionDispatch = useCallback((action: AsyncAction) => {
    dispatch(action);
  }, [dispatch]);

  return asyncActionDispatch;
};

export default useDispatchAsyncAction;

