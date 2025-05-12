<script lang="ts" setup>
import Surface from './components/DLS/Surface.vue';

</script>

<template>
  <div class="side-nav">
    <Surface variant="foreground">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/calendar">Calendar</RouterLink>
      <RouterLink to="/personal-records">Personal Records</RouterLink>
      <RouterLink to="/volume">Volume</RouterLink>
      <RouterLink to="/multi-map">Multi Map</RouterLink>
      <RouterLink to="/admin">Admin</RouterLink>
    </Surface>
  </div>
</template>

<style scoped>
  .side-nav {
    margin: 0;
    padding: 0;
    width: 200px;
    position: fixed;
    height: 100%;
    overflow: auto;
  }

  /* Sidebar links */
  a {
    display: block;
    padding: 0.5rem 0.5rem;
    text-decoration: none;
    font-weight: bold;
    text-decoration: none;
    font-size: 15px;
    display: block;
  }

  /* Active/current link */
  a:active {
    background-color: #04AA6D;
    color: white;
  }

  /* Links on mouse-over */
  a:hover:not(.active) {
    background-color: #555;
    color: white;
  }

  /* ${(props) => props.theme.breakpoints.down('md')} {
    width: 100%;
    height: auto;
    position: relative;
    a {
      float: left;
      text-align: center;
      float: none;
    } */
</style>