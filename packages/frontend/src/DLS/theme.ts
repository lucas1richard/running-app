import type { DefaultTheme } from 'styled-components';
import createBreakpoints from './createBreakpoints';

export const styledComponentsTheme: DefaultTheme = {
  breakpoints: createBreakpoints(),
};
