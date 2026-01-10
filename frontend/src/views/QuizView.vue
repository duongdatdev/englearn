<template>
  <div class="quiz-view animate-fadeIn">
    <div class="quiz-header">
      <button class="btn btn-ghost" @click="goBack">
        ← Quay lại
      </button>
      <div class="quiz-mode-badge badge badge-mint">
        {{ modeName }}
      </div>
    </div>
    
    <QuizCard 
      v-if="words.length > 0 && !finished"
      :word="currentWord"
      :mode="mode"
      :current="currentIndex"
      :total="words.length"
      @answer="handleAnswer"
      @next="nextQuestion"
    />
    
    <div v-if="finished" class="quiz-result card animate-fadeIn">
      <div class="result-header">
        <span class="result-icon">{{ score >= words.length * 0.7 ? '🎉' : '📚' }}</span>
        <h2 class="result-title">Kết quả</h2>
      </div>
      
      <div class="result-score">
        <span class="score-value">{{ score }}</span>
        <span class="score-total">/ {{ words.length }}</span>
      </div>
      
      <div class="result-percentage">
        {{ Math.round((score / words.length) * 100) }}% chính xác
      </div>
      
      <div class="result-breakdown">
        <div class="breakdown-item correct">
          <span class="breakdown-icon">✓</span>
          <span>{{ score }} đúng</span>
        </div>
        <div class="breakdown-item wrong">
          <span class="breakdown-icon">✗</span>
          <span>{{ words.length - score }} sai</span>
        </div>
      </div>
      
      <div class="wrong-words" v-if="wrongWords.length > 0">
        <h3 class="wrong-title">Từ cần ôn lại:</h3>
        <div class="wrong-list">
          <div class="wrong-item" v-for="word in wrongWords" :key="word.id">
            <span class="word-en">{{ word.english }}</span>
            <span class="word-vn">{{ word.vietnamese }}</span>
          </div>
        </div>
      </div>
      
      <div class="result-actions">
        <button class="btn btn-secondary" @click="retry">
          🔄 Làm lại
        </button>
        <router-link :to="`/topic/${topicId}`" class="btn btn-primary">
          Quay lại chủ đề
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QuizCard from '../components/QuizCard.vue'
import { getWordsByTopicId, updateProgress } from '../db/database.js'

const route = useRoute()
const router = useRouter()

const topicId = computed(() => route.params.topicId)
const mode = computed(() => route.params.mode)

const words = ref([])
const currentIndex = ref(0)
const score = ref(0)
const finished = ref(false)
const wrongWords = ref([])

const currentWord = computed(() => words.value[currentIndex.value] || {})

const modeName = computed(() => {
  switch (mode.value) {
    case 'vn-en': return 'Việt → Anh'
    case 'en-vn': return 'Anh → Việt'
    case 'meaning-word': return 'Nghĩa → Từ'
    default: return ''
  }
})

onMounted(async () => {
  try {
    const allWords = await getWordsByTopicId(topicId.value)
    // Shuffle words for quiz
    words.value = allWords.sort(() => Math.random() - 0.5)
  } catch (error) {
    console.error('Error loading words:', error)
  }
})

function handleAnswer(correct) {
  if (correct) {
    score.value++
  } else {
    wrongWords.value.push(currentWord.value)
  }
  
  // Update progress in database
  updateProgress(currentWord.value.id, correct)
}

function nextQuestion() {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
  } else {
    finished.value = true
  }
}

function retry() {
  currentIndex.value = 0
  score.value = 0
  finished.value = false
  wrongWords.value = []
  words.value = words.value.sort(() => Math.random() - 0.5)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.quiz-view {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quiz-result {
  text-align: center;
  padding: 2rem;
}

.result-header {
  margin-bottom: 1.5rem;
}

.result-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.result-title {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.result-score {
  margin-bottom: 0.5rem;
}

.score-value {
  font-size: 4rem;
  font-weight: 700;
  color: var(--mint-500);
}

.score-total {
  font-size: 2rem;
  color: var(--text-muted);
}

.result-percentage {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.result-breakdown {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.breakdown-item.correct {
  color: #10b981;
}

.breakdown-item.wrong {
  color: #ef4444;
}

.breakdown-icon {
  font-size: 1.25rem;
}

.wrong-words {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.wrong-title {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wrong-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.wrong-item:last-child {
  border-bottom: none;
}

.word-en {
  font-weight: 500;
  color: var(--mint-500);
}

.word-vn {
  color: var(--text-muted);
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .result-actions {
    flex-direction: column;
  }
}
</style>
