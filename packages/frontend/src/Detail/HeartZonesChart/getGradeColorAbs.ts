const getGradeColorAbsSingle = (grade: number, maxAbsoluteGrade = 20) => {
  const baseColor = [0, 0, 0];

  const absGrade = (Math.abs(grade) / maxAbsoluteGrade) * 255;

  if (grade > 0) baseColor[0] = absGrade;
  if (grade < 0) baseColor[1] = absGrade;

  return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 1)`;
}

const getGradeColorAbs = (gradeArray: number[], absoluteMax = 0) => {
  const maxGrade = Math.max(0, absoluteMax) || Math.max.apply(null, gradeArray.map(Math.abs));
  
  return gradeArray.map((grade, i) => [
    i / (gradeArray.length || 1),
    getGradeColorAbsSingle(grade, maxGrade)
  ]);
}

export default getGradeColorAbs;
