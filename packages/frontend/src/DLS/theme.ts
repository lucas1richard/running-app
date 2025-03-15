import createBreakpoints from './createBreakpoints';

export const styledComponentsTheme = {
  breakpoints: createBreakpoints(),
  standardUnit: [1, 'rem'] as const,
  getStandardUnit: (value: number) => `${value * styledComponentsTheme.standardUnit[0]}${styledComponentsTheme.standardUnit[1]}`,
  $fontSize: {
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
  $fontFamily: {
    body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
    heading: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
    monospace: 'monospace',
  },
  $lineHeight: {
    body: 1.5,
    heading: 1.25,
  },
  $colorBg: {
    hrZone1: 'rgba(0, 132, 255, 0.2)',
    hrZone2: 'rgba(0,255,0,0.2)',
    hrZone3: 'rgba(255, 251, 0, 0.1)',
    hrZone4: 'rgba(255, 115, 0, 0.1)',
    hrZone5: 'rgba(255,0,0,0.2)',
    hrZone1Strong: 'rgba(0, 132, 255, 0.5)',
    hrZone2Strong: 'rgba(0,255,0,0.5)',
    hrZone3Strong: 'rgba(255, 251, 0, 0.5)',
    hrZone4Strong: 'rgba(255, 115, 0, 0.5)',
    hrZone5Strong: 'rgba(255,0,0,0.5)',
    gold: 'rgb(255, 215, 0)',
    silver: 'rgb(192, 192, 192)',
    bronze: 'rgb(205, 127, 50)',
    white: 'rgb(255, 255, 255)',
  },
  $color: {
    hrZone1: 'rgba(0, 132, 255, 1)',
    hrZone2: 'rgba(0,255,0,1)',
    hrZone3: 'rgba(255, 251, 0, 1)',
    hrZone4: 'rgba(255, 115, 0, 1)',
    hrZone5: 'rgba(255,0,0,1)',
    gold: 'rgb(255, 215, 0)',
    darkGold: 'rgb(184, 134, 11)',
    silver: 'rgb(142, 142, 142)',
    bronze: 'rgb(155, 77, 0)',
  }
};

export type Theme = typeof styledComponentsTheme;
