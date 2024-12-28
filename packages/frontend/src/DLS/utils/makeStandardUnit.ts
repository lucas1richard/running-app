const makeStandardUnit = (value: number, unitSize = 1, unitText = 'rem') => {
  return `${value * unitSize}${unitText}`;
}

export default makeStandardUnit;
