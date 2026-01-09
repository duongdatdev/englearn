<template>
  <div class="flashcard-view animate-fadeIn">
    <div class="flashcard-header">
      <button class="btn btn-ghost" @click="goBack">
        ← Quay lại
      </button>
      <div class="flashcard-progress">
        {{ currentIndex + 1 }} / {{ words.length }}
      </div>
    </div>
    
    <div class="flashcard-area" v-if="words.length > 0">
      <FlashCard 
        ref="flashcardRef"
        :word="currentWord" 
        :show-side="showSide"
      />
    </div>
    
    <div class="flashcard-controls">
      <button 
        class="btn btn-secondary btn-icon" 
        @click="prevCard"
        :disabled="currentIndex === 0"
      >
        ←
      </button>
      
      <div class="control-center">
        <button class="btn btn-ghost" @click="shuffleCards">
          🔀 Xáo trộn
        </button>
        
        <select v-model="showSide" class="side-select">
          <option value="english">Hiện tiếng Anh</option>
          <option value="vietnamese">Hiện tiếng Việt</option>
          <option value="meaning">Hiện định nghĩa</option>
        </select>
      </div>
      
      <button 
        class="btn btn-secondary btn-icon" 
        @click="nextCard"
        :disabled="currentIndex === words.length - 1"
      >
        →
      </button>
    </div>
    
    <div class="progress-dots">
      <span 
        v-for="(_, index) in words" 
        :key="index"
        class="dot"
        :class="{ active: index === currentIndex }"
        @click="goToCard(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FlashCard from '../components/FlashCard.vue'
import { getWordsByTopicId } from '../db/database.js'

const route = useRoute()
const router = useRouter()
const flashcardRef = ref(null)
const words = ref([])
const currentIndex = ref(0)
const showSide = ref('english')

const currentWord = computed(() => words.value[currentIndex.value] || {})

onMounted(async () => {
  try {
    const topicId = route.params.topicId
    words.value = await getWordsByTopicId(topicId)
  } catch (error) {
    console.error('Error loading words:', error)
  }
})

function prevCard() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    flashcardRef.value?.reset()
  }
}

function nextCard() {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
    flashcardRef.value?.reset()
  }
}

function goToCard(index) {
  currentIndex.value = index
  flashcardRef.value?.reset()
}

function shuffleCards() {
  for (let i = words.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words.value[i], words.value[j]] = [words.value[j], words.value[i]]
  }
  currentIndex.value = 0
  flashcardRef.value?.reset()
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.flashcard-view {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.flashcard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.flashcard-progress {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-muted);
}

.flashcard-area {
  margin-bottom: 2rem;
}

.flashcard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.control-center {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.side-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--input-bg);
  cursor: pointer;
}

.side-select:focus {
  outline: none;
  border-color: var(--mint-400);
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dot:hover {
  background-color: var(--mint-300);
}

.dot.active {
  background-color: var(--mint-500);
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .control-center {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .flashcard-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
