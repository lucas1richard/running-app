import styled from 'styled-components';

type GridAreaProps = {
  area: string;
};

const GridArea = styled.div<GridAreaProps>`
  grid-area: ${(props) => props.area};
`;

export default GridArea;
