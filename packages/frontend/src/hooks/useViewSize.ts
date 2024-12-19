import { createContext, useContext } from 'react';
import type { BreakPoint } from './../DLS/createBreakpoints';

export const ViewSizeContext = createContext<BreakPoint | undefined>(undefined);

/**
 * @returns The view size of the most direct that provides it.
 */
const useViewSize = () => useContext(ViewSizeContext);

export default useViewSize;
