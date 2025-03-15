import { css } from 'styled-components';
import { type CSS } from 'styled-components/dist/types';
import type { Theme } from './../theme';
import makeStyledCssRule, { makeStyledThemeRule } from './makeStyledCssRule';
import makeFontRule, { FontProps } from './makeFontRule';
import makeSizeProps, { SizeProp } from './makeSizeProps';

export interface StandardProps extends FontProps
  , SizeProp<'$textAlign', CSS.Property.TextAlign>
  , SizeProp<'$direction', CSS.Property.FlexDirection>
  , SizeProp<'$alignItems', CSS.Property.AlignItems>
  , SizeProp<'$flexJustify', CSS.Property.JustifyContent>
  , SizeProp<'$wrap', CSS.Property.FlexWrap>
  , SizeProp<'$gap', number | CSS.Property.Gap>
  , SizeProp<'$margin', number | CSS.Property.Margin>
  , SizeProp<'$width', number | CSS.Property.Width> {
  $gridArea?: CSS.Property.GridArea;
  $gap?: number | CSS.Property.Gap;
  $wrap?: CSS.Property.FlexWrap;
  $border?: CSS.Property.Border;
  $borderT?: CSS.Property.BorderTop;
  $borderB?: CSS.Property.BorderBottom;
  $borderL?: CSS.Property.BorderLeft;
  $borderR?: CSS.Property.BorderRight;
  $display?: CSS.Property.Display;
  $borderRadius?: number | CSS.Property.BorderRadius;
  $marginT?: number | CSS.Property.MarginTop;
  $marginL?: number | CSS.Property.MarginLeft;
  $marginR?: number | CSS.Property.MarginRight;
  $marginB?: number | CSS.Property.MarginBottom;
  $pad?: number | CSS.Property.Padding;
  $padT?: number | CSS.Property.PaddingTop;
  $padL?: number | CSS.Property.PaddingLeft;
  $padR?: number | CSS.Property.PaddingRight;
  $padB?: number | CSS.Property.PaddingBottom;
  $maxWidth?: number | CSS.Property.MaxWidth;
  $height?: number | CSS.Property.Height;
  $maxHeight?: number | CSS.Property.MaxHeight;
  // don't include CSS.Property.Color because name clashes with color prop. Also we want to allow
  // theme colors only
  $color?: keyof Theme['$color']
  $colorBg?: keyof Theme['$colorBg'];
  $overflowX?: CSS.Property.OverflowX;
  $overflowY?: CSS.Property.OverflowY;
  $overflow?: CSS.Property.Overflow;
  $flexGrow?: CSS.Property.FlexGrow;
  $flexShrink?: CSS.Property.FlexShrink;
}

const standardProps = css<StandardProps>`
  ${makeStyledCssRule('$margin', 'margin')}
  ${makeStyledCssRule('$marginT', 'margin-top')}
  ${makeStyledCssRule('$marginL', 'margin-left')}
  ${makeStyledCssRule('$marginR', 'margin-right')}
  ${makeStyledCssRule('$marginB', 'margin-bottom')}
  ${makeStyledCssRule('$pad', 'padding')}
  ${makeStyledCssRule('$padT', 'padding-top')}
  ${makeStyledCssRule('$padL', 'padding-left')}
  ${makeStyledCssRule('$padR', 'padding-right')}
  ${makeStyledCssRule('$padB', 'padding-bottom')}
  ${makeStyledThemeRule('$color', 'color', 'black')}
  ${makeStyledThemeRule('$colorBg', 'background-color', 'transparent')}
  ${makeStyledCssRule('$width', 'width')}
  ${makeStyledCssRule('$height', 'height')}
  ${makeStyledCssRule('$maxHeight', 'max-height')}
  ${makeStyledCssRule('$maxWidth', 'max-width')}
  ${makeStyledCssRule('$overflow', 'overflow')}
  ${makeStyledCssRule('$overflowX', 'overflow-x')}
  ${makeStyledCssRule('$overflowY', 'overflow-y')}
  ${makeStyledCssRule('$flexGrow', 'flex-grow')}
  ${makeStyledCssRule('$flexShrink', 'flex-shrink')}
  ${makeStyledCssRule('$borderRadius', 'border-radius')}
  ${makeStyledCssRule('$border', 'border')}
  ${makeStyledCssRule('$borderB', 'border-bottom')}
  ${makeStyledCssRule('$borderT', 'border-top')}
  ${makeStyledCssRule('$borderL', 'border-left')}
  ${makeStyledCssRule('$borderR', 'border-right')}
  ${makeStyledCssRule('$display', 'display')}
  ${makeStyledCssRule('$gridArea', 'grid-area')}
  ${makeStyledCssRule('$gap', 'gap')}
  ${makeStyledCssRule('$wrap', 'flex-wrap')}

  ${makeSizeProps([
  ['$margin', 'margin'],
  ['$width', 'width'],
  ['$textAlign', 'text-align'],
  ['$flexDirection', 'flex-direction'],
  ['$alignItems', 'align-items'],
  ['$flexJustify', 'justify-content'],
  ['$wrap', 'flex-wrap'],
  ['$gap', 'gap'],
])}

  ${makeFontRule}
`;

export default standardProps;
