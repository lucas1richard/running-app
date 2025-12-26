import { useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import HighchartsReact from 'highcharts-react-official';
import roundToNearest from '../utils/roundToNearest';
import { Basic, Button } from '../DLS';
import Shimmer from '../Loading/Shimmer';
import Surface from '../DLS/Surface';

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

type RGBATuple = [number, number, number, number];

const makeColor = (minColor: RGBATuple, maxColor: RGBATuple, percent: number) => {
  return `rgba(
    ${Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percent)},
    ${Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percent)},
    ${Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percent)},
    ${Math.max(minColor[3], Math.min(maxColor[3], percent))}
  )`;
}

const MINIMUM_SQUARE_SIZE = 0.0001;
const MAXIMUM_SQUARE_SIZE = 0.0004;
const MINIMUM_OPACITY = 0.05;
const DEFAULT_MINIMUM_OPACITY = 0.1;
const MAXIMUM_OPACITY = 1;

type DataPoint = {
  lat: number | string;
  lon: number | string;
  [key: string]: number | string;
};

type HeatMapProps = {
  title?: string;
  data: Array<DataPoint>;
  measure: keyof DataPoint;
  deferRender?: boolean;
  minColor?: RGBATuple; // RGBA
  maxColor?: RGBATuple; // RGBA
  height?: number;
};

const HeatMap: React.FC<HeatMapProps> = ({
  title = 'Heatmap',
  data,
  measure,
  deferRender,
  height = 900,
  minColor = [255, 255, 0, 0.1], // Red with some transparency
  maxColor = [255, 0, 0, 1], // Green with full opacity
}) => {
  const [squareSize, setSquareSize] = useState(MINIMUM_SQUARE_SIZE);
  const [minimumOpacity, setMinimumOpacity] = useState(DEFAULT_MINIMUM_OPACITY);

  const largestValue = useMemo(() => {
    return Math.max(...data.map((d) => Number(d[measure])));
  }, [deferRender]);
  const smallestValue = useMemo(() => {
    return Math.min(...data.map((d) => Number(d[measure])));
  }, [deferRender]);

  const lineSeries = useMemo(() => ({
    type: 'mapline',
    id: 'grid-lines',
    lineWidth: 2,
    data: data.map(({ lat, lon, [measure]: point }) => {
      const percent = (Number(point) - smallestValue) / (largestValue - smallestValue);
      return ({
        geometry: {
          type: 'LineString',
          coordinates: makeSquare({ lat: Number(lat), lon: Number(lon) }, squareSize),
        },
        // color: `rgba(${255}, ${255 * (1 - percent)}, 0, ${Math.max(percent, minimumOpacity)})`,
        color: makeColor(minColor, maxColor, Math.max(percent, minimumOpacity)),
      })
    }),
    showInLegend: false,
    enableMouseTracking: false,
  }), [deferRender, squareSize, minimumOpacity]);

  const options = useMemo(() => {
    return {
      chart: {
        map: 'custom/world',
        animation: false,
        height,
        backgroundColor: 'transparent',
      },
      mapNavigation: {
        enabled: true,
        enableDoubleClickZoom: false,
        enableMouseWheelZoom: false,
      },
      title: {
        text: title,
      },
      series: [lineSeries],
    };
  }, [lineSeries]);

  return (
    <Surface>
      {
        !deferRender
          ? (
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={'mapChart'}
              options={options}
            />
          )
          : <div style={{ height: `${height}px` }}><Shimmer isVisible={true} preset="openBackground" /></div>
      }
      <Button
        onClick={() => setSquareSize(Math.min(MAXIMUM_SQUARE_SIZE, roundToNearest(squareSize + MINIMUM_SQUARE_SIZE, MINIMUM_SQUARE_SIZE)))}
      > Increase Square Size</Button>
      <Button
        onClick={() => setSquareSize(Math.max(MINIMUM_SQUARE_SIZE, roundToNearest(squareSize - MINIMUM_SQUARE_SIZE, MINIMUM_SQUARE_SIZE)))}
      > Decrease Square Size</Button>
      <div className="mt-4">
        <div className="text-body">
          Square Size: {squareSize} | Largest Value: {largestValue}
        </div>
      </div>
      <Button
        onClick={() => setMinimumOpacity(Math.min(MAXIMUM_OPACITY, roundToNearest(minimumOpacity + 0.02, 0.02)))}
      > Increase Min. Opacity</Button>
      <Button
        onClick={() => setMinimumOpacity(Math.max(MINIMUM_OPACITY, roundToNearest(minimumOpacity - 0.02, 0.02)))}
      > Decrease Min. Opacity</Button>
      <div className="mt-4">
        <div className="text-body">
          Minimum Opacity: {minimumOpacity} | Largest Value: {largestValue}
        </div>
      </div>
    </Surface>
  );
};

export default HeatMap;
