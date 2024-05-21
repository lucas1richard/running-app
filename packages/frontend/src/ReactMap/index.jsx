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
    const [lng, lat] = lnglatStream[0];
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
            type: 'MultiLineString',
            coordinates: [lnglatStream.slice(ix > 1 ? from - 1 : from, to)]
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
      lineWidthMinPixels: 4,
      getFillColor: [160, 160, 180, 200],
      getLineColor: (f) => {
        if (!f || !f.properties || !f.properties.zone) return [0, 0, 0];
        return hrZonesGraph[f.properties.zone];

        // // const hex = f.properties.color;
        // // const match = hex.match(/[0-9a-f]{2}/g);

        // // if (!match) return [0, 0, 0];

        // return match.map((x) => parseInt(x, 16));
      },
      // getLineColor: () => [255, 0, 255],
      getPointRadius: 200,
      getLineWidth: 1,
      getElevation: 0
    })
  ];
}

export default ReactMap;
