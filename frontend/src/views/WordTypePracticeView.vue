<template>
  <div class="word-type-view animate-fadeIn">
    <!-- Header -->
    <header class="view-header">
      <button class="btn-back" @click="goBack">
        <FeatherIcon type="arrow-left" :size="20" />
      </button>
      <div class="header-info">
        <h1 class="view-title">
          <FeatherIcon type="git-branch" :size="24" />
          Phân loại từ
        </h1>
        <p class="view-subtitle">{{ topic?.name || 'Luyện tập chung' }}</p>
      </div>
      <div class="header-progress" v-if="phase === 'quiz'">
        <span class="score-badge">
          <FeatherIcon type="award" :size="16" />
          {{ score }}/{{ totalQuestions }}
        </span>
      </div>
    </header>

    <!-- Loading State -->
    <div class="loading-state" v-if="loading">
      <div class="loading-spinner">
        <FeatherIcon type="loader" :size="48" class="spin" />
      </div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>

    <!-- Phase 1: Learn -->
    <section class="learn-phase" v-else-if="phase === 'learn'">
      <div class="learn-intro card">
        <div class="intro-icon">
          <FeatherIcon type="book-open" :size="48" />
        </div>
        <h2>Học về các loại từ</h2>
        <p>Trước khi làm quiz, hãy xem qua 8 loại từ cơ bản trong tiếng Anh.</p>
      </div>

      <!-- Word Type Cards -->
      <div class="word-types-grid">
        <div 
          class="word-type-card card" 
          v-for="(wordType, index) in wordTypes" 
          :key="index"
          :style="{ '--type-color': wordType.color }"
          :class="{ 'expanded': expandedCard === index }"
          @click="toggleCard(index)"
        >
          <div class="type-header">
            <span class="type-badge" :style="{ background: wordType.color }">
              {{ wordType.type }}
            </span>
            <span class="type-name-vi">{{ wordType.nameVi }}</span>
          </div>
          <p class="type-definition">{{ wordType.definition }}</p>
          
          <!-- Suffixes Section - Always visible for pattern recognition -->
          <div class="suffixes-section" v-if="wordType.suffixes?.length">
            <div class="suffixes-label">
              <FeatherIcon type="eye" :size="14" />
              Nhận biết qua đuôi từ:
            </div>
            <div class="suffixes-list">
              <span 
                class="suffix-tag" 
                v-for="(suffix, i) in wordType.suffixes" 
                :key="i"
                :style="{ background: wordType.color + '20', color: wordType.color, borderColor: wordType.color }"
              >
                {{ suffix }}
              </span>
            </div>
          </div>
          
          <!-- Expanded Content -->
          <div class="type-expanded" v-if="expandedCard === index">
            <!-- Suffix Examples -->
            <div class="suffix-examples" v-if="wordType.suffixExamples?.length">
              <span class="example-label">Ví dụ đuôi từ:</span>
              <div class="examples-list">
                <span 
                  class="example-word highlighted" 
                  v-for="(example, i) in wordType.suffixExamples" 
                  :key="'se-'+i"
                  :style="{ borderColor: wordType.color }"
                >
                  {{ example }}
                </span>
              </div>
            </div>
            
            <!-- Tips -->
            <div class="tips-box" v-if="wordType.tips" :style="{ background: wordType.color + '15', borderColor: wordType.color }">
              <FeatherIcon type="zap" :size="16" />
              <span>{{ wordType.tips }}</span>
            </div>
            
            <!-- Regular Examples -->
            <div class="type-examples" v-if="wordType.examples?.length">
              <span class="example-label">Ví dụ khác:</span>
              <div class="examples-list">
                <span 
                  class="example-word" 
                  v-for="(example, i) in wordType.examples" 
                  :key="'ex-'+i"
                  :style="{ borderColor: wordType.color }"
                >
                  {{ example }}
                </span>
              </div>
            </div>
          </div>
          
          <FeatherIcon 
            :type="expandedCard === index ? 'chevron-up' : 'chevron-down'" 
            :size="16" 
            class="expand-icon"
          />
        </div>
      </div>

      <button class="btn-primary btn-start-quiz" @click="startQuiz">
        <FeatherIcon type="play" :size="20" />
        Bắt đầu Quiz
      </button>
    </section>

    <!-- Phase 2: Quiz -->
    <section class="quiz-phase" v-else-if="phase === 'quiz'">
      <!-- Progress Bar -->
      <div class="quiz-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${(currentQuestion + 1) / totalQuestions * 100}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
      </div>

      <!-- Question Card -->
      <div class="question-card card" :class="{ 'answered': answered }">
        <div class="question-label">
          <FeatherIcon type="help-circle" :size="18" />
          Từ bôi đậm thuộc loại từ nào?
        </div>
        
        <p class="question-sentence" v-html="highlightedSentence"></p>

        <!-- Options -->
        <div class="options-grid">
          <button 
            v-for="option in currentQuestionData.options" 
            :key="option"
            class="option-btn"
            :class="{
              'selected': selectedAnswer === option,
              'correct': answered && option === currentQuestionData.correctAnswer,
              'incorrect': answered && selectedAnswer === option && option !== currentQuestionData.correctAnswer
            }"
            :disabled="answered"
            @click="selectAnswer(option)"
          >
            {{ option }}
            <FeatherIcon 
              v-if="answered && option === currentQuestionData.correctAnswer" 
              type="check-circle" 
              :size="18" 
            />
            <FeatherIcon 
              v-if="answered && selectedAnswer === option && option !== currentQuestionData.correctAnswer" 
              type="x-circle" 
              :size="18" 
            />
          </button>
        </div>

        <!-- Explanation -->
        <div class="explanation-box" v-if="answered">
          <div class="result-header" :class="isCorrect ? 'correct' : 'incorrect'">
            <FeatherIcon :type="isCorrect ? 'check-circle' : 'x-circle'" :size="24" />
            <span>{{ isCorrect ? 'Chính xác!' : 'Chưa đúng!' }}</span>
          </div>
          <p class="explanation-text">{{ currentQuestionData.explanation }}</p>
        </div>
      </div>

      <!-- Next Button -->
      <button 
        v-if="answered" 
        class="btn-primary btn-next" 
        @click="nextQuestion"
      >
        {{ isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo' }}
        <FeatherIcon :type="isLastQuestion ? 'flag' : 'arrow-right'" :size="18" />
      </button>
    </section>

    <!-- Phase 3: Result -->
    <section class="result-phase" v-else-if="phase === 'result'">
      <div class="result-card card">
        <div class="result-icon" :class="resultClass">
          <FeatherIcon :type="resultIcon" :size="64" />
        </div>
        <h2 class="result-title">{{ resultTitle }}</h2>
        <p class="result-score">{{ score }} / {{ totalQuestions }}</p>
        <p class="result-message">{{ resultMessage }}</p>
        
        <div class="result-actions">
          <button class="btn-secondary" @click="restartLearn">
            <FeatherIcon type="book-open" :size="18" />
            Học lại
          </button>
          <button class="btn-primary" @click="restartQuiz">
            <FeatherIcon type="refresh-cw" :size="18" />
            Làm lại Quiz
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTopicById, getWordsByTopicId } from '../db/database.js'
import { api } from '../services/api.js'
import { useSoundEffects } from '../composables/useSoundEffects.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const route = useRoute()
const router = useRouter()
const { playSound } = useSoundEffects()

// State
const topic = ref(null)
const words = ref([])
const loading = ref(true)
const loadingText = ref('Đang tải dữ liệu...')
const phase = ref('learn') // 'learn', 'quiz', 'result'

// Learn phase
const wordTypes = ref([])
const expandedCard = ref(null)

// Quiz phase
const questions = ref([])
const currentQuestion = ref(0)
const selectedAnswer = ref(null)
const answered = ref(false)
const score = ref(0)

const totalQuestions = computed(() => questions.value.length)
const isLastQuestion = computed(() => currentQuestion.value >= totalQuestions.value - 1)

const currentQuestionData = computed(() => {
  return questions.value[currentQuestion.value] || {
    sentence: '',
    targetWord: '',
    options: [],
    correctAnswer: '',
    explanation: ''
  }
})

const highlightedSentence = computed(() => {
  const sentence = currentQuestionData.value.sentence || ''
  // Replace **word** with highlighted span
  return sentence.replace(/\*\*([^*]+)\*\*/g, '<span class="highlight-word">$1</span>')
})

const isCorrect = computed(() => selectedAnswer.value === currentQuestionData.value.correctAnswer)

// Result computed
const resultClass = computed(() => {
  const percent = score.value / totalQuestions.value
  if (percent >= 0.8) return 'excellent'
  if (percent >= 0.6) return 'good'
  return 'needs-work'
})

const resultIcon = computed(() => {
  const percent = score.value / totalQuestions.value
  if (percent >= 0.8) return 'award'
  if (percent >= 0.6) return 'thumbs-up'
  return 'book'
})

const resultTitle = computed(() => {
  const percent = score.value / totalQuestions.value
  if (percent >= 0.8) return 'Xuất sắc!'
  if (percent >= 0.6) return 'Tốt lắm!'
  return 'Cần luyện thêm'
})

const resultMessage = computed(() => {
  const percent = score.value / totalQuestions.value
  if (percent >= 0.8) return 'Bạn đã nắm vững các loại từ trong tiếng Anh.'
  if (percent >= 0.6) return 'Bạn đang tiến bộ. Hãy tiếp tục luyện tập!'
  return 'Đừng nản! Hãy xem lại bài học và thử lại nhé.'
})

// Methods
function toggleCard(index) {
  expandedCard.value = expandedCard.value === index ? null : index
  playSound('click')
}

async function startQuiz() {
  loading.value = true
  loadingText.value = 'AI đang tạo câu hỏi...'
  playSound('click')
  
  try {
    const wordList = words.value.map(w => ({ english: w.english }))
    const result = await api.getWordTypeQuiz(wordList, 5)
    
    if (result.success && result.questions?.length > 0) {
      questions.value = result.questions
      currentQuestion.value = 0
      selectedAnswer.value = null
      answered.value = false
      score.value = 0
      phase.value = 'quiz'
    } else {
      console.error('Failed to load quiz:', result.message)
      alert('Không thể tạo quiz. Vui lòng thử lại.')
    }
  } catch (error) {
    console.error('Error loading quiz:', error)
    alert('Lỗi kết nối. Vui lòng thử lại.')
  }
  
  loading.value = false
}

function selectAnswer(option) {
  if (answered.value) return
  
  selectedAnswer.value = option
  answered.value = true
  
  if (option === currentQuestionData.value.correctAnswer) {
    score.value++
    playSound('success')
  } else {
    playSound('error')
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    phase.value = 'result'
    playSound('levelUp')
  } else {
    currentQuestion.value++
    selectedAnswer.value = null
    answered.value = false
    playSound('stepComplete')
  }
}

function restartLearn() {
  phase.value = 'learn'
  playSound('click')
}

function restartQuiz() {
  startQuiz()
}

function goBack() {
  router.back()
}

onMounted(async () => {
  try {
    const topicId = route.params.topicId
    
    // If topicId provided, load topic words
    if (topicId) {
      topic.value = await getTopicById(topicId)
      words.value = await getWordsByTopicId(topicId)
    }
    
    // Use default word types - grammar rules are fixed knowledge, no AI needed
    // This ensures suffixes and tips are always displayed correctly
    wordTypes.value = getDefaultWordTypes()
  } catch (error) {
    console.error('Error loading:', error)
    wordTypes.value = getDefaultWordTypes()
  }
  
  loading.value = false
})

function getDefaultWordTypes() {
  return [
    { 
      type: 'Noun', nameVi: 'Danh từ', 
      definition: 'Từ chỉ người, vật, địa điểm, khái niệm',
      suffixes: ['-tion', '-ment', '-ness', '-ity', '-er', '-or', '-ist', '-ism'],
      suffixExamples: ['information', 'development', 'happiness', 'ability', 'teacher'],
      examples: ['book', 'company', 'idea'],
      tips: 'Đa số từ kết thúc bằng -tion, -ment, -ness, -ity là danh từ',
      color: '#3B82F6' 
    },
    { 
      type: 'Verb', nameVi: 'Động từ', 
      definition: 'Từ chỉ hành động hoặc trạng thái',
      suffixes: ['-ize', '-ify', '-ate', '-en'],
      suffixExamples: ['organize', 'simplify', 'communicate', 'strengthen'],
      examples: ['run', 'think', 'become'],
      tips: 'Từ kết thúc bằng -ize, -ify, -ate thường là động từ',
      color: '#10B981' 
    },
    { 
      type: 'Adjective', nameVi: 'Tính từ', 
      definition: 'Từ mô tả tính chất của danh từ',
      suffixes: ['-ful', '-less', '-ous', '-ive', '-able', '-ible', '-al', '-ic'],
      suffixExamples: ['beautiful', 'careless', 'dangerous', 'active', 'comfortable'],
      examples: ['fast', 'important'],
      tips: 'Từ kết thúc bằng -ful, -less, -ous, -ive, -able thường là tính từ',
      color: '#F59E0B' 
    },
    { 
      type: 'Adverb', nameVi: 'Trạng từ', 
      definition: 'Từ bổ nghĩa cho động từ, tính từ, hoặc trạng từ khác',
      suffixes: ['-ly'],
      suffixExamples: ['quickly', 'carefully', 'happily', 'beautifully'],
      examples: ['very', 'always', 'never'],
      tips: 'Hầu hết trạng từ kết thúc bằng -LY (thêm -ly vào tính từ)',
      color: '#8B5CF6' 
    },
    { 
      type: 'Pronoun', nameVi: 'Đại từ', 
      definition: 'Từ thay thế cho danh từ',
      suffixes: ['-self', '-selves'],
      suffixExamples: ['myself', 'themselves', 'herself'],
      examples: ['he', 'she', 'they', 'it', 'we'],
      tips: 'Đại từ phản thân kết thúc bằng -self (số ít) hoặc -selves (số nhiều)',
      color: '#EC4899' 
    },
    { 
      type: 'Preposition', nameVi: 'Giới từ', 
      definition: 'Từ chỉ mối quan hệ vị trí, thời gian, hướng',
      suffixes: [],
      suffixExamples: [],
      examples: ['in', 'on', 'at', 'by', 'for', 'with', 'about'],
      tips: 'Giới từ thường đứng trước danh từ/đại từ để tạo cụm giới từ',
      color: '#06B6D4' 
    },
    { 
      type: 'Conjunction', nameVi: 'Liên từ', 
      definition: 'Từ nối các từ, cụm từ, mệnh đề',
      suffixes: [],
      suffixExamples: [],
      examples: ['and', 'but', 'or', 'because', 'although', 'while'],
      tips: 'Liên từ phối hợp: and, but, or. Liên từ phụ thuộc: because, although, when',
      color: '#F97316' 
    },
    { 
      type: 'Interjection', nameVi: 'Thán từ', 
      definition: 'Từ biểu thị cảm xúc mạnh mẽ',
      suffixes: [],
      suffixExamples: [],
      examples: ['wow', 'oh', 'oops', 'hey', 'ouch'],
      tips: 'Thán từ thường đứng một mình, theo sau bởi dấu chấm than (!)',
      color: '#EF4444' 
    }
  ]
}
</script>

<style scoped>
.word-type-view {
  padding-bottom: 2rem;
  min-height: 100vh;
}

/* Header */
.view-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--mint-100);
  color: var(--mint-600);
}

.header-info {
  flex: 1;
}

.view-title {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  margin: 0;
}

.view-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0.25rem 0 0;
}

.score-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loading-spinner {
  color: var(--mint-500);
}

.loading-text {
  color: var(--text-muted);
  font-size: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Learn Phase */
.learn-intro {
  text-align: center;
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.intro-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.learn-intro h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.learn-intro p {
  color: var(--text-muted);
}

.word-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.word-type-card {
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid var(--type-color, var(--mint-500));
  position: relative;
}

.word-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}

.type-name-vi {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.type-definition {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
}

/* Suffixes Section */
.suffixes-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-color);
}

.suffixes-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.suffixes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.suffix-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', monospace;
  border: 1px solid;
}

/* Expanded Content */
.type-expanded {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.suffix-examples {
  margin-bottom: 1rem;
}

.example-word.highlighted {
  font-weight: 600;
  background: var(--bg-tertiary);
}

.tips-box {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.tips-box svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.type-examples {
  margin-top: 0;
}

.example-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.5rem;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.example-word {
  padding: 0.25rem 0.6rem;
  background: var(--bg-tertiary);
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.expand-icon {
  position: absolute;
  right: 1rem;
  top: 1rem;
  color: var(--text-muted);
}

.btn-start-quiz {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Quiz Phase */
.quiz-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.question-card {
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.question-sentence {
  font-size: 1.35rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

:deep(.highlight-word) {
  font-weight: 700;
  color: var(--mint-600);
  background: rgba(16, 185, 129, 0.15);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.option-btn {
  padding: 1rem 1.25rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--mint-400);
  background: rgba(16, 185, 129, 0.05);
}

.option-btn.selected {
  border-color: var(--mint-500);
  background: rgba(16, 185, 129, 0.1);
}

.option-btn.correct {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.option-btn.incorrect {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.option-btn:disabled {
  cursor: default;
}

.explanation-box {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-tertiary);
  border-radius: 12px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.result-header.correct {
  color: #10B981;
}

.result-header.incorrect {
  color: #EF4444;
}

.explanation-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.btn-next {
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Result Phase */
.result-phase {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
}

.result-card {
  text-align: center;
  padding: 3rem 2rem;
  max-width: 400px;
  width: 100%;
}

.result-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.result-icon.excellent {
  background: linear-gradient(135deg, #10B981, #059669);
}

.result-icon.good {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.result-icon.needs-work {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.result-title {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.result-score {
  font-size: 3rem;
  font-weight: 700;
  color: var(--mint-500);
  margin-bottom: 0.5rem;
}

.result-message {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

@media (max-width: 640px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .word-types-grid {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
</style>
