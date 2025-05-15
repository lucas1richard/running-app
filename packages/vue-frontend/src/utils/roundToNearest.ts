const roundToNearest = (value: number, nearest: number) => {
  if (nearest >= 1) return Math.round(value * nearest) / nearest;
  const coefficient = 1 / nearest;
  return Math.round(value * coefficient) / coefficient;
}

export default roundToNearest;
