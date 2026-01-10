<template>
  <div class="quiz-card card">
    <div class="quiz-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ current + 1 }} / {{ total }}</span>
    </div>
    
    <div class="quiz-question">
      <span class="question-label">{{ questionLabel }}</span>
      <span class="question-content">{{ questionContent }}</span>
    </div>
    
    <div class="quiz-answer">
      <input 
        ref="inputRef"
        type="text" 
        class="input input-lg"
        :class="{ 'input-correct': showResult && isCorrect, 'input-wrong': showResult && !isCorrect }"
        v-model="answer"
        :placeholder="placeholder"
        @keyup.enter="checkAnswer"
        :disabled="showResult"
      >
    </div>
    
    <div class="quiz-result" v-if="showResult">
      <div class="result-badge" :class="isCorrect ? 'result-correct' : 'result-wrong'">
        {{ isCorrect ? '✓ Chính xác!' : '✗ Sai rồi!' }}
      </div>
      <div class="correct-answer" v-if="!isCorrect">
        <span class="label">Đáp án đúng:</span>
        <span class="answer">{{ correctAnswer }}</span>
      </div>
    </div>
    
    <div class="quiz-actions">
      <button 
        v-if="!showResult" 
        class="btn btn-primary btn-lg" 
        @click="checkAnswer"
        :disabled="!answer.trim()"
      >
        Kiểm tra
      </button>
      <button 
        v-else 
        class="btn btn-primary btn-lg" 
        @click="$emit('next')"
      >
        {{ current + 1 < total ? 'Tiếp theo' : 'Xem kết quả' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    required: true // 'vn-en', 'en-vn', 'meaning-word'
  },
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['next', 'answer'])

const inputRef = ref(null)
const answer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)

const progressPercent = computed(() => ((props.current + 1) / props.total) * 100)

const questionLabel = computed(() => {
  switch (props.mode) {
    case 'vn-en': return 'Dịch sang tiếng Anh:'
    case 'en-vn': return 'Dịch sang tiếng Việt:'
    case 'meaning-word': return 'Viết từ tiếng Anh tương ứng:'
    default: return ''
  }
})

const questionContent = computed(() => {
  switch (props.mode) {
    case 'vn-en': return props.word.vietnamese
    case 'en-vn': return props.word.english
    case 'meaning-word': return props.word.meaning
    default: return ''
  }
})

const placeholder = computed(() => {
  switch (props.mode) {
    case 'vn-en': return 'Nhập từ tiếng Anh...'
    case 'en-vn': return 'Nhập nghĩa tiếng Việt...'
    case 'meaning-word': return 'Nhập từ tiếng Anh...'
    default: return ''
  }
})

const correctAnswer = computed(() => {
  switch (props.mode) {
    case 'vn-en': return props.word.english
    case 'en-vn': return props.word.vietnamese
    case 'meaning-word': return props.word.english
    default: return ''
  }
})

function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

function checkAnswer() {
  if (!answer.value.trim()) return
  
  const userAnswer = normalize(answer.value)
  const correct = normalize(correctAnswer.value)
  
  // For Vietnamese, allow multiple correct answers separated by comma
  if (props.mode === 'en-vn') {
    const correctAnswers = correct.split(',').map(a => normalize(a))
    isCorrect.value = correctAnswers.some(a => userAnswer.includes(a) || a.includes(userAnswer))
  } else {
    isCorrect.value = userAnswer === correct
  }
  
  showResult.value = true
  emit('answer', isCorrect.value)
}

watch(() => props.word, () => {
  answer.value = ''
  showResult.value = false
  isCorrect.value = false
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.quiz-card {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiz-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--mint-400);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.quiz-question {
  text-align: center;
  padding: 1.5rem 0;
}

.question-label {
  display: block;
  font-size: 0.875rem;
  color: var(--mint-500);
  margin-bottom: 0.5rem;
}

.question-content {
  display: block;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.quiz-answer {
  padding: 0 1rem;
}

.input-correct {
  border-color: var(--success) !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
}

.input-wrong {
  border-color: var(--error) !important;
  background-color: rgba(239, 68, 68, 0.1) !important;
}

.quiz-result {
  text-align: center;
}

.result-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.result-correct {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.result-wrong {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.correct-answer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.correct-answer .label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.correct-answer .answer {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--mint-500);
}

.quiz-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}
</style>
