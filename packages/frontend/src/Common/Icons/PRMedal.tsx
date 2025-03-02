import React from 'react';
import { prColors } from '../colors';

type PRMedalProps = {
  className?: string;
  color: 'gold' | 'silver' | 'bronze' | 'black' | number;
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
const PRMedal: React.FC<PRMedalProps> = ({ className = '', color = 'black', type }) => 
  type === 'native' && !!rankMap[color]
  ? <span className={className}>{rankMap[color]}</span>
  : (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    fill={prColors[color]?.fill || 'transparent'}
    stroke={prColors[color]?.stroke || 'black'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className}`}
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"     />
    <text
      x="12"
      y="9"
      textAnchor="middle"
      dominantBaseline="middle"
      stroke="black"
      fontSize="11"
      fontWeight={100}
    >
      {typeof color === 'number' ? color : color.charAt(0).toUpperCase()}
    </text>
  </svg>
);

export default PRMedal;
