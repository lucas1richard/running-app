<script setup lang="ts">
import TileList from '@/components/Activities/TileList.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import Surface from '@/components/DLS/Surface.vue'
</script>

<template>
  <PageWrapper>
    <div class="flex gap">
      <div class="flex flex-column gap width-50">
        <div>
          <h2 class="text-h2 margin-b">All Time PRs</h2>
          <Surface variant="foreground" class="pad">
            Placeholder
          </Surface>
        </div>
        <div>
          <h2 class="text-h2 margin-b">Mileage</h2>
          <Surface variant="foreground" class="pad">
            Placeholder
          </Surface>
        </div>
        <div>
          <h2 class="text-h2 margin-b">Activities</h2>
          <TileList />
        </div>
      </div>
      <div class="flex flex-column gap width-50">
        <div>
          <h2 class="text-h2 margin-b">Metrics Over Time</h2>
          <Surface variant="foreground" class="pad">
            Placeholder
          </Surface>
        </div>
        <div>
          <h2 class="text-h2 margin-b">Heat Map - All Time</h2>
          <Surface variant="foreground" class="pad card">
            Placeholder
          </Surface>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
