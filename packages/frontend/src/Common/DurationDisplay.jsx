import React from 'react';
import { getDuration } from '../utils';

/**
 * 
 * @param {Object} param0
 * @param {number} param0.numSeconds
 * @param {string[]} [param0.units] [seconds, minutes, hours]
 * @returns 
 */
const DurationDisplay = ({ numSeconds, units }) => (
  <>
    {numSeconds < 0 && <span>-</span>}
    {getDuration(Math.abs(numSeconds), units).map(([num, str], ix) => (
      <span key={`${str}${ix}`}>
        <span>{num}</span>
        <small>{str}</small>
      </span>
    ))}
  </>
);

export default DurationDisplay;
