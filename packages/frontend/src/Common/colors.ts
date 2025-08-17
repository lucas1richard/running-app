import themeColors from '../assets/theme.module.scss';

export const colors = themeColors as unknown as Record<string, string>;

export const prColors = {
  gold: {
    fill: 'rgba(255, 215, 0, 0.9)',
    stroke: 'rgba(205, 165, 0, 1)',
  },
  silver: {
    fill: 'rgba(192, 192, 192, 0.9)',
    stroke: 'rgba(142, 142, 142, 1)',
  },
  bronze: {
    fill: 'rgba(205, 127, 50, 0.9)',
    stroke: 'rgba(155, 77, 0, 1)',
  },
  black: {
    fill: 'rgba(0,0,0,0.9)',
    stroke: 'rgba(0,0,0,1)'
  },
  undefined: {
    fill: 'rgba(0,0,0,0.9)',
    stroke: 'rgba(0,0,0,1)'
  }
};
