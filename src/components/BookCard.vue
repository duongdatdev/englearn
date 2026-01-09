<template>
  <div class="book-card card card-clickable" @click="$emit('click')">
    <div class="book-icon">{{ book.coverImage || '📚' }}</div>
    <div class="book-info">
      <h3 class="book-name">{{ book.name }}</h3>
      <p class="book-description" v-if="book.description">{{ book.description }}</p>
      <div class="book-meta">
        <span class="badge badge-mint">{{ topicCount }} chủ đề</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  book: {
    type: Object,
    required: true
  },
  topicCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])
</script>

<style scoped>
.book-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.book-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-name {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.book-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-meta {
  display: flex;
  gap: 0.5rem;
}
</style>
