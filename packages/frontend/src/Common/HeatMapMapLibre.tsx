import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Basic } from '../DLS';
import Shimmer from '../Loading/Shimmer';
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
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

// Add this function to your component
const calculateZoomLevel = (bounds, mapWidth: number, mapHeight: number, padding = 90) => {
  const { minLng, maxLng, minLat, maxLat } = bounds;
  
  // Calculate the angular distance
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  
  // Calculate zoom level for width and height separately
  const latZoom = Math.log2(360 * (mapHeight - 2 * padding) / (256 * latDiff));
  const lngZoom = Math.log2(360 * (mapWidth - 2 * padding) / (256 * lngDiff * Math.cos(((maxLat + minLat) / 2) * Math.PI / 180)));
  
  // Return the minimum zoom level that fits both dimensions
  return Math.min(latZoom, lngZoom, 18); // Cap at zoom level 18
};

const HeatMapMapLibre: React.FC<HeatMapProps> = ({
  title = 'Heatmap',
  data,
  measure,
  deferRender,
  height = 900,
  minColor = [20, 20, 255, 1], // Red with some transparency
  maxColor = [255, 0, 0, 1], // Green with full opacity
}) => {
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

  
  // Add state for map dimensions
  const [mapDimensions, setMapDimensions] = useState({ width: 900, height });
  
  // Calculate initial zoom level
  const initialZoom = useMemo(() => {
    if (!data.length) return 12.5; // Default zoom
    
    // Add padding to ensure all points are visible
    const paddedBounds = {
      minLng: edges.minLng - 0.01,
      maxLng: edges.maxLng + 0.01,
      minLat: edges.minLat - 0.01,
      maxLat: edges.maxLat + 0.01
    };
    
    return calculateZoomLevel(
      paddedBounds,
      mapDimensions.width,
      mapDimensions.height
    );
  }, [edges, mapDimensions, data.length]);
  
  // Ref for map container to get dimensions
  const mapContainerRef = useRef(null);
  
  // Update dimensions on mount and window resize
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const updateDimensions = () => {
      if (mapContainerRef.current) {
        setMapDimensions({
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight
        });
      }
    };
    
    // Initial measurement
    updateDimensions();
    
    // Set up resize listener
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [deferRender]);

  const initialViewState = useMemo(() => ({
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lon,
    zoom: initialZoom,
    pitch: 0,
    bearing: 0,
  }), [defaultCenter, initialZoom]);
  
  return (
    <Basic.Div>
      {
        !deferRender
          ? (
            <div ref={mapContainerRef}>
              <Map
                initialViewState={initialViewState}
                mapLib={maplibregl}
                style={{ height }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              >
                <Source
                  id="heatmap-source"
                  type="geojson"
                  data={{
                    type: 'FeatureCollection',
                    features: data.map(({ lat, lon, [measure]: point }) => {
                      const percent = (Number(point) - smallestValue) / (largestValue - smallestValue);
                      return ({
                      type: 'Feature',
                      geometry: {
                        type: 'Polygon',
                        coordinates: [makeSquare({ lon: Number(lon), lat: Number(lat)})],
                      },
                      properties: { color: makeColor(minColor, maxColor, percent) },
                    })}),
                  }}
                >
                  <Layer
                    id="heatmap-layer"
                    type="fill"
                    source="heatmap-source"
                    paint={{
                      "fill-color": ['get', 'color'],
                    }}
                  />
                </Source>
              </Map>
            </div>
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
            <Basic.Div>Lowest ({smallestValue})</Basic.Div>
            <Basic.Div>Highst ({largestValue})</Basic.Div>
          </Basic.Div>
        </Basic.Div>
      )}
    </Basic.Div>
  );
};

export default HeatMapMapLibre;
