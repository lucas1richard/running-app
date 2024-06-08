import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import networkgraph from 'highcharts/modules/networkgraph';
import testdata from './testdata.json';

networkgraph(Highcharts);

const ActivityNetworkChart = () => {
  const refId = '11137630162';
  
  const options = {
    chart: {
      type: 'networkgraph',
      plotBorderWidth: 1
    },
    title: {
      text: ''
    },
    plotOptions: {
      networkgraph: {
        keys: ['from', 'to']
      }
    },
    series: [
      {
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
          linkLength: 10,
        },
        name: 'K8',
        link: {
          width: 5,
        },
        data: testdata
          .filter(({ scoreLow }) => scoreLow >= 0.75)
          .map(({ id, scoreLow }) => [
            refId,
            id
          ])
      },
      {
        layoutAlgorithm: {
          enableSimulation: true,
          initialPositions: function () {
            const chart = this.series[1].chart,
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
          linkLength: 20,

        },
        name: 'K9',
        link: {
          width: 2,
        },
        data: testdata
          // .filter(({ scoreLow }) => scoreLow > 0.33 && scoreLow < 0.75)
          .map(({ id, scoreLow }) => [
            scoreLow < 0.33 ? id : refId,
            id
          ])
      }
    ]
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      allowChartUpdate={true}
    />
  );
};

export default ActivityNetworkChart;
