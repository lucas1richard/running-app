<script lang="ts" setup>
import prColors from '@/utils/colors/prColors';

type PRMedalProps = {
  class?: string;
  color: 'gold' | 'silver' | 'bronze' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  type: 'native' | 'svg';
};
const { class: className, color, type } = defineProps<PRMedalProps>()
const rankMap = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
  8: '8th',
  9: '9th',
  10: '10th',
}
</script>

<template>
  <span v-if="type === 'native'">{{ rankMap[color] }}</span>
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    :fill="prColors[color as keyof typeof prColors]?.fill || 'transparent'"
    :stroke="prColors[color as keyof typeof prColors]?.stroke || 'black'"
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