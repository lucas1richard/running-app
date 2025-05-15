const propSelector = <TObj>(obj: TObj): keyof TObj | undefined => {
  const entries = Object.entries(obj)
  const val = entries.find(([_, value]) => value)?.[0] as keyof TObj;
  if (isNaN(Number(val))) {
    return val;
  }
  return Number(val) as keyof TObj;
}

export default propSelector;
