import { FullscreenControl, Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
// import "maplibre-gl/dist/maplibre-gl.css";
import { emptyArray } from '@/constants';
import { Basic } from '@/DLS';
import Surface from '@/DLS/Surface';
import useDarkReaderMode from '@/hooks/useDarkReaderMode';

const makeColor = (minColor, maxColor, percent) => {
  const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percent);
  const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percent);
  const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percent);
  const a = Math.max(minColor[3], Math.min(maxColor[3], percent));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const splitOnNulls = (srcArr) => srcArr.reduce((acc, v) => {
  const lastEl = acc[acc.length - 1];
  if (v !== null) {
    lastEl.push(v);
  } else if (lastEl.length > 0) {
    acc.push([]);
  }
  return acc;
}, [[]]);

function GradientMapMapLibre({
  id,
  animated = false,
  pointer = 0,
  viewState,
  onZoom,
  onDrag,
  minColor = [20, 20, 255, 0.5], // Red with some transparency
  maxColor = [255, 0, 0, 1], // Green with full opacity
  data,
  deferRender,
  floorValue,
  time,
  ceilingValue,
  measure,
  height = 900,
  latLngWithNulls,
  title = '',
}) {
  const isDarkReaderMode = useDarkReaderMode();
  const lnglatStream = useMemo(
    () => splitOnNulls(latLngWithNulls)
      .map((ll) => ll.map(([lat, lng]) => [lng, lat])
      ),
    [latLngWithNulls]
  ) || emptyArray;
  const segmentedData = useMemo(() => splitOnNulls(data), [data]);

  let activeMinColor = minColor;
  let activeMaxColor = maxColor;

  const edges = useMemo(() => {
    const maxLng = latLngWithNulls.reduce((max, v) => Math.max(max, v?.[1] || -Infinity), -Infinity);
    const minLng = latLngWithNulls.reduce((min, v) => Math.min(min, v?.[1] || Infinity), Infinity);
    const maxLat = latLngWithNulls.reduce((max, v) => Math.max(max, v?.[0] || -Infinity), -Infinity);
    const minLat = latLngWithNulls.reduce((min, v) => Math.min(min, v?.[0] || Infinity), Infinity);

    return { maxLng, minLng, maxLat, minLat };
  }, [latLngWithNulls]);

  const makeGradient = (series) => {
    const stops = series.map(({ lat, lon, [measure]: point }, index) => {
      const floor = floorValue !== undefined ? floorValue : smallestValue;
      let ceiling = ceilingValue !== undefined ? ceilingValue : largestValue;
      let numPoint = Number(point);
      if (floor >= ceiling) ceiling = floor + 1;
      if (typeof numPoint !== 'number' || isNaN(numPoint)) numPoint = floor;
      if (Number(numPoint) < floor) numPoint = floor;
      if (Number(numPoint) > ceiling) numPoint = ceiling;
      const percent = (Number(numPoint) - floor) / (ceiling - floor);
      const color = makeColor(activeMinColor, activeMaxColor, percent);
      // return [index / (data.length - 1), color];
      if (time[index] === undefined) {
        return [];
      }
      return [index / (series.length - 1 || 1), color];
    });

    return [
      'interpolate',
      ['linear'],
      ['line-progress'],
      ...stops.flat(),
    ];
  };

  const makeRouteLine = (lls) => ({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        name: 'Route',
        color: isDarkReaderMode ? '#ffffff' : '#000000',
      },
      geometry: {
        type: 'LineString',
        coordinates: lls,
      }
    }],
  });
  const routeLines = useMemo(
    () => lnglatStream.map((lls) => makeRouteLine(lls)),
    [lnglatStream, isDarkReaderMode]
  );


  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const animationRef = useRef(null);

  const animatedLineLayer = useCallback((time) => {
    const coords = latLngWithNulls[Math.floor((time / 5)) % latLngWithNulls.length];
    if (coords) markerRef.current?.setLngLat({ lat: coords[0], lng: coords[1] });
    animationRef.current = requestAnimationFrame(animatedLineLayer);
  }, []);

  useEffect(() => {
    if (latLngWithNulls.length === 0) return;
    if (animated) animatedLineLayer(0);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animated, animatedLineLayer, latLngWithNulls.length]);

  useEffect(() => {
    if (!viewState || !mapRef.current) return;

    if (mapRef.current.isMoving()) return;

    const currentCenter = mapRef.current.getCenter();
    const centerMatches = typeof viewState.longitude === 'number' && typeof viewState.latitude === 'number'
      ? Math.abs(currentCenter.lng - viewState.longitude) < 0.00001
      && Math.abs(currentCenter.lat - viewState.latitude) < 0.00001
      : true;
    const zoomMatches = typeof viewState.zoom === 'number'
      ? Math.abs(mapRef.current.getZoom() - viewState.zoom) < 0.01
      : true;

    if (centerMatches && zoomMatches) return;

    const nextCamera = {};

    if (typeof viewState.longitude === 'number' && typeof viewState.latitude === 'number') {
      nextCamera.center = [viewState.longitude, viewState.latitude];
    }
    if (typeof viewState.zoom === 'number') nextCamera.zoom = viewState.zoom;
    if (typeof viewState.bearing === 'number') nextCamera.bearing = viewState.bearing;
    if (typeof viewState.pitch === 'number') nextCamera.pitch = viewState.pitch;
    if (viewState.padding !== undefined) nextCamera.padding = viewState.padding;

    if (Object.keys(nextCamera).length > 0) {
      mapRef.current.jumpTo(nextCamera);
    }
  }, [viewState]);

  const largestValue = useMemo(() => {
    return Math.max(...data.filter(Boolean).map((d) => Number(d[measure])));
  }, [deferRender]);
  const smallestValue = useMemo(() => {
    return Math.min(...data.filter(Boolean).map((d) => Number(d[measure])));
  }, [deferRender]);

  const gradientId = useId();

  if (lnglatStream.length === 0 || data.length === 0) return null;

  return (
    <Surface>
      <Map
        ref={mapRef}
        initialViewState={viewState || {
          bounds: [
            edges.minLng - 0.0006, edges.minLat - 0.0006,
            edges.maxLng + 0.0006, edges.maxLat + 0.0006,
          ],
        }}
        style={{ height }}
        mapLib={maplibregl}
        onZoom={onZoom}
        onDrag={onDrag}
        mapStyle={isDarkReaderMode
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        }
      >
        <Marker
          ref={markerRef}
          latitude={latLngWithNulls[pointer]?.[0] || 0}
          longitude={latLngWithNulls[pointer]?.[1] || 0}
        >
          <Basic.Div $width={1.2} $height={1.2} $colorBg="gold" $borderRadius="50%" />
        </Marker>
        {routeLines.map((routeLine, ix) => (
          <Source
            data={routeLine}
            key={routeLine.features[0].geometry.coordinates[0].toString()}
            type="geojson"
            lineMetrics={true}
          >
            <Layer
              id={`hr-zones-layer-${ix}`}
              type="line"
              layout={{
                "line-cap": 'round'
              }}
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 15,
                'line-gradient': makeGradient(segmentedData[ix] || emptyArray),
              }}
            />
          </Source>
        ))}
        <FullscreenControl position="top-right" />
      </Map>
      {!deferRender && (
        <div>
          <svg width="100%" height="20">
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: `rgba(${activeMinColor[0]}, ${activeMinColor[1]}, ${activeMinColor[2]}, ${activeMinColor[3]})` }} />
              <stop offset="100%" style={{ stopColor: `rgba(${activeMaxColor[0]}, ${activeMaxColor[1]}, ${activeMaxColor[2]}, ${activeMaxColor[3]})` }} />
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
