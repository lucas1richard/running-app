import type { Theme } from './../theme';
import { css } from 'styled-components';
import { type CSS } from 'styled-components/dist/types';
import makeStyledCssRule, { makeStyledThemeRule } from './makeStyledCssRule';
import makeFontRule, { FontProps } from './makeFontRule';

export interface StandardProps extends FontProps {
  margin?: number | CSS.Property.Margin;
  marginT?: number | CSS.Property.MarginTop;
  marginL?: number | CSS.Property.MarginLeft;
  marginR?: number | CSS.Property.MarginRight;
  marginB?: number | CSS.Property.MarginBottom;
  pad?: number | CSS.Property.Padding;
  padT?: number | CSS.Property.PaddingTop;
  padL?: number | CSS.Property.PaddingLeft;
  padR?: number | CSS.Property.PaddingRight;
  padB?: number | CSS.Property.PaddingBottom;
  width?: number | CSS.Property.Width;
  // don't include CSS.Property.Color because name clashes with color prop. Also we want to allow
  // theme colors only
  color?: keyof Theme['color']
  colorBg?: keyof Theme['colorBg'];
  textAlign?: CSS.Property.TextAlign;
}

const standardProps = css<StandardProps>`
  ${makeStyledCssRule('margin', 'margin')}
  ${makeStyledCssRule('marginT', 'margin-top')}
  ${makeStyledCssRule('marginL', 'margin-left')}
  ${makeStyledCssRule('marginR', 'margin-right')}
  ${makeStyledCssRule('marginB', 'margin-bottom')}
  ${makeStyledCssRule('pad', 'padding')}
  ${makeStyledCssRule('padT', 'padding-top')}
  ${makeStyledCssRule('padL', 'padding-left')}
  ${makeStyledCssRule('padR', 'padding-right')}
  ${makeStyledCssRule('padB', 'padding-bottom')}
  ${makeStyledThemeRule('color', 'color', 'black')}
  ${makeStyledThemeRule('colorBg', 'background-color', 'transparent')}
  ${makeStyledCssRule('textAlign', 'text-align')}
  ${makeStyledCssRule('width', 'width')}

  ${makeFontRule}
`;

export default standardProps;
