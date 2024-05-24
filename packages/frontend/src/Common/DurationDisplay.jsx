import React from 'react';
import { getDuration } from '../utils';

/**
 * 
 * @param {Object} param0
 * @param {number} param0.numSeconds
 * @param {string[]} param0.units [seconds, minutes, hours]
 * @returns 
 */
const DurationDisplay = ({ numSeconds, units }) => (
  getDuration(numSeconds, units).map(([num, str]) => (
    <span key={str}>
      <span>{num}</span>
      <small style={{ fontSize: '0.9rem'}}>{str}</small>
    </span>
  ))
);

export default DurationDisplay;
