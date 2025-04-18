import React from 'react';
import styled from 'styled-components';
import type { CSS } from 'styled-components/dist/types';
import makeSizeProps, { type SizeProp } from '../utils/makeSizeProps';
import standardProps, { type StandardProps } from '../utils/standardProps';

const Grid = styled.div<GridProps>`
  display: grid;

  ${standardProps}
  
  ${makeSizeProps([
    ['$templateColumns', 'grid-template-columns'],
    ['$templateAreas', 'grid-template-areas'],
    ['$templateRows', 'grid-template-rows'],
    ['$colGap', 'column-gap'],
    ['$rowGap', 'row-gap'],
    ['$gap', 'gap'],
    ['$gridAutoRows', 'grid-auto-rows'],
  ])}
`;

interface GridProps extends SizeProp<'$templateColumns', CSS.Property.GridTemplateColumns>,
  SizeProp<'$templateAreas', CSS.Property.GridTemplateAreas>,
  SizeProp<'$colGap', CSS.Property.ColumnGap>,
  SizeProp<'$rowGap', CSS.Property.RowGap>,
  SizeProp<'$gap', number | CSS.Property.Gap>,
  SizeProp<'$gridAutoRows', number | CSS.Property.GridAutoRows>,
  SizeProp<'$templateRows', number | CSS.Property.GridTemplateRows>,
  StandardProps
  {
    className?: string;
    children?: React.ReactNode;
  };

export default Grid;
