import { useEffect, useMemo, useState } from 'react';
import Highcharts, { color } from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import HighchartsReact from 'highcharts-react-official';
import { useAppSelector } from '../hooks/redux';
import getEdgeCoords from '../Admin/getEdgeCoords';
import roundToNearest from '../utils/roundToNearest';
import { success, useGetApiStatus, useTriggerActionIfStatus } from '../reducers/apiStatus';
import { Basic, Button } from '../DLS';
import Shimmer from '../Loading/Shimmer';
import { fetchHeatMapDataAct } from '../reducers/activities-actions';

HighchartsMap(Highcharts);

const makeSquare = ({ lat, lon }, size = 0.0001) => {
  const delta = size / 2;
  const squareCoords = [
    [lon - delta, lat - delta], // bottom-left
    [lon - delta, lat + delta], // top-left
    [lon + delta, lat + delta], // top-right
    [lon + delta, lat - delta], // bottom-right
    [lon - delta, lat - delta], // bottom-left (to close the square)
    [lon + delta, lat + delta], // top-right (make an X shape)
    [lon + delta, lat - delta], // bottom-right
    [lon - delta, lat + delta], // top-left (make an X shape)
  ];

  return squareCoords;
};

const MINIMUM_SQUARE_SIZE = 0.0001;
const MAXIMUM_SQUARE_SIZE = 0.0004;
const MINIMUM_OPACITY = 0.05;
const DEFAULT_MINIMUM_OPACITY = 0.1;
const MAXIMUM_OPACITY = 1;

const HeapMap = () => {
  const [squareSize, setSquareSize] = useState(MINIMUM_SQUARE_SIZE);
  const [minimumOpacity, setMinimumOpacity] = useState(DEFAULT_MINIMUM_OPACITY);
  const data = useAppSelector((state) => state.activities.heatMap) || [];

  useTriggerActionIfStatus(fetchHeatMapDataAct(), 'idle');

  const apiStatus = useGetApiStatus(fetchHeatMapDataAct());

  const largestValue = useMemo(() => {
    return Math.max(...data.map(d => d.total_seconds));
  }, [apiStatus]);

  const lineSeries = useMemo(() => ({
    type: 'mapline',
    id: 'grid-lines',
    lineWidth: 2,
    data: data.map(({ lat, lon, total_seconds }) => {
      const percent = (total_seconds) / largestValue;
      return ({
        geometry: {
          type: 'LineString',
          coordinates: makeSquare({ lat: Number(lat), lon: Number(lon) }, squareSize),
        },
        color: `rgba(${255}, ${255 * (1 - percent)}, 0, ${Math.max(percent, minimumOpacity)})`,
      })
    }),
    showInLegend: false,
    enableMouseTracking: false,
  }), [apiStatus, squareSize, minimumOpacity]);

  const options = useMemo(() => {
    return {
      chart: {
        map: 'custom/world',
        animation: false,
        height: 900,
        backgroundColor: 'black',
      },
      mapNavigation: {
        enabled: true,
        enableDoubleClickZoom: false,
        enableMouseWheelZoom: false,
      },
      title: {
        text: 'Heatmap',
      },
      series: [lineSeries],
    };
  }, [lineSeries]);

  return (
    <Basic.Div>
      {
        apiStatus === success
          ? (
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={'mapChart'}
              options={options}
            />
          )
          : <Basic.Div $height="900px"><Shimmer isVisible={true} /></Basic.Div>
      }
      <Button
        onClick={() => setSquareSize(Math.min(MAXIMUM_SQUARE_SIZE, roundToNearest(squareSize + MINIMUM_SQUARE_SIZE, MINIMUM_SQUARE_SIZE)))}
      > Increase Square Size</Button>
      <Button
        onClick={() => setSquareSize(Math.max(MINIMUM_SQUARE_SIZE, roundToNearest(squareSize - MINIMUM_SQUARE_SIZE, MINIMUM_SQUARE_SIZE)))}
      > Decrease Square Size</Button>
      <Basic.Div $marginT={1}>
        <Basic.Div $fontSize="body">
          Square Size: {squareSize} | Largest Value: {largestValue}
        </Basic.Div>
      </Basic.Div>
      <Button
        onClick={() => setMinimumOpacity(Math.min(MAXIMUM_OPACITY, roundToNearest(minimumOpacity + 0.02, 0.02)))}
      > Increase Min. Opacity</Button>
      <Button
        onClick={() => setMinimumOpacity(Math.max(MINIMUM_OPACITY, roundToNearest(minimumOpacity - 0.02, 0.02)))}
      > Decrease Min. Opacity</Button>
      <Basic.Div $marginT={1}>
        <Basic.Div $fontSize="body">
          Minimum Opacity: {minimumOpacity} | Largest Value: {largestValue}
        </Basic.Div>
      </Basic.Div>
    </Basic.Div>
  );
};

export default HeapMap;
