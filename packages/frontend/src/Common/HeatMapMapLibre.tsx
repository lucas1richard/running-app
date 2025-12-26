import { useId, useMemo, useRef, useState } from 'react';
import { Basic } from '../DLS';
import Shimmer from '../Loading/Shimmer';
import { FullscreenControl, Layer, Map, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css"; // Required!
import useDarkReaderMode from '../hooks/useDarkReaderMode';
import Surface from '../DLS/Surface';

const makeSquare = ({ lat, lon }, size = 0.0001) => {
  const delta = size / 2;
  const squareCoords = [
    [lon - delta, lat - delta], // bottom-left
    [lon - delta, lat + delta], // top-left
    [lon + delta, lat + delta], // top-right
    [lon + delta, lat - delta], // bottom-right
    [lon - delta, lat - delta], // bottom-left (to close the square)
  ];

  return squareCoords;
};

type RGBATuple = [number, number, number, number];

const makeColor = (minColor: RGBATuple, maxColor: RGBATuple, percent: number) => {
  const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percent);
  const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percent);
  const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percent);
  const a = Math.max(minColor[3], Math.min(maxColor[3], percent));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

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
  floorValue?: number;
  ceilingValue?: number;
  squareSize?: number;
};

const HeatMapMapLibre: React.FC<HeatMapProps> = ({
  data,
  measure,
  deferRender,
  height = 900,
  minColor = [20, 20, 255, 0.5], // Red with some transparency
  maxColor = [255, 0, 0, 0.5], // Green with full opacity
  floorValue,
  ceilingValue,
  squareSize = 0.0001,
}) => {
  const isDarkReaderMode = useDarkReaderMode();

  let activeMinColor = minColor;
  let activeMaxColor = maxColor;
  if (isDarkReaderMode) {
    activeMinColor = [255 - minColor[0], 255 - minColor[1], 255 - minColor[2], minColor[3]];
    activeMaxColor = [255 - maxColor[0], 255 - maxColor[1], 255 - maxColor[2], maxColor[3]];
  }
  
  const heatmapSource = useId();
  const heatmapLayer = useId();
  const largestValue = useMemo(() => {
    return Math.max(...data.map((d) => Number(d[measure])));
  }, [deferRender]);
  const smallestValue = useMemo(() => {
    return Math.min(...data.map((d) => Number(d[measure])));
  }, [deferRender]);

  const gradientId = useId();

  const edges = useMemo(() => {
    const maxLng = data.reduce((max, { lon }) => Math.max(max, Number(lon)), -Infinity);
    const minLng = data.reduce((min, { lon }) => Math.min(min, Number(lon)), Infinity);
    const maxLat = data.reduce((max, { lat }) => Math.max(max, Number(lat)), -Infinity);
    const minLat = data.reduce((min, { lat }) => Math.min(min, Number(lat)), Infinity);

    return { maxLng, minLng, maxLat, minLat };
  }, [deferRender]);

  const initialViewState = useMemo(() => {
    const deltaLng = edges.maxLng - edges.minLng;
    const deltaLat = edges.maxLat - edges.minLat;
    const bounds = [
      edges.minLng - deltaLng * 0.1, edges.minLat - deltaLat * 0.1,
      edges.maxLng + deltaLng * 0.1, edges.maxLat + deltaLat * 0.1,
    ] as [number, number, number, number];
    return ({
      bounds,
      pitch: 0,
      bearing: 0,
    })
  }, [edges]);

  const mapRef = useRef<maplibregl.Map | null>(null);

  const [pointSize, setPointSize] = useState(squareSize);

  const setPointSizeOnZoom = ({ viewState }) => {
    const zoom = viewState.zoom;
    setPointSize(() => {
      switch (true) {
        case zoom < 1: return 0.8;
        case zoom < 2: return 0.7;
        case zoom < 3: return 0.6;
        case zoom < 4: return 0.5;
        case zoom < 5: return 0.4;
        case zoom < 6: return 0.3;
        case zoom < 7: return 0.1;
        case zoom < 8.5: return 0.01;
        case zoom < 9: return 0.00066;
        case zoom < 10: return 0.00047;
        case zoom < 11: return 0.0003;
        case zoom < 12: return 0.0002;
        default: return squareSize;
      }
    });
  };

  return (
    <Surface>
      {
        !deferRender
          ? (
            <Map
              initialViewState={initialViewState}
              // @ts-expect-error -- ref
              ref={mapRef}
              mapLib={maplibregl}
              style={{ height }}
              onZoom={setPointSizeOnZoom}
              // onRender={() => setPointSizeOnZoom({ viewState: { zoome: mapRef.current.getZoom() } })}
              mapStyle={isDarkReaderMode
                ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              }
            >
              <Source
                id={heatmapSource}
                type="geojson"
                data={{
                  type: 'FeatureCollection',
                  features: data.map(({ lat, lon, [measure]: point }) => {
                    const floor = floorValue !== undefined ? floorValue : smallestValue;
                    const ceiling = ceilingValue !== undefined ? ceilingValue : largestValue;
                    if (Number(point) < floor) point = smallestValue;
                    if (Number(point) > ceiling) point = largestValue;
                    const percent = (Number(point) - smallestValue) / (largestValue - smallestValue);
                    return ({
                      type: 'Feature',
                      geometry: {
                        type: 'Polygon',
                        coordinates: [makeSquare({ lon: Number(lon), lat: Number(lat) }, pointSize)],
                      },
                      properties: { color: makeColor(activeMinColor, activeMaxColor, percent) },
                    })
                  }),
                }}
              >
                <Layer
                  id={heatmapLayer}
                  type="fill"
                  // source={heatmapSource}
                  paint={{
                    "fill-color": ['get', 'color'],
                  }}
                />
              </Source>
              <FullscreenControl position="top-right" />
            </Map>
          )
          : <div style={{ height: `${height}px` }}><Shimmer isVisible={true} preset="openBackground" /></div>
      }
      {!deferRender && (
        <div>
          <svg width="100%" height="20">
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: `rgb(${activeMinColor[0]}, ${activeMinColor[1]}, ${activeMinColor[2]})`, stopOpacity: activeMinColor[3] }} />
              <stop offset="100%" style={{ stopColor: `rgb(${activeMaxColor[0]}, ${activeMaxColor[1]}, ${activeMaxColor[2]})`, stopOpacity: activeMaxColor[3] }} />
            </linearGradient>
            <rect x="0" y="0" width="100%" height="20" fill={`url(#${gradientId})`} />
          </svg>
          <div className="flex justify-between text-body">
            <div>Lowest ({floorValue !== undefined ? `${floorValue} floor` : smallestValue})</div>
            <div>Highest ({ceilingValue !== undefined ? `${ceilingValue} ceiling` : largestValue})</div>
          </div>
        </div>
      )}
    </Surface>
  );
};

export default HeatMapMapLibre;
