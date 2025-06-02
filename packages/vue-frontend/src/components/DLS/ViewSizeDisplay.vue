<script lang="ts" setup>
import useViewSize from '../hooks/useViewSize';

const viewSize = useViewSize();

</script>

<template>
  <div :class="`viewSize ${viewSize.viewSizeStr}`"></div>
</template>

<style lang="scss" scoped>
.viewSize {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 1);
  color: white;
  padding: 5px;
  font-size: 12px;
}

.xs {
  background-color: red;

  &::after {
    content: 'extra small';
  }
}

.sm {
  background-color: green;

  &::after {
    content: 'small';
  }
}

.md {
  background-color: blue;

  &::after {
    content: 'medium';
  }
}

.lg {
  background-color: #000000;

  &::after {
    content: 'large';
  }
}

.xl {
  background-color: #ff00dd;

  &::after {
    content: 'extra large';
  }
}
</style>