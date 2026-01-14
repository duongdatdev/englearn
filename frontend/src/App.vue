<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <!-- AI Assistant only for authenticated users -->
    <AIAssistant v-if="isAuthenticated" />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import AIAssistant from './components/AIAssistant.vue'
import { useAuth } from './composables/useAuth.js'

const { isAuthenticated } = useAuth()
</script>

<style>
.main-content {
  min-height: calc(100vh - 68px);
  padding: 2rem;
  max-width: 1320px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.25rem;
  }
}
</style>
