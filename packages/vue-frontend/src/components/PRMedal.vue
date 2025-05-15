<script lang="ts" setup>
const { class: className, color } = defineProps({
  class: String,
  color: [Number, String, null]
})
</script>

<template>
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    fill="transparent"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    :class="className"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"     />
    <text
      x="12"
      y="9"
      text-anchor="middle"
      dominant-baseline="middle"
      stroke="black"
      font-size="11"
      font-weight={100}
    >
      {{ typeof color === 'number' ? color : color?.charAt(0).toUpperCase() }}
    </text>
  </svg>
</template>