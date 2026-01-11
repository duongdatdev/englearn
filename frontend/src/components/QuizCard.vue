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
      <input ref="inputRef" type="text" class="input input-lg"
        :class="{ 'input-correct': showResult && isCorrect, 'input-wrong': showResult && !isCorrect }" v-model="answer"
        :placeholder="placeholder" @keyup.enter="checkAnswer" :disabled="showResult">
    </div>

    <!-- AI Suggestion -->
    <div class="ai-suggestion" v-if="aiSuggestion && !isCorrect">
      <FeatherIcon type="cpu" :size="18" class="suggestion-icon" />
      <span class="suggestion-text">{{ aiSuggestion }}</span>
    </div>

    <div class="quiz-result" v-if="showResult">
      <div class="result-badge" :class="isCorrect ? 'result-correct' : 'result-wrong'">
        <FeatherIcon v-if="isCorrect" type="check" :size="16" />
        <FeatherIcon v-else type="x" :size="16" />
        {{ isCorrect ? 'Chính xác!' : 'Sai rồi!' }}
      </div>
      <div class="correct-answer" v-if="!isCorrect">
        <span class="label">Đáp án đúng:</span>
        <span class="answer">{{ correctAnswer }}</span>
      </div>

      <!-- AI Hint Section -->
      <div class="ai-hint-section" v-if="!isCorrect">
        <button class="btn btn-ghost btn-sm ai-hint-btn" @click="getAIHint" :disabled="loadingHint">
          <FeatherIcon v-if="loadingHint" type="loader" :size="14" class="spin" />
          <FeatherIcon v-else type="zap" :size="14" />
          {{ loadingHint ? 'Đang tải...' : 'Xem gợi ý AI' }}
        </button>
        <div class="ai-hint-box" v-if="aiHint">
          <div class="hint-content">
            <strong>Gợi ý:</strong> {{ aiHint.hint }}
          </div>
          <div class="memory-tip" v-if="aiHint.memoryTip">
            <strong>Mẹo nhớ:</strong> {{ aiHint.memoryTip }}
          </div>
        </div>
      </div>
    </div>

    <div class="quiz-actions">
      <button v-if="!showResult" class="btn btn-primary btn-lg" @click="checkAnswer"
        :disabled="!answer.trim() || checkingAI">
        <FeatherIcon v-if="checkingAI" type="loader" :size="16" class="spin" />
        <FeatherIcon v-else type="cpu" :size="16" />
        {{ checkingAI ? 'Đang kiểm tra...' : 'Kiểm tra' }}
      </button>
      <button v-else class="btn btn-primary btn-lg" @click="$emit('next')">
        {{ current + 1
          < total ? 'Tiếp theo' : 'Xem kết quả' }} <FeatherIcon type="arrow-right" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { api } from '../services/api.js'
import FeatherIcon from './FeatherIcon.vue'

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
const checkingAI = ref(false)
const aiSuggestion = ref('')
const aiHint = ref(null)
const loadingHint = ref(false)

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

async function checkAnswer() {
  if (!answer.value.trim()) return

  const userAnswer = normalize(answer.value)
  const correct = normalize(correctAnswer.value)

  // Quick local check first
  let localCorrect = false
  if (props.mode === 'en-vn') {
    const correctAnswers = correct.split(',').map(a => normalize(a))
    localCorrect = correctAnswers.some(a => userAnswer.includes(a) || a.includes(userAnswer))
  } else {
    localCorrect = userAnswer === correct
  }

  // If local check passes, mark as correct immediately
  if (localCorrect) {
    isCorrect.value = true
    showResult.value = true
    emit('answer', true)
    return
  }

  // Use AI for semantic checking
  checkingAI.value = true
  try {
    const context = props.mode === 'en-vn'
      ? `Chế độ: Anh → Việt. Từ gốc: ${props.word.english}`
      : props.mode === 'vn-en'
        ? `Chế độ: Việt → Anh. Từ gốc: ${props.word.vietnamese}`
        : `Chế độ: Nghĩa → Từ. Nghĩa: ${props.word.meaning}`

    const result = await api.checkSpelling(answer.value, correctAnswer.value, context)

    if (result.success) {
      isCorrect.value = result.isCorrect
      if (!result.isCorrect && result.suggestion) {
        aiSuggestion.value = result.explanation || `Có phải bạn muốn nói: ${result.suggestion}?`
      }
    } else {
      // Fallback to local check if AI fails
      isCorrect.value = localCorrect
    }
  } catch (e) {
    console.error('AI check failed:', e)
    isCorrect.value = localCorrect
  }

  checkingAI.value = false
  showResult.value = true
  emit('answer', isCorrect.value)
}

async function getAIHint() {
  loadingHint.value = true
  try {
    const question = `${questionLabel.value} ${questionContent.value}`
    const result = await api.getQuizHint(question, answer.value, correctAnswer.value)
    if (result.success) {
      aiHint.value = result
    }
  } catch (e) {
    console.error('Get hint failed:', e)
  }
  loadingHint.value = false
}

watch(() => props.word, () => {
  answer.value = ''
  showResult.value = false
  isCorrect.value = false
  aiSuggestion.value = ''
  aiHint.value = null
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
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

.quiz-actions .btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* AI Features Styles */
.ai-suggestion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.suggestion-icon {
  color: var(--mint-500);
}

.suggestion-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ai-hint-section {
  margin-top: 1rem;
  text-align: center;
}

.ai-hint-btn {
  color: var(--mint-500);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.ai-hint-btn:hover {
  background: rgba(16, 185, 129, 0.1);
}

.ai-hint-box {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  text-align: left;
}

.hint-content,
.memory-tip {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hint-content {
  margin-bottom: 0.5rem;
}

.hint-content strong,
.memory-tip strong {
  color: var(--mint-500);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
