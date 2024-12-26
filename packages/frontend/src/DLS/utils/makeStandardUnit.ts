const unitSize = 1;
const unitText = 'rem';

const makeStandardUnit = (value: number) => {
  return `${value * unitSize}${unitText}`;
}

export default makeStandardUnit;
