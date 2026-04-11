import type { RootState } from '@/reducers';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from 'redux';

export const useAppDispatch: () => Dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = (getter, eqFn) => useSelector(getter);
