import { css } from 'styled-components';
import { type CSS } from 'styled-components/dist/types';
import makeStyledCssRule from './makeStyledCssRule';
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
  ${makeStyledCssRule('textAlign', 'text-align')}
  ${makeStyledCssRule('width', 'width')}

  ${makeFontRule}
`;

export default standardProps;
