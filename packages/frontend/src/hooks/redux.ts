import fastDeepEqual from 'fast-deep-equal';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { Dispatch } from 'redux';
import type { RootState } from '../reducers';

export const useAppDispatch: () => Dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = (getter, eqFn) => useSelector(getter);
