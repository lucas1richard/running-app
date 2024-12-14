import React from 'react';
import styled from 'styled-components';
import makeStyledCssRule from './utils/makeStyledCssRule';

const gridTemplateColumns = makeStyledCssRule('templateColumns', 'grid-template-columns');
const gridTemplateColumnsXl = makeStyledCssRule('templateColumnsXl', 'grid-template-columns');
const gridTemplateColumnsLg = makeStyledCssRule('templateColumnsLg', 'grid-template-columns');
const gridTemplateColumnsMd = makeStyledCssRule('templateColumnsMd', 'grid-template-columns');
const gridTemplateColumnsSm = makeStyledCssRule('templateColumnsSm', 'grid-template-columns');

const gridTemplateAreas = makeStyledCssRule('templateAreas', 'grid-template-Areas');
const gridTemplateAreasXl = makeStyledCssRule('templateAreasXl', 'grid-template-Areas');
const gridTemplateAreasLg = makeStyledCssRule('templateAreasLg', 'grid-template-Areas');
const gridTemplateAreasMd = makeStyledCssRule('templateAreasMd', 'grid-template-Areas');
const gridTemplateAreasSm = makeStyledCssRule('templateAreasSm', 'grid-template-Areas');

const gridColGap = makeStyledCssRule('colGap', 'column-gap');
const gridColGapXl = makeStyledCssRule('colGapXl', 'column-gap');
const gridColGapLg = makeStyledCssRule('colGapLg', 'column-gap');
const gridColGapMd = makeStyledCssRule('colGapMd', 'column-gap');
const gridColGapSm = makeStyledCssRule('colGapSm', 'column-gap');

const gridRowGap = makeStyledCssRule('rowGap', 'row-gap');
const gridRowGapXl = makeStyledCssRule('rowGapXl', 'row-gap');
const gridRowGapLg = makeStyledCssRule('rowGapLg', 'row-gap');
const gridRowGapMd = makeStyledCssRule('rowGapMd', 'row-gap');
const gridRowGapSm = makeStyledCssRule('rowGapSm', 'row-gap');

const gridGap = makeStyledCssRule('gap', 'gap');
const gridGapXl = makeStyledCssRule('gapXl', 'gap');
const gridGapLg = makeStyledCssRule('gapLg', 'gap');
const gridGapMd = makeStyledCssRule('gapMd', 'gap');
const gridGapSm = makeStyledCssRule('gapSm', 'gap');

const Grid = styled.div<GridProps>`
  display: grid;
  ${gridTemplateColumns}
  ${gridTemplateAreas}
  ${gridColGap}
  ${gridRowGap}
  ${gridGap}

  ${({ theme }) => theme.breakpoints.down('md')} {
    ${gridTemplateColumnsSm}
    ${gridTemplateAreasSm}
    ${gridRowGapSm}
    ${gridColGapSm}
    ${gridGapSm}
  }

  ${({ theme }) => theme.breakpoints.between('md', 'lg')} {
    ${gridTemplateColumnsMd}
    ${gridTemplateAreasMd}
    ${gridRowGapMd}
    ${gridColGapMd}
    ${gridGapMd}
  }

  ${({ theme }) => theme.breakpoints.between('lg', 'xl')} {
    ${gridTemplateColumnsLg}
    ${gridTemplateAreasLg}
    ${gridRowGapLg}
    ${gridColGapLg}
    ${gridGapLg}
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    ${gridTemplateColumnsXl}
    ${gridTemplateAreasXl}
    ${gridRowGapXl}
    ${gridColGapXl}
    ${gridGapXl}
  }
`;

type GridProps = {
  templateColumns?: string;
  templateColumnsXl?: string;
  templateColumnsLg?: string;
  templateColumnsMd?: string;
  templateColumnsSm?: string;

  templateAreas?: string;
  templateAreasXl?: string;
  templateAreasLg?: string;
  templateAreasMd?: string;
  templateAreasSm?: string;

  colGap?: string;
  colGapXl?: string;
  colGapLg?: string;
  colGapMd?: string;
  colGapSm?: string;

  rowGap?: string;
  rowGapXl?: string;
  rowGapLg?: string;
  rowGapMd?: string;
  rowGapSm?: string;

  gap?: string;
  gapXl?: string;
  gapLg?: string;
  gapMd?: string;
  gapSm?: string;
  className?: string;
  children?: React.ReactNode;
};

export default Grid;
