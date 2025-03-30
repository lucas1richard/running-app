import { useId, useMemo, useRef, useState } from 'react';
import { Basic } from '../DLS';
import Shimmer from '../Loading/Shimmer';
import { FullscreenControl, Layer, Map, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css"; // Required!

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
  minColor = [20, 20, 255, 1], // Red with some transparency
  maxColor = [255, 0, 0, 1], // Green with full opacity
  floorValue,
  ceilingValue,
  squareSize = 0.0001,
}) => {
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
  }, [deferRender])
  
  const defaultCenter = useMemo(() => {
    if (!data.length) return { lat: 37.74, lon: -122.4 };
    
    const lon = (edges.maxLng + edges.minLng) / 2;
    const lat = (edges.maxLat + edges.minLat) / 2;
    return { lat, lon };
  }, [deferRender]);

  
  const initialViewState = useMemo(() => {
    const bounds = [
      edges.minLng - 0.0006, edges.minLat - 0.0006,
      edges.maxLng + 0.0006, edges.maxLat + 0.0006,
    ] as [number, number, number, number];
    return ({
      bounds,
      pitch: 0,
      bearing: 0,
    })
  }, [edges]);

  return (
    <Basic.Div>
      {
        !deferRender
          ? (
            <Map
              initialViewState={initialViewState}
              mapLib={maplibregl}
              style={{ height }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              // mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
                      coordinates: [makeSquare({ lon: Number(lon), lat: Number(lat)}, squareSize)],
                    },
                    properties: { color: makeColor(minColor, maxColor, percent) },
                  })}),
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
          : <Basic.Div $height={`${height}px`}><Shimmer isVisible={true} /></Basic.Div>
      }
      {!deferRender && (
        <Basic.Div>
          <svg width="100%" height="20">
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: `rgb(${minColor[0]}, ${minColor[1]}, ${minColor[2]})`, stopOpacity: minColor[3] }} />
              <stop offset="100%" style={{ stopColor: `rgb(${maxColor[0]}, ${maxColor[1]}, ${maxColor[2]})`, stopOpacity: maxColor[3] }} />
            </linearGradient>
            <rect x="0" y="0" width="100%" height="20" fill={`url(#${gradientId})`} />
          </svg>
          <Basic.Div $display="flex" $flexJustify="space-between" $fontSize="body">
            <Basic.Div>Lowest ({floorValue !== undefined ? `${floorValue} floor` : smallestValue})</Basic.Div>
            <Basic.Div>Highst ({ceilingValue !== undefined ? `${ceilingValue} ceiling` : largestValue})</Basic.Div>
          </Basic.Div>
        </Basic.Div>
      )}
    </Basic.Div>
  );
};

export default HeatMapMapLibre;
