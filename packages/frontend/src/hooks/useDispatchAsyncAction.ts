import type { AsyncAction } from '@/types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const useDispatchAsyncAction = () => {
 const dispatch = useDispatch();

  const asyncActionDispatch = useCallback((action: AsyncAction) => {
    dispatch(action);
  }, [dispatch]);

  return asyncActionDispatch;
};

export default useDispatchAsyncAction;

