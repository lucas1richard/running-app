import { createContext, useContext } from 'react';
import { keys, type BreakPoint } from './../DLS/createBreakpoints';

class ViewSize {
  viewSizeStr: BreakPoint | undefined;
  constructor(viewSizeStr?: BreakPoint) {
    this.viewSizeStr = viewSizeStr;
  }
  toString() {
    return this.viewSizeStr;
  }
  lte(comparisonStr: BreakPoint) {
    return keys.indexOf(this.viewSizeStr) <= keys.indexOf(comparisonStr);
  }
  lt(comparisonStr: BreakPoint) {
    return keys.indexOf(this.viewSizeStr) < keys.indexOf(comparisonStr);
  }
  gte(comparisonStr: BreakPoint) {
    return keys.indexOf(this.viewSizeStr) >= keys.indexOf(comparisonStr);
  }
  gt(comparisonStr: BreakPoint) {
    return keys.indexOf(this.viewSizeStr) > keys.indexOf(comparisonStr);
  }
  eq(comparisonStr: BreakPoint) {
    return this.viewSizeStr === comparisonStr;
  }
}

export const viewSizeMap = Object.fromEntries(keys.map((key) => [key, new ViewSize(key)]));
export const undefinedViewSize = new ViewSize();

export const ViewSizeContext = createContext<BreakPoint | undefined>(undefined);

/**
 * @returns The view size of the most direct that provides it.
 */
const useViewSize = () => {
  const viewSizeStr = useContext(ViewSizeContext);
  return viewSizeMap[viewSizeStr] || undefinedViewSize;
};

export default useViewSize;
