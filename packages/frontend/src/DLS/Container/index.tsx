import React, { useCallback, useState } from 'react';
import ViewSizeDisplay from '../../Common/ViewSizeDisplay';
import useResizeObserver from '../../hooks/useResizeObserver';
import { ViewSizeContext } from '../../hooks/useViewSize';
import { styledComponentsTheme } from '../theme';
import type { BreakPoint } from '../createBreakpoints';
import styles from './Container.module.scss';

type ContainerProps = {
  children: React.ReactNode;
  showViewSizeDisplay?: boolean;
  providesViewSize?: boolean;
};

const breakpoints = Object.entries<number>(styledComponentsTheme.breakpoints.values) as [BreakPoint, number][];

const Container: React.FC<ContainerProps> = ({
  children,
  showViewSizeDisplay,
  providesViewSize,
}) => {
  const [viewSize, setViewSize] = useState<BreakPoint>('xs');
  const ref = React.useRef<HTMLDivElement>(null);
  const trackSize = useCallback((dims: DOMRectReadOnly) => {
    const [size] = (breakpoints.find(([key, value], ix) => breakpoints[ix + 1]?.[1] >= dims.width) || ['xl']);
    setViewSize(size);
  }, []);

  useResizeObserver(ref, trackSize, { defer: !providesViewSize});

  return (
    <div ref={ref} className={styles.container}>
      {providesViewSize
        ? <ViewSizeContext.Provider value={viewSize}>{children}</ViewSizeContext.Provider>
        : children
      }
      {showViewSizeDisplay && <ViewSizeDisplay />}
    </div>
  );
};

export default Container;
