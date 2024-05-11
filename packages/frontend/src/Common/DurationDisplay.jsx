import React from 'react';
import { getDuration } from '../utils';

const DurationDisplay = ({ numSeconds }) => (
  getDuration(numSeconds).map(([num, str]) => <span key={str}><span>{num}</span>&nbsp;<span style={{ fontSize: '0.9rem'}}>{str}</span> </span>)
);

export default DurationDisplay;
