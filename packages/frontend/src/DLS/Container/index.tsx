import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import ViewSizeDisplay from '../../Common/ViewSizeDisplay';
import useResizeObserver from '../../hooks/useResizeObserver';
import { styledComponentsTheme } from '../theme';
import { ViewSizeContext } from '../../hooks/useViewSize';
import { BreakPoint } from '../createBreakpoints';

const ContainerDiv = styled.div`
  container-type: inline-size;
  position: relative;
`;

type ContainerProps = {
  children: React.ReactNode;
  showViewSizeDisplay?: boolean;
  providesViewSize?: boolean;
};

const breakpoints = Object.entries<number>(styledComponentsTheme.breakpoints.values) as [BreakPoint, number][];

const Container: React.FC<ContainerProps> = ({ children, showViewSizeDisplay, providesViewSize }) => {
  const [viewSize, setViewSize] = useState<BreakPoint>('xs');
  const ref = React.useRef<HTMLDivElement>(null);
  const trackSize = useCallback((dims: DOMRectReadOnly) => {
    const [size] = (breakpoints.find(([key, value], ix) => breakpoints[ix + 1]?.[1] >= dims.width) || ['xl']);
    setViewSize(size);
  }, []);

  useResizeObserver(ref, trackSize, { defer: !providesViewSize});

  return (
    <ContainerDiv ref={ref}>
      {providesViewSize
        ? <ViewSizeContext.Provider value={viewSize}>{children}</ViewSizeContext.Provider>
        : children
      }
      {showViewSizeDisplay && <ViewSizeDisplay />}
    </ContainerDiv>
  );
};

export default Container;
