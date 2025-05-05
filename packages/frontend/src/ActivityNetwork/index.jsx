import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import networkgraph from 'highcharts/modules/networkgraph';
import testdata from './testdata.json';
import Surface from '../DLS/Surface';

networkgraph(Highcharts);

const ActivityNetworkChart = () => {
  const options = useMemo(() => ({
    chart: {
      type: 'networkgraph',
      plotBorderWidth: 1,
      allowPointSelect: true,
      backgroundColor: 'transparent',
    },
    title: {
      text: ''
    },
    plotOptions: {
      networkgraph: {}
    },
    tooltip: {
      useHtml: true,
      formatter: function () {
        return `<b target="_blank" href="http://localhost:3000/${this.point.name}/detail">${this.point.name}</b>`;
      }
    },
    series: [
      {
        dataLabels: {
          // enabled: true,
          linkTextPath: {
            attributes: {
              dy: 12
            }
          },
          // linkFormat: '\u2192',
          textPath: {
            enabled: true,
            attributes: {
              dy: 14,
              startOffset: '45%',
              textLength: 80
            }
          },
        },
        layoutAlgorithm: {
          enableSimulation: true,
          initialPositions: function () {
            const chart = this.series[0].chart,
              width = chart.plotWidth,
              height = chart.plotHeight;
    
            this.nodes.forEach(function (node) {
              // If initial positions were set previously, use that
              // positions. Otherwise use random position:
              node.plotX = node.plotX === undefined ?
                Math.random() * width : node.plotX;
              node.plotY = node.plotY === undefined ?
                Math.random() * height : node.plotY;
            });
          },
          linkLength: 100,
        },
        name: 'K8',
        link: {
          width: 1,
        },
        data: testdata
          .filter(({ segmentScoreFromBase }) => segmentScoreFromBase > 0.7)
          .map(({ baseActivity, relatedActivity }) => [
            baseActivity,
            relatedActivity,
          ])
      },
    ]
  }), []);

  return (
    <Surface>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </Surface>
  );
};

export default ActivityNetworkChart;
