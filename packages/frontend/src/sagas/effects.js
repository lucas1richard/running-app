const { takeEvery } = require('redux-saga/effects');

export const takeEveryContext = (pattern, saga) => {
  return takeEvery(
    pattern,
    [{ triggeredBy: pattern }, saga]
  );
}
