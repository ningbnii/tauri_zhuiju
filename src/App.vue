<template>
  <router-view v-slot="{ Component }">
    <vue-page-stack>
      <component :is="Component" :key="$route.fullPath" />
    </vue-page-stack>
  </router-view>
  <Toaster />
</template>

<script setup>
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>

<style scoped></style>
