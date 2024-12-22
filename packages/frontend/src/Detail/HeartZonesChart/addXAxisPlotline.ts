const addXAxisPlotLine = (xVal, color, chartRef) => {
  const chart = chartRef.current?.chart;
  if (!chart) return;

  chart.xAxis[0].addPlotLine({
    value: xVal,
    color,
    width: 5,
    id: xVal,
    label: {
      text: xVal
    }
  });
};

export const removeXAxisPlotLine = (xVal, chartRef) => {
  const chart = chartRef.current?.chart;
  if (!chart) return;

  const existingPlotline = chart.xAxis[0].plotLinesAndBands.find(({ id }) => id === xVal);
  if (existingPlotline) {
    chart.xAxis[0].removePlotLine(xVal);
  }
};

export default addXAxisPlotLine;
