import createBreakpoints from './createBreakpoints';

export const styledComponentsTheme = {
  breakpoints: createBreakpoints(),
  fontSize: {
    body: '1rem',
    h1: '2rem',
    h2: '1.8rem',
    h3: '1.6rem',
    h4: '1.4rem',
    h5: '1.2rem',
    h6: '1rem',
    sm: '0.8rem',
    xs: '0.6rem',
    xxs: '0.4rem',
  },
  fontFamily: {
    body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
    heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
    monospace: 'monospace',
  },
  lineHeight: {
    body: 1.5,
    heading: 1.25,
  },
};

export type Theme = typeof styledComponentsTheme;
