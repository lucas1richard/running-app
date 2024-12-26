import { css } from 'styled-components';
import { makeStyledThemeRule } from './makeStyledCssRule';
import { type Theme } from './../theme';

export interface FontProps {
  fontSize?: keyof Theme['fontSize'];
  lineHeight?: keyof Theme['lineHeight'];
}

const makeFontRule = css<FontProps>`
  ${makeStyledThemeRule('fontSize', 'font-size', 'body')}
  ${makeStyledThemeRule('lineHeight', 'line-height', 'body')}

  /* If fontSize is a header, make it bold */
  ${(props) => new RegExp(/h\d/).test(props.fontSize) ? 'font-weight: bold;' : ''}
`;

export default makeFontRule;
