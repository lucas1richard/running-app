import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HeartRateChart = ({ data, velocity }) => {
  /** @type {Highcharts.Options} */
  const options = {
    chart: {
      type: 'line',
      height: 400,
    },
    series: [
      {
        name: 'HeartRate',
        data,
        yAxis: 0,
      },
      velocity && {
        name: 'Velocity',
        data: velocity.map(val => val * 2.237),
        yAxis: 1,
          color: 'rgba(0,0,0,0.1)'
      }
    ].filter(Boolean),
    yAxis: [
      { // Primary yAxis
        labels: {
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        title: {
          text: 'HeartRate',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        opposite: true
      },
      { // Secondary yAxis
        gridLineWidth: 0,
        title: {
            text: 'Velocity',
            style: {
              color: 'rgba(0,0,0,0.3)'
            }
        },
        labels: {
            format: '{value} mph',
            style: {
              color: 'rgba(0,0,0,0.3)'
            }
        }
      }
    ]
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        allowChartUpdate={true}
      />
    </div>
  );
};

export default HeartRateChart;
