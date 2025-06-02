import { keys, type BreakPoint } from './../DLS/createBreakpoints';
import { computed, inject, ref, toValue, watch } from 'vue';

class ViewSize {
  viewSizeStr: BreakPoint;

  constructor(viewSizeStr: BreakPoint = 'md') {
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

/**
 * @returns The view size of the most direct (usually) Container that provides it.
 */
const useViewSize = () => {
  const viewSizeStr = inject<BreakPoint>('viewSize', 'md');
  return computed(() => viewSizeMap[toValue(viewSizeStr)]);
};

export default useViewSize;
