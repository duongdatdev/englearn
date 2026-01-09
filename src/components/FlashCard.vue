<template>
  <div class="flashcard-container">
    <div 
      class="flashcard" 
      :class="{ flipped: isFlipped }"
      @click="flip"
    >
      <div class="flashcard-front">
        <div class="flashcard-label">{{ frontLabel }}</div>
        <div class="flashcard-content">{{ frontContent }}</div>
        <div class="flashcard-hint">Click để lật thẻ</div>
      </div>
      <div class="flashcard-back">
        <div class="flashcard-section">
          <span class="section-label">Từ tiếng Anh</span>
          <span class="section-content english">{{ word.english }}</span>
        </div>
        <div class="flashcard-section">
          <span class="section-label">Nghĩa tiếng Việt</span>
          <span class="section-content vietnamese">{{ word.vietnamese }}</span>
        </div>
        <div class="flashcard-section" v-if="word.meaning">
          <span class="section-label">Định nghĩa</span>
          <span class="section-content meaning">{{ word.meaning }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  showSide: {
    type: String,
    default: 'english' // 'english', 'vietnamese', 'meaning'
  }
})

const isFlipped = ref(false)

const frontLabel = computed(() => {
  switch (props.showSide) {
    case 'english': return 'Từ tiếng Anh'
    case 'vietnamese': return 'Tiếng Việt'
    case 'meaning': return 'Định nghĩa'
    default: return 'Từ tiếng Anh'
  }
})

const frontContent = computed(() => {
  switch (props.showSide) {
    case 'english': return props.word.english
    case 'vietnamese': return props.word.vietnamese
    case 'meaning': return props.word.meaning
    default: return props.word.english
  }
})

function flip() {
  isFlipped.value = !isFlipped.value
}

function reset() {
  isFlipped.value = false
}

defineExpose({ reset })
</script>

<style scoped>
.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 320px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-2xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.flashcard-front {
  background-color: var(--card-bg);
  border: 2px solid var(--border-hover);
}

.flashcard-back {
  background-color: var(--mint-500);
  color: white;
  transform: rotateY(180deg);
  gap: 1rem;
  align-items: stretch;
}

.flashcard-label {
  font-size: 0.875rem;
  color: var(--mint-500);
  font-weight: 500;
  margin-bottom: 1rem;
}

.flashcard-content {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.flashcard-hint {
  position: absolute;
  bottom: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.flashcard-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

.section-content {
  font-weight: 500;
}

.section-content.english {
  font-size: 1.5rem;
}

.section-content.vietnamese {
  font-size: 1.25rem;
}

.section-content.meaning {
  font-size: 1rem;
  font-weight: 400;
  opacity: 0.9;
}
</style>
