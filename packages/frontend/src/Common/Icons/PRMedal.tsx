import React from 'react';
import { prColors } from '../colors';

type PRMedalProps = {
  className?: string;
  color: 'gold' | 'silver' | 'bronze';
  type: 'native' | 'svg';
};
export const rankMap = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

/**
 * PR refers to "Personal Record"
 */
const PRMedal: React.FC<PRMedalProps> = ({ className = '', color, type }) => 
  type === 'native'
  ? <span className={className}>{rankMap[color]}</span>
  : (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    fill={prColors[color].fill}
    stroke={prColors[color].stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`feather feather-award ${className}`}
  >
    <circle
      cx="12"
      cy="8"
      r="7"
    />
    <polyline
      points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"
    />
  </svg>
);

export default PRMedal;
