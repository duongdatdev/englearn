<template>
  <VueFeather 
    :type="type" 
    :size="size" 
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :class="iconClass"
  />
</template>

<script setup>
import VueFeather from 'vue-feather'

defineProps({
  type: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 20
  },
  stroke: {
    type: String,
    default: 'currentColor'
  },
  strokeWidth: {
    type: [String, Number],
    default: 2
  },
  iconClass: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
