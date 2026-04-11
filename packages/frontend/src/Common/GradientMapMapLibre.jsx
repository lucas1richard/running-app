import { FullscreenControl, Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
// import "maplibre-gl/dist/maplibre-gl.css";
import { emptyArray, emptyObject } from '@/constants';
import { Basic } from '@/DLS';
import Surface from '@/DLS/Surface';
import { useAppSelector } from '@/hooks/redux';
import useDarkReaderMode from '@/hooks/useDarkReaderMode';
import { selectActivity, selectStreamTypeData } from '@/reducers/activities';
import { selectHeartZones } from '@/reducers/heartzones';
import { condenseZonesFromHeartRate } from '@/utils';

const makeColor = (minColor, maxColor, percent) => {
  const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percent);
  const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percent);
  const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percent);
  const a = Math.max(minColor[3], Math.min(maxColor[3], percent));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function GradientMapMapLibre({
  id,
  animated = false,
  pointer = 0,
  minColor = [20, 20, 255, 0.5], // Red with some transparency
  maxColor = [255, 0, 0, 1], // Green with full opacity
  data,
  deferRender,
  floorValue,
  time,
  ceilingValue,
  measure,
  height = 900,
  title = '',
}) {
  const isDarkReaderMode = useDarkReaderMode();
  const outlineSourceId = useId();
  const hrZonesSourceId = useId();
  const latlngStreamData = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng')) || emptyObject;
  const activity = useAppSelector((state) => selectActivity(state, id)) || emptyObject;
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity.start_date));
  const lnglatStream = useMemo(() => latlngStreamData.map(([lat, lng]) => [lng, lat]), [latlngStreamData]) || emptyArray;
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, heartRateStream), [zones, heartRateStream]);

  let activeMinColor = minColor;
  let activeMaxColor = maxColor;

  const edges = useMemo(() => {
    const maxLng = lnglatStream.reduce((max, [lng]) => Math.max(max, lng), -Infinity);
    const minLng = lnglatStream.reduce((min, [lng]) => Math.min(min, lng), Infinity);
    const maxLat = lnglatStream.reduce((max, [, lat]) => Math.max(max, lat), -Infinity);
    const minLat = lnglatStream.reduce((min, [, lat]) => Math.min(min, lat), Infinity);

    return { maxLng, minLng, maxLat, minLat };
  }, [lnglatStream]);

  const routeData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Route',
          color: isDarkReaderMode ? '#ffffff' : '#000000',
        },
        geometry: {
          type: 'LineString',
          coordinates: lnglatStream.map(([lng, lat]) => [lng, lat])
        }
      }
    ],
  };

  const latlondata = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        name: 'Outline',
        color: isDarkReaderMode ? '#ffffff' : '#000000',
      },
      geometry: {
        type: 'LineString',
        coordinates: lnglatStream
      }
    }],
  };

  const mapRef = useRef(null);
  const animationRef = useRef(null);

  const animatedLineLayer = useCallback((time) => {
    const coords = latlngStreamData[Math.floor((time / 5)) % latlngStreamData.length];
    mapRef.current?.setLngLat({ lat: coords[0], lng: coords[1] });
    animationRef.current = requestAnimationFrame(animatedLineLayer);
  }, []);

  useEffect(() => {
    if (latlngStreamData.length === 0) return;
    if (animated) animatedLineLayer(0);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animated, animatedLineLayer, latlngStreamData.length]);

  const largestValue = useMemo(() => {
    return Math.max(...data.map((d) => Number(d[measure])));
  }, [deferRender]);
  const smallestValue = useMemo(() => {
    return Math.min(...data.map((d) => Number(d[measure])));
  }, [deferRender]);

  const gradientId = useId();
  if (lnglatStream.length === 0 || data.length === 0) return null;

  const stops = data.map(({ lat, lon, [measure]: point }, index) => {
    const floor = floorValue !== undefined ? floorValue : smallestValue;
    const ceiling = ceilingValue !== undefined ? ceilingValue : largestValue;
    if (Number(point) < floor) point = smallestValue;
    if (Number(point) > ceiling) point = largestValue;
    const percent = (Number(point) - floor) / (ceiling - floor);
    // console.log(title, percent)
    const color = makeColor(activeMinColor, activeMaxColor, percent);
    return [time[index] / (time[time.length - 1] || 1), color];
  });


  const gradient = [
    'interpolate',
    ['linear'],
    ['line-progress'],
    ...stops.flat(),
  ];

  return (
    <Surface>

      <Map
        initialViewState={{
          bounds: [
            edges.minLng - 0.0006, edges.minLat - 0.0006,
            edges.maxLng + 0.0006, edges.maxLat + 0.0006,
          ],
        }}
        style={{ height }}
        mapLib={maplibregl}
        mapStyle={isDarkReaderMode
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        }
      >
        <Marker
          ref={mapRef}
          latitude={latlngStreamData[pointer][0]}
          longitude={latlngStreamData[pointer][1]}
        >
          <Basic.Div $width={1.2} $height={1.2} $colorBg="gold" $borderRadius="50%" />
        </Marker>
        <Source data={latlondata} type="geojson" id={outlineSourceId}>
          <Layer
            source={outlineSourceId}
            id="outline-layer"
            type="line"
            paint={{
              'line-width': 15,
            }}
          />
        </Source>
        <Source data={routeData} type="geojson" id={hrZonesSourceId} lineMetrics={true}>
          <Layer
            source={hrZonesSourceId}
            id="hr-zones-layer"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 10,
              'line-gradient': gradient,
            }}
          />
          <FullscreenControl position="top-right" />
        </Source>
      </Map>
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
}

export default GradientMapMapLibre;
