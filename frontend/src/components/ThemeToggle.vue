<template>
  <button class="theme-toggle" @click="toggleTheme"
    :title="isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'">
    <FeatherIcon v-if="isDark" type="sun" :size="20" />
    <FeatherIcon v-else type="moon" :size="20" />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const isDark = ref(false)

onMounted(() => {
  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
})

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--mint-100);
  color: var(--mint-500);
}
</style>
