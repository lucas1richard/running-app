const getGradeColorAbsSingle = (
  grade: number,
  greatestDiffFromMidValue = 20,
  midValue = 0,
  config = {
    lowestValueRgb: [255, 0, 0],
    midValueRgb: [0, 0, 0],
    highestValueRgb: [0, 255, 0],
  }
) => {
  let baseColor = config.midValueRgb;
  const adjustedGrade = grade - midValue;
  const adjustedMaxAbsoluteGrade = greatestDiffFromMidValue - midValue;

  const absGrade = (Math.abs(adjustedGrade) / adjustedMaxAbsoluteGrade);

  
  if (adjustedGrade > 0) baseColor = config.highestValueRgb.map((rgb) => Math.round(rgb * absGrade));
  if (adjustedGrade < 0) baseColor = config.lowestValueRgb.map((rgb) => Math.round(rgb * absGrade));

  return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 1)`;
}

const getGradeColorAbs = (
  gradeArray: number[],
  /* The greatest difference from the mid value. Any value <= 0 will be ignored */
  greatestDiffFromMidValue = 0,
  /* The center of the "bell curve" */
  midValue = 0,
  /* should lower values be green, and higher values be red? */
  config = {
    lowestValueRgb: [255, 0, 0],
    midValueRgb: [0, 0, 0],
    highestValueRgb: [0, 255, 0],
  }
) => {
  const maxGrade = Math.max(0, greatestDiffFromMidValue)
    || Math.max.apply(null, gradeArray.map(
      ((grade) => Math.abs(midValue >= grade ? midValue - grade : grade - midValue))
    ));
  
  return gradeArray.map((grade, i) => [
    i / (gradeArray.length || 1),
    getGradeColorAbsSingle(grade - midValue, maxGrade, 0, config)
  ]);
}

export default getGradeColorAbs;
