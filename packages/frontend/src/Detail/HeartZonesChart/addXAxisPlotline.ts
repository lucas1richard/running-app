const addXAxisPlotLine = (xVal, color, chartRef, setPlotLines) => {
  const chart = chartRef.current?.chart;
  if (!chart) return;

  const existingPlotline = chart.xAxis[0].plotLinesAndBands.find(({ id }) => id === xVal);
  if (existingPlotline) {
    chart.xAxis[0].removePlotLine(xVal);
    setPlotLines((lines) => lines.filter((val) => val !== xVal));
  } else {
    chart.xAxis[0].addPlotLine({
      value: xVal,
      color,
      width: 5,
      id: xVal,
      label: {
        text: xVal
      }
    });
    setPlotLines((lines) => [...lines, xVal]);
  }
};

export default addXAxisPlotLine;
