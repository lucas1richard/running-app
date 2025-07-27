<script lang="ts" setup>
import Surface from './components/DLS/Surface.vue';

</script>

<template>
  <div class="side-nav full-height">
    <Surface variant="foreground" class="full-height">
      <RouterLink class="text-h6" to="/">Home</RouterLink>
      <RouterLink class="text-h6" to="/calendar">Calendar</RouterLink>
      <RouterLink class="text-h6" to="/personal-records">Personal Records</RouterLink>
      <RouterLink class="text-h6" to="/volume">Volume</RouterLink>
      <RouterLink class="text-h6" to="/multi-map">Multi Map</RouterLink>
      <RouterLink class="text-h6" to="/admin">Admin</RouterLink>
    </Surface>
  </div>
</template>

<style lang="scss" scoped>
  @import "@/assets/theme.module.scss";

  .side-nav {
    margin: 0;
    padding: 0;
    width: 200px;
    position: fixed;
    height: 100%;
    overflow: auto;
  }

  a {
    color: var(--color-blue-400);
    display: block;
    padding: 0.5rem 0.5rem;
    text-decoration: none;
    text-decoration: none;
    display: block;

    @include hover-effect;
    &.router-link-exact-active {
      @include hovered();
    }
  }
</style>