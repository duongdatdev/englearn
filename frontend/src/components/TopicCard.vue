<template>
  <div class="topic-card card card-clickable" @click="$emit('click')">
    <div class="topic-header">
      <span class="topic-icon">📝</span>
      <h4 class="topic-name">{{ topic.name }}</h4>
    </div>
    <div class="topic-meta">
      <span class="badge badge-mint">{{ wordCount }} từ</span>
    </div>
    <div class="topic-progress" v-if="progress > 0">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}% hoàn thành</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  topic: {
    type: Object,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])
</script>

<style scoped>
.topic-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.topic-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topic-icon {
  font-size: 1.5rem;
}

.topic-name {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
}

.topic-meta {
  display: flex;
  gap: 0.5rem;
}

.topic-progress {
  margin-top: 0.5rem;
}

.progress-bar {
  height: 6px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--mint-400);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
