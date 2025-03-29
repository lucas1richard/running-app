import React, { useMemo } from 'react';
import { FullscreenControl, Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import maplibregl from 'maplibre-gl';
// import "maplibre-gl/dist/maplibre-gl.css";
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { emptyArray, emptyObject } from '../constants';
import { selectActivity, selectStreamTypeData } from '../reducers/activities';
import { selectHeartZones } from '../reducers/heartzones';
import { condenseZonesFromHeartRate } from '../utils';
import { useAppSelector } from '../hooks/redux';
import { DeckGlOverlay } from '../ReactMap/deckgl-overlay';
import { hrZonesGraph } from '../colors/hrZones';

function MapLibreHRZones({ id }) {
  const latlngStreamData = useAppSelector((state) => selectStreamTypeData(state, id, 'latlng')) || emptyObject;
  const activity = useAppSelector((state) => selectActivity(state, id)) || emptyObject;
  const heartRateStream = useAppSelector((state) => selectStreamTypeData(state, id, 'heartrate'));
  const zones = useAppSelector((state) => selectHeartZones(state, activity.start_date));
  const lnglatStream = useMemo(() => latlngStreamData.map(([lat, lng]) => [lng, lat]), [latlngStreamData]) || emptyArray;
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, heartRateStream), [zones, heartRateStream]);

  const edges = useMemo(() => {
    const maxLng = lnglatStream.reduce((max, [lng]) => Math.max(max, lng), -Infinity);
    const minLng = lnglatStream.reduce((min, [lng]) => Math.min(min, lng), Infinity);
    const maxLat = lnglatStream.reduce((max, [, lat]) => Math.max(max, lat), -Infinity);
    const minLat = lnglatStream.reduce((min, [, lat]) => Math.min(min, lat), Infinity);

    return { maxLng, minLng, maxLat, minLat };
  })
  
  const defaultCenter = useMemo(() => {
    if (!lnglatStream.length) return { lat: 37.74, lng: -122.4 };
    
    const lng = (edges.maxLng + edges.minLng) / 2;
    const lat = (edges.maxLat + edges.minLat) / 2;
    return { lat, lng };
  }, [lnglatStream]);

  const data = {
    type: 'FeatureCollection',
    features: hrzones.map(({ from, to, zone }, ix) => {
      return {
          type: 'Feature',
          properties: {
            name: 'Heart Rate Zones' + from,
            color: hrZonesGraph[zone],
          },
          geometry: {
            type: 'LineString',
            coordinates: lnglatStream.slice(ix > 1 ? from - 1 : from, to)
          }
        }
    })
  };

  if (lnglatStream.length === 0) return null;

  return (
    <Map
      initialViewState={{
        bounds: [
          edges.minLng - 0.0006, edges.minLat - 0.0006,
          edges.maxLng + 0.0006, edges.maxLat + 0.0006,
        ],
      }}
      mapLib={maplibregl}
      // mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <Source data={data} type="geojson" id="geojson-source">
        <Layer
          id="outline-layer"
          type="line"
          paint={{
            'line-width': 12
          }}
        />
        <Layer
          id="hr-zones-layer"
          type="line"
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 5
          }}
        />
        <FullscreenControl position="top-right" />
      </Source>
    </Map>
  );
}

export default MapLibreHRZones;
