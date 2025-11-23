export const clearReactiveObject = (obj) => {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    delete obj[keys[i]];
  }
};