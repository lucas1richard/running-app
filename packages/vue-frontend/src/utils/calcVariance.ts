const calcVariance = (data: number[]) => {
  const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
  return data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
}

export default calcVariance;
