import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { DeckGlOverlay } from './deckgl-overlay';
import { GOOGLE_API_KEY } from '../constants';
import { selectActivity, selectStreamType } from '../reducers/activities';
import { selectHeartZones } from '../reducers/heartszones';
import { condenseZonesFromHeartRate } from '../utils';
import { hrZonesGraph } from '../colors/hrZones';

const ReactMap = ({ id }) => {
  const { data: latlngStreamData = [] } = useSelector((state) => selectStreamType(state, id, 'latlng')) || {};
  const activity = useSelector((state) => selectActivity(state, id)) || {};
  const heartRateStream = useSelector((state) => selectStreamType(state, id, 'heartrate'));
  const zones = useSelector((state) => selectHeartZones(state, activity.start_date));
  const lnglatStream = useMemo(() => latlngStreamData.map(([lat, lng]) => [lng, lat]), [latlngStreamData]);
  const hrzones = useMemo(() => condenseZonesFromHeartRate(zones, heartRateStream.data), [zones, heartRateStream.data]);

  const defaultCenter = useMemo(() => {
    if (!lnglatStream.length) return { lat: 37.74, lng: -122.4 };
    const maxLng = lnglatStream.reduce((max, [lng]) => Math.max(max, lng), -Infinity);
    const minLng = lnglatStream.reduce((min, [lng]) => Math.min(min, lng), Infinity);
    const maxLat = lnglatStream.reduce((max, [, lat]) => Math.max(max, lat), -Infinity);
    const minLat = lnglatStream.reduce((min, [, lat]) => Math.min(min, lat), Infinity);
    const lng = (maxLng + minLng) / 2;
    const lat = (maxLat + minLat) / 2;
    return { lat, lng };
  }, [lnglatStream]);

  const data = {
    type: 'FeatureCollection',
    features: hrzones.map(({ from, to, zone }, ix) => {
      return {
          type: 'Feature',
          properties: {
            name: 'Heart Rate Zones' + from,
            color: '#00aeef',
            zone,
          },
          geometry: {
            type: 'LineString',
            coordinates: lnglatStream.slice(ix > 1 ? from - 1 : from, to)
          }
        }
    })
  };

  return (
    <APIProvider apiKey={GOOGLE_API_KEY}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={14}
        mapId={'16b97c7bec9e1cd3'}
        gestureHandling={'greedy'}
        // disableDefaultUI={true}
      >
        <DeckGlOverlay
          layers={getDeckGlLayers(data)}
        />
      </Map>
    </APIProvider>
  );
};

function getDeckGlLayers(data) {
  if (!data) return [];

  return [
    new GeoJsonLayer({
      id: 'geojson-layer',
      data,
      stroked: false,
      filled: true,
      extruded: false,
      pointType: 'circle',
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [160, 160, 180, 200],
      getLineColor: (f) => {
        if (!f || !f.properties || !f.properties.zone) return [0, 0, 0];
        return hrZonesGraph[f.properties.zone];
      },
      getPointRadius: 200,
      getLineWidth: 0.1,
      getElevation: 0
    })
  ];
}

export default ReactMap;
