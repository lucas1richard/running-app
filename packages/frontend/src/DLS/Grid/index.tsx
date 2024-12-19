import React from 'react';
import styled from 'styled-components';
import makeSizeProps, { SizeProp } from '../utils/makeSizeProps';

const Grid = styled.div<GridProps>`
  display: grid;

  ${makeSizeProps([
    ['templateColumns', 'grid-template-columns'],
    ['templateAreas', 'grid-template-areas'],
    ['colGap', 'column-gap'],
    ['rowGap', 'row-gap'],
    ['gap', 'gap'],
  ])}
`;

interface GridProps extends SizeProp<'templateColumns', string>,
  SizeProp<'templateAreas', string>,
  SizeProp<'colGap', string>,
  SizeProp<'rowGap', string>,
  SizeProp<'gap', string>
  {
    className?: string;
    children?: React.ReactNode;
  };

export default Grid;
