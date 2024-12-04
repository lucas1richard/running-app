const roundToNearest = (value: number, nearest: number) => {
  return Math.round(value * nearest) / nearest;
}

export default roundToNearest;
