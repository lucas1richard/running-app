import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FullscreenControl, Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
import { emptyArray } from '../constants';
import { selectStreamTypeMulti } from '../reducers/activities';
import { useAppSelector } from '../hooks/redux';
import { Basic, Button } from '../DLS';
import useDarkReaderMode from '../hooks/useDarkReaderMode';
import useHRZoneIndicators from '../Detail/RouteMap/useHRZoneIndicators';

function MultiMapMapLibre({
  indexPointer = undefined,
  activityConfigs,
}) {
  const isDarkReaderMode = useDarkReaderMode();
  const ids = useMemo(() => activityConfigs.map(({ id }) => id), [activityConfigs]);

  const [progress, setProgress] = useState(0);

  const latlngStreamArray = useAppSelector((state) => selectStreamTypeMulti(state, ids, 'latlng')) || emptyArray;
  const longestStream = latlngStreamArray.reduce((acc, val) => Math.max(acc, val?.length || 0), 0);

  const [animating, setAnimating] = useState(false);
  const [animationPointer, setAnimationPointer] = useState(0);
  const intervalRef = useRef(null);

  const usedPointer = animating
    ? animationPointer
    : indexPointer || progress;
  const coordsPure = useMemo(
    () => latlngStreamArray.filter(Boolean),
    [latlngStreamArray]
  );

  const indicatorColors = useHRZoneIndicators(ids, usedPointer, 20);

  const animate = useCallback(() => {
    const INCREMENT = 2;
    setAnimationPointer((prev) => {
      const nextPointer = (prev + INCREMENT) % longestStream;
      if (nextPointer < INCREMENT) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setAnimating(false);
      }
      return nextPointer;
    });
  }, [longestStream]);

  useEffect(() => {
    if (animating && !intervalRef.current) {
      intervalRef.current = setInterval(animate, 20);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [animate, animating, coordsPure.length]);

  const hoverProgress = useMemo(() => (
    <div className="flex flex-wrap height-4rem full-width dls-white-bg sunken-4">
      {new Array(longestStream).fill(0).map((_, ix) => (
        <div
          key={ix}
          className="flex-item-grow flex-item-shrink"
          onMouseOver={() => setProgress(ix)}
        />
      ))}
    </div>), [longestStream]);

  const edges = useMemo(() => {
    const coords = coordsPure.flat();
    const maxLng = coords.reduce((max, [, lon]) => Math.max(max, lon), -Infinity);
    const minLng = coords.reduce((min, [, lon]) => Math.min(min, lon), Infinity);
    const maxLat = coords.reduce((max, [lat]) => Math.max(max, lat), -Infinity);
    const minLat = coords.reduce((min, [lat]) => Math.min(min, lat), Infinity);

    return { maxLng, minLng, maxLat, minLat };
  }, [coordsPure])

  const data = useMemo(() => ({
    type: 'FeatureCollection',
    features: coordsPure.map((lnglatStream, ix) => ({
        type: 'Feature',
        properties: {
          color: [255,255,255]
        },
        geometry: {
          type: 'LineString',
          coordinates: lnglatStream.map(([lat, lng]) => [lng, lat]),
        }
    }))
  }), [coordsPure]);
  
  const mapRef = useRef(null);
  if (coordsPure.length === 0) return null;

  return (
    <Basic.Div $height="780px">
      <Map
        initialViewState={{
          bounds: [
            edges.minLng - 0.0006, edges.minLat - 0.0006,
            edges.maxLng + 0.0006, edges.maxLat + 0.0006,
          ],
        }}
        mapLib={maplibregl}
        mapStyle={isDarkReaderMode
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        }
      >
        {
          coordsPure.map((lnglatStream, ix) => {
            if (lnglatStream.length === 0) return null;
            const pointer = usedPointer >= lnglatStream.length ? lnglatStream.length - 1 : usedPointer;
            return (
              <Fragment key={ids[ix]}>
                <Marker
                  ref={mapRef}
                  latitude={lnglatStream[pointer][0]}
                  longitude={lnglatStream[pointer][1]}
                >
                  <Basic.Div $width={1} $height={1} style={{ background: indicatorColors[ix].fill}} $borderRadius="50%" />
                </Marker>
              </Fragment>
            )
          })
        }
        {/* @ts-expect-error -- deck.gl */}
        <Source data={data} type="geojson" id={`multimap-data`}>
          <Layer
            source={`multimap-data`}
            id="hr-zones-layer"
            type="line"
            paint={{
              'line-color': isDarkReaderMode ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)',
              'line-width': 5
            }}
          />
        </Source>
        <FullscreenControl position="top-right" />
      </Map>
      <div>
        <Button onClick={() => setAnimating((prev) => !prev)}>
          {animating ? 'Stop Animation' : 'Animate'}
        </Button>
      </div>

      {isNaN(indexPointer) && (
        <div>
          Hover to see progress on the map &darr;
          {hoverProgress}
        </div>
      )}
    </Basic.Div>
  );
}

export default MultiMapMapLibre;
