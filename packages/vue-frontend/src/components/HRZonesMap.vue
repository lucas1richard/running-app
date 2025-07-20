<script lang="js" setup>
import { computed, useId } from 'vue';
import {
  MglMap,
  MglGeoJsonSource,
  MglLineLayer,
  MglFullscreenControl,
  MglMarker,
} from '@indoorequal/vue-maplibre-gl';
import { useActivitiesStore } from '@/stores/activities';
import useHeartZonesStore from '@/stores/heartzones';
import { condenseZonesFromHeartRate } from '../utils';
import { injectIsDarkMode } from './hooks/useIsDarkMode';
import { hrZonesGraph } from '@/utils/colors/hrZones';
import Surface from './DLS/Surface.vue';

const { id, animated = false, pointer = 0 } = defineProps({
  id: Number,
  animated: Boolean,
  pointer: Number,
})

const isDarkReaderMode = injectIsDarkMode();
const outlineSourceId = useId() || 'outlineSourceId';
const hrZonesSourceId = useId() || 'hrZonesSourceId';
const activitiesStore = useActivitiesStore();
const hrStore = useHeartZonesStore();

const latlngStreamData = activitiesStore.getStreamTypeData(id, 'latlng');
const heartRateStream = activitiesStore.getStreamTypeData(id, 'heartrate');
const activity = activitiesStore.activities[id];

const zones = hrStore.selectHeartZones(activity.start_date_local);
const lnglatStream = computed(() => latlngStreamData.value.map(([lat, lng]) => [lng, lat]));
const hrzones = computed(() => condenseZonesFromHeartRate(zones.value, heartRateStream.value));

const edges = computed(() => {
  const maxLng = lnglatStream.value.reduce((max, [lng]) => Math.max(max, lng), -Infinity);
  const minLng = lnglatStream.value.reduce((min, [lng]) => Math.min(min, lng), Infinity);
  const maxLat = lnglatStream.value.reduce((max, [, lat]) => Math.max(max, lat), -Infinity);
  const minLat = lnglatStream.value.reduce((min, [, lat]) => Math.min(min, lat), Infinity);

  return { maxLng, minLng, maxLat, minLat };
});

const data = computed(() => ({
  type: 'FeatureCollection',
  features: hrzones.value.map(({ from, to, zone }, ix) => {
    return {
      type: 'Feature',
      properties: {
        name: 'Heart Rate Zones' + from,
        color: hrZonesGraph[zone],
      },
      geometry: {
        type: 'LineString',
        coordinates: lnglatStream.value.slice(ix > 1 ? from - 1 : from, to)
      }
    }
  })
}));

const latlondata = computed(() => ({
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      name: 'Outline',
      color: isDarkReaderMode.value ? '#ffffff' : '#000000',
    },
    geometry: {
      type: 'LineString',
      coordinates: lnglatStream.value
    }
  }],
}));

// const mapRef = useRef(null);
// const animationRef = useRef(null);

// const animatedLineLayer = useCallback((time) => {
//   const coords = latlngStreamData[Math.floor((time / 5)) % latlngStreamData.length];
//   mapRef.current?.setLngLat({ lat: coords[0], lng: coords[1] });
//   animationRef.current = requestAnimationFrame(animatedLineLayer);
// }, []);

// useEffect(() => {
//   if (latlngStreamData.length === 0) return;
//   if (animated) animatedLineLayer(0);
//   return () => cancelAnimationFrame(animationRef.current);
// }, [animated, animatedLineLayer, latlngStreamData.length]);
</script>

<template>
  <div v-if="lnglatStream.length > 0">
    <Surface v-if="isDarkReaderMode" variant="foreground" class="full-height card">
      <mgl-map :bounds="[
        edges.minLng - 0.0006, edges.minLat - 0.0006,
        edges.maxLng + 0.0006, edges.maxLat + 0.0006,
      ]" height="100%" map-style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json">
        <mgl-marker :coordinates="lnglatStream[pointer]" color="#cc0000"></mgl-marker>
        <mgl-geo-json-source :data="latlondata" :source-id="outlineSourceId">
          <mgl-line-layer :layer-id="outlineSourceId" id="outline-layer" :paint="{
            'line-width': 7,
            'line-color': '#fff',
          }" />
        </mgl-geo-json-source>
        <mgl-geo-json-source :data="data" :source-id="hrZonesSourceId">
          <mgl-line-layer :layer-id="hrZonesSourceId" id="hr-zones-layer" :paint="{
            'line-color': ['get', 'color'],
            'line-width': 7
          }" />
          <mgl-fullscreen-control position="top-right" />
        </mgl-geo-json-source>
      </mgl-map>
    </Surface>
    <Surface v-if="!isDarkReaderMode" variant="foreground" class="full-height card">
      <mgl-map :bounds="[
        edges.minLng - 0.0006, edges.minLat - 0.0006,
        edges.maxLng + 0.0006, edges.maxLat + 0.0006,
      ]" height="100%" map-style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json">
        <mgl-marker :coordinates="lnglatStream[pointer]" color="#cc0000">
          <div class="marker"></div>
        </mgl-marker>
        <mgl-geo-json-source :data="latlondata" :source-id="outlineSourceId">
          <mgl-line-layer :layer-id="outlineSourceId" id="outline-layer" :paint="{
            'line-width': 10,
          }" />
        </mgl-geo-json-source>
        <mgl-geo-json-source :data="data" :source-id="hrZonesSourceId">
          <mgl-line-layer :layer-id="hrZonesSourceId" id="hr-zones-layer" :paint="{
            'line-color': ['get', 'color'],
            'line-width': 5
          }" />
          <mgl-fullscreen-control position="top-right" />
        </mgl-geo-json-source>
      </mgl-map>
    </Surface>
  </div>
</template>
