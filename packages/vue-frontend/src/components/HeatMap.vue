<script lang="ts" setup>
import {
  MglMap,
  MglGeoJsonSource,
  MglFillLayer,
  MglFullscreenControl,
} from '@indoorequal/vue-maplibre-gl';
import { computed, ref, useId } from 'vue';
import Surface from './DLS/Surface.vue';
import { injectIsDarkMode } from './hooks/useIsDarkMode';

type RGBATuple = [number, number, number, number];
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
  height?: string;
  floorValue?: number;
  ceilingValue?: number;
  squareSize?: number;
};
const {
  data,
  measure,
  deferRender,
  height = '60rem',
  minColor = [20, 20, 255, 0.25],
  maxColor = [255, 0, 0, 1],
  floorValue,
  ceilingValue,
  squareSize = 0.0001,
} = defineProps<HeatMapProps>()

const isDarkMode = injectIsDarkMode();

const activeMinColor = computed<RGBATuple>(() => isDarkMode.value
  ? [255 - minColor[0], 255 - minColor[1], 255 - minColor[2], minColor[3]]
  : minColor
);
const activeMaxColor = computed<RGBATuple>(() => isDarkMode.value
  ? [255 - maxColor[0], 255 - maxColor[1], 255 - maxColor[2], maxColor[3]]
  : maxColor
);

const heatmapSource = useId();
const heatmapSourceLight = useId();
const largestValue = computed(() => Math.max(...data.map((d) => Number(d[measure]))));
const smallestValue = computed(() => Math.min(...data.map((d) => Number(d[measure]))));

const gradientId = useId();

const edges = computed(() => {
  const maxLng = data.reduce((max, { lon }) => Math.max(max, Number(lon)), -90);
  const minLng = data.reduce((min, { lon }) => Math.min(min, Number(lon)), 90);
  const maxLat = data.reduce((max, { lat }) => Math.max(max, Number(lat)), -90);
  const minLat = data.reduce((min, { lat }) => Math.min(min, Number(lat)), 90);

  return { maxLng, minLng, maxLat, minLat };
});

const initialViewState = computed(() => {
  const deltaLng = edges.value.maxLng - edges.value.minLng;
  const deltaLat = edges.value.maxLat - edges.value.minLat;
  const bounds = [
    edges.value.minLng - deltaLng * 0.1, edges.value.minLat - deltaLat * 0.1,
    edges.value.maxLng + deltaLng * 0.1, edges.value.maxLat + deltaLat * 0.1,
  ] as [number, number, number, number];
  return ({
    bounds,
    pitch: 0,
    bearing: 0,
  })
});

const makeSquare = ({ lat, lon }: { lat: number, lon: number }, size = 0.0001) => {
  const delta = size / 2;
  const squareCoords = [
    [lon - delta, lat - delta], // bottom-left
    [lon - delta, lat + delta], // top-left
    [lon + delta, lat + delta], // top-right
    [lon + delta, lat - delta], // bottom-right
    [lon - delta, lat - delta], // bottom-left (to close the square)
  ] as [number, number][];

  return squareCoords;
};
const makeColor = (minColor: RGBATuple, maxColor: RGBATuple, percent: number) => {
  const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percent);
  const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percent);
  const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percent);
  const a = Math.max(minColor[3], Math.min(maxColor[3], percent));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
const pointSize = ref(squareSize);
const zoomHandler = (ar: any) => {
  const zoom = ar.map.transform.zoom;
  switch (true) {
    case zoom < 1: return pointSize.value = 0.8;
    case zoom < 2: return pointSize.value = 0.7;
    case zoom < 3: return pointSize.value = 0.6;
    case zoom < 4: return pointSize.value = 0.5;
    case zoom < 5: return pointSize.value = 0.4;
    case zoom < 6: return pointSize.value = 0.3;
    case zoom < 7: return pointSize.value = 0.1;
    case zoom < 8.5: return pointSize.value = 0.01;
    case zoom < 9: return pointSize.value = 0.00066;
    case zoom < 10: return pointSize.value = 0.00047;
    case zoom < 11: return pointSize.value = 0.0003;
    case zoom < 12: return pointSize.value = 0.0002;
    default: return pointSize.value = squareSize;
  }
};

const mapData = computed<GeoJSON.FeatureCollection>(() => {
  const res = data.map(({ lat, lon, [measure]: point }) => {
    const floor = floorValue !== undefined ? floorValue : smallestValue.value;
    const ceiling = ceilingValue !== undefined ? ceilingValue : largestValue.value;
    if (Number(point) < floor) point = smallestValue.value;
    if (Number(point) > ceiling) point = largestValue.value;
    const percent = (Number(point) - smallestValue.value) / (largestValue.value - smallestValue.value);
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [makeSquare({ lon: Number(lon), lat: Number(lat) }, pointSize.value)],
      },
      properties: { color: makeColor(activeMinColor.value, activeMaxColor.value, percent) },
    } satisfies GeoJSON.Feature
  });
  return { type: 'FeatureCollection', features: res };
})
</script>

<template>
  <div v-if="!deferRender">
    <!-- we need 2 instances because mgl-map crashes out when the map-style changes -->
    <Surface :style="`height: ${height}`" v-if="isDarkMode" class="card">
      <mgl-map
        @map:zoom="zoomHandler"
        :map-style="'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'"
        :bounds="initialViewState.bounds"
      >
        <mgl-geo-json-source
          :source-id="heatmapSource"
          :data="mapData"
        >
          <mgl-fill-layer
            :layer-id="heatmapSource"
            :paint="{ 'fill-color': ['get', 'color'] }"
          />
        </mgl-geo-json-source>
        <mgl-fullscreen-control position="top-right" />
      </mgl-map>
    </Surface>
    <Surface :style="`height: ${height}`" v-if="!isDarkMode" class="card">
      <mgl-map
        @map:zoom="zoomHandler"
        :map-style="'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'"
        :bounds="initialViewState.bounds"
      >
        <mgl-geo-json-source
          :source-id="heatmapSourceLight"
          :data="mapData"
        >
          <mgl-fill-layer
            :layer-id="heatmapSourceLight"
            :paint="{ 'fill-color': ['get', 'color'] }"
          />
        </mgl-geo-json-source>
        <mgl-fullscreen-control position="top-right" />
      </mgl-map>
    </Surface>
    <div>
      <svg width="100%" height="2rem">
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :style="`stop-color: rgb(${activeMinColor[0]}, ${activeMinColor[1]}, ${activeMinColor[2]}); stop-opacity: ${activeMinColor[3]};`" />
          <stop offset="100%" :style="`stop-color: rgb(${activeMaxColor[0]}, ${activeMaxColor[1]}, ${activeMaxColor[2]}); stop-opacity: ${activeMaxColor[3]};`" />
        </linearGradient>
        <rect x="0" y="0" width="100%" height="2rem" :fill="`url(#${gradientId})`" />
      </svg>
      <div class="flex flex-justify-between">
        <div>
          Lowest ({{ floorValue !== undefined ? `${floorValue} floor` : smallestValue }})
        </div>
        <div>
          Highest ({{ ceilingValue !== undefined ? `${ceilingValue} ceiling` : largestValue }})
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.container {
  height: 900px;
}
</style>