<template>
  <div class="result-view animate-fadeIn">
    <div class="result-card card">
      <div class="result-header">
        <span class="result-icon"><FeatherIcon type="gift" :size="48" /></span>
        <h1>Hoàn thành!</h1>
      </div>
      
      <p class="result-message">
        Bạn đã hoàn thành bài học. Hãy tiếp tục học để tiến bộ hơn!
      </p>
      
      <div class="result-actions">
        <router-link to="/" class="btn btn-primary btn-lg">
          Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import FeatherIcon from '../components/FeatherIcon.vue'
</script>

<style scoped>
.result-view {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  text-align: center;
  max-width: 400px;
  padding: 3rem 2rem;
}

.result-header {
  margin-bottom: 1.5rem;
}

.result-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.result-message {
  color: var(--neutral-600);
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  justify-content: center;
}
</style>
