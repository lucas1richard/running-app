import styled from 'styled-components';
import standardProps, { type StandardProps } from '../utils/standardProps';

interface GridAreaProps extends StandardProps {
  area: string;
};

const GridArea = styled.div<GridAreaProps>`
  grid-area: ${(props) => props.area};

  ${standardProps}
`;

export default GridArea;
