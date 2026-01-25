<template>
  <div class="speaking-practice animate-fadeIn">
    <div class="header">
      <button class="btn btn-ghost" @click="$router.back()">
        <FeatherIcon type="arrow-left" :size="20" /> Quay lại
      </button>
      <h1>Luyện nói & Phát âm</h1>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button class="tab-btn" :class="{ active: activeTab === 'vocabulary' }" @click="activeTab = 'vocabulary'">
        <FeatherIcon type="book" :size="18" />
        Đọc Từ Vựng
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'paragraph' }" @click="activeTab = 'paragraph'">
        <FeatherIcon type="file-text" :size="18" />
        Đọc Đoạn Văn
      </button>
    </div>

    <!-- Tab: Vocabulary Reading -->
    <div class="card practice-container" v-if="activeTab === 'vocabulary'">
      <!-- Word Selection -->
      <div class="word-selection" v-if="!selectedWord">
        <h3>Chọn từ để luyện đọc</h3>
        <p class="hint-text" v-if="learnedWords.length === 0">
          Bạn chưa học từ nào. Hãy học từ trước để luyện phát âm!
        </p>
        <div class="word-chips" v-else>
          <button v-for="word in learnedWords" :key="word.wordId" class="word-chip" @click="selectWord(word)">
            {{ word.word }}
          </button>
        </div>
      </div>

      <!-- Practice Word -->
      <div v-else>
        <div class="target-section">
          <span class="label">Từ cần đọc:</span>
          <h2 class="target-word">{{ selectedWord.word }}</h2>
          <p class="word-meaning">{{ selectedWord.vietnamese }}</p>
          <button class="btn-icon speak-sample" @click="speakSample(selectedWord.word)">
            <FeatherIcon type="volume-2" :size="24" />
          </button>
        </div>

        <!-- Recording Area -->
        <div class="recording-area" :class="{ listening: isRecording }">
          <div class="visualizer">
            <div v-for="i in 5" :key="i" class="bar"></div>
          </div>

          <button class="mic-button" @click="toggleRecording" :disabled="isAnalyzing">
            <FeatherIcon :type="isRecording ? 'mic-off' : 'mic'" :size="48" />
          </button>

          <p class="status-text">{{ statusText }}</p>

          <div class="error-box" v-if="speechError && !isRecording">
            <FeatherIcon type="alert-triangle" :size="16" />
            {{ speechError }}
          </div>
        </div>

        <!-- Result -->
        <div class="result-area" v-if="(transcript || feedback) && !isRecording">
          <div class="transcript-box">
            <p class="label">Bạn nói:</p>
            <p class="transcript-text" :class="{ correct: isCorrect, incorrect: !isCorrect && transcript }">
              {{ transcript || '...' }}
            </p>
          </div>

          <div class="feedback-card" v-if="feedback" :class="{ success: isCorrect, warning: !isCorrect }">
            <div class="feedback-header">
              <FeatherIcon :type="isCorrect ? 'check-circle' : 'alert-circle'" :size="24" />
              <h3>{{ isCorrect ? 'Chính xác!' : 'Chưa chuẩn lắm' }}</h3>
              <span class="score-badge" v-if="score">{{ score }}/100</span>
            </div>
            <p class="feedback-text">{{ feedback }}</p>
            <div class="tips-box" v-if="tips">
              <FeatherIcon type="zap" :size="14" /> <strong>Mẹo:</strong> {{ tips }}
            </div>
          </div>
        </div>

        <button class="btn btn-secondary" @click="selectedWord = null; resetState()">
          <FeatherIcon type="arrow-left" :size="16" /> Chọn từ khác
        </button>
      </div>
    </div>

    <!-- Tab: Paragraph Reading -->
    <div class="card practice-container" v-if="activeTab === 'paragraph'">
      <!-- Paragraph Input -->
      <div v-if="!paragraphText">
        <h3>Nhập hoặc tạo đoạn văn</h3>

        <div class="input-section">
          <textarea v-model="customParagraph" placeholder="Nhập đoạn văn tiếng Anh bạn muốn luyện đọc..." rows="4"
            class="paragraph-input"></textarea>

          <div class="action-buttons">
            <button class="btn btn-primary" @click="useParagraph" :disabled="!customParagraph.trim()">
              <FeatherIcon type="check" :size="16" /> Sử dụng đoạn văn này
            </button>
            <span class="divider-text">hoặc</span>
            <button class="btn btn-secondary" @click="generatePassage" :disabled="isGenerating">
              <FeatherIcon type="cpu" :size="16" />
              {{ isGenerating ? 'Đang tạo...' : 'AI Tạo Đoạn Văn' }}
            </button>
          </div>

          <!-- Topic selection for AI -->
          <div class="topic-selector" v-if="showTopicSelector">
            <label>Chủ đề:</label>
            <select v-model="selectedTopic">
              <option value="Daily life">Cuộc sống hàng ngày</option>
              <option value="Business">Công việc văn phòng</option>
              <option value="Travel">Du lịch</option>
              <option value="Technology">Công nghệ</option>
              <option value="Education">Giáo dục</option>
              <option value="Health">Sức khỏe</option>
            </select>
            <button class="btn btn-primary btn-sm" @click="confirmGeneratePassage">
              Tạo
            </button>
          </div>
        </div>
      </div>

      <!-- Practice Paragraph -->
      <div v-else class="practice-paragraph-section">
        <!-- Paragraph Card -->
        <div class="paragraph-card">
          <div class="paragraph-header">
            <FeatherIcon type="file-text" :size="20" />
            <span>Đoạn văn cần đọc</span>
          </div>

          <!-- Before analysis: show plain text -->
          <div class="paragraph-content" v-if="!wordAnalysis.length">
            {{ paragraphText }}
          </div>

          <!-- After analysis: show colored words -->
          <div class="paragraph-content analyzed" v-else>
            <span v-for="(wordData, index) in wordAnalysis" :key="index" class="word-span" :class="wordData.status"
              @click="selectWordForDetail(wordData)">
              {{ wordData.word }}
            </span>
          </div>

          <button class="speak-sample-btn" @click="speakSample(paragraphText)">
            <FeatherIcon type="volume-2" :size="18" />
            <span>Nghe mẫu</span>
          </button>
        </div>

        <!-- Recording Section -->
        <div class="recording-section">
          <div class="recording-area" :class="{ listening: isRecording }">
            <div class="visualizer">
              <div v-for="i in 5" :key="i" class="bar"></div>
            </div>

            <button class="mic-button" @click="toggleParagraphRecording" :disabled="isAnalyzing">
              <FeatherIcon :type="isRecording ? 'mic-off' : 'mic'" :size="40" />
            </button>

            <p class="status-text">{{ statusText }}</p>
          </div>

          <div class="error-box" v-if="speechError && !isRecording">
            <FeatherIcon type="alert-triangle" :size="16" />
            {{ speechError }}
          </div>
        </div>

        <!-- Overall Result -->
        <div class="result-area" v-if="paragraphFeedback && !isRecording">
          <div class="feedback-card" :class="{ success: score >= 70, warning: score < 70 }">
            <div class="feedback-header">
              <FeatherIcon :type="score >= 70 ? 'check-circle' : 'alert-circle'" :size="24" />
              <h3>{{ score >= 70 ? 'Tốt lắm!' : 'Cần cải thiện' }}</h3>
              <span class="score-badge">{{ score }}/100</span>
            </div>
            <p class="feedback-text">{{ paragraphFeedback }}</p>

            <div class="legend">
              <span class="legend-item correct"><span class="dot"></span> Đọc đúng</span>
              <span class="legend-item warning"><span class="dot"></span> Cần cải thiện</span>
              <span class="legend-item incorrect"><span class="dot"></span> Đọc sai</span>
            </div>
            <p class="hint-text">Click vào từ được đánh dấu để xem hướng dẫn sửa</p>
          </div>
        </div>

        <!-- Word Detail Modal -->
        <div class="word-detail-modal" v-if="selectedWordDetail">
          <div class="modal-content">
            <button class="close-btn" @click="selectedWordDetail = null">
              <FeatherIcon type="x" :size="20" />
            </button>
            <h3 :class="selectedWordDetail.status">{{ selectedWordDetail.word }}</h3>
            <p v-if="selectedWordDetail.spokenAs && selectedWordDetail.spokenAs !== selectedWordDetail.word">
              <strong>Bạn đọc:</strong> "{{ selectedWordDetail.spokenAs }}"
            </p>
            <p><strong>Nhận xét:</strong> {{ selectedWordDetail.feedback }}</p>
            <p v-if="selectedWordDetail.tip" class="tip-text">
              <FeatherIcon type="zap" :size="14" /> <strong>Mẹo sửa:</strong> {{ selectedWordDetail.tip }}
            </p>
          </div>
        </div>

        <!-- Back Button -->
        <div class="action-footer">
          <button class="btn btn-ghost" @click="resetParagraph">
            <FeatherIcon type="rotate-ccw" :size="16" /> Đọc lại
          </button>
          <button class="btn btn-secondary" @click="resetParagraph">
            <FeatherIcon type="edit-3" :size="16" /> Chọn đoạn văn khác
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAudioRecorder } from '../composables/useAudioRecorder'
import { api } from '../services/api'
import { getAllProgress } from '../services/srs'
import FeatherIcon from '../components/FeatherIcon.vue'

const { isRecording, audioBlob, error: recorderError, startRecording, stopRecording, isSupported } = useAudioRecorder()

// Tab state
const activeTab = ref('vocabulary')

// Common state
const feedback = ref(null)
const tips = ref(null)
const score = ref(0)
const isCorrect = ref(false)
const isAnalyzing = ref(false)
const transcript = ref('')
const speechError = ref(null)

// Vocabulary tab state
const learnedWords = ref([])
const selectedWord = ref(null)

// Paragraph tab state
const customParagraph = ref('')
const paragraphText = ref('')
const paragraphTranslation = ref('')
const isGenerating = ref(false)
const showTopicSelector = ref(false)
const selectedTopic = ref('Daily life')
const wordAnalysis = ref([])
const paragraphFeedback = ref('')
const selectedWordDetail = ref(null)

// Sync recorder error to local error state
watch(recorderError, (val) => {
  if (val) speechError.value = val
})

onMounted(() => {
  if (!isSupported) {
    alert('Trình duyệt của bạn không hỗ trợ ghi âm. Vui lòng thử Chrome hoặc Edge.')
  }
  loadLearnedWords()
})

function loadLearnedWords() {
  const progress = getAllProgress()
  learnedWords.value = Object.values(progress).filter(card => card.repetitions > 0)
}

function selectWord(word) {
  selectedWord.value = word
  resetState()
}

function resetState() {
  feedback.value = null
  tips.value = null
  score.value = 0
  isCorrect.value = false
  transcript.value = ''
  speechError.value = null
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    resetState()
    startRecording()
  }
}

function speakSample(text) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

// Watch for audioBlob changes (vocabulary mode)
watch(audioBlob, async (newBlob) => {
  if (newBlob && selectedWord.value) {
    await analyzePronunciation(newBlob)
  } else if (newBlob && paragraphText.value) {
    await analyzeParagraphPronunciation(newBlob)
  }
})

async function analyzePronunciation(blob) {
  isAnalyzing.value = true
  try {
    const formData = new FormData()
    formData.append('audio', blob)
    formData.append('word', selectedWord.value.word)

    const response = await api.checkPronunciationAudio(formData)

    if (response.success) {
      feedback.value = response.feedback
      tips.value = response.tips
      score.value = response.score
      isCorrect.value = response.isCorrect
      transcript.value = response.transcript || '(Không nghe rõ)'
    } else {
      feedback.value = response.message || 'Không thể phân tích. Vui lòng thử lại.'
    }
  } catch (e) {
    console.error(e)
    speechError.value = 'Lỗi kết nối AI. Vui lòng thử lại.'
  } finally {
    isAnalyzing.value = false
  }
}

const statusText = computed(() => {
  if (isAnalyzing.value) return 'Đang phân tích...'
  if (isRecording.value) return 'Đang ghi âm...'
  return 'Nhấn micro để nói'
})

// Paragraph functions
function useParagraph() {
  paragraphText.value = customParagraph.value.trim()
  wordAnalysis.value = []
  paragraphFeedback.value = ''
  score.value = 0
}

function generatePassage() {
  showTopicSelector.value = true
}

async function confirmGeneratePassage() {
  showTopicSelector.value = false
  isGenerating.value = true

  try {
    const response = await api.generatePracticePassage(selectedTopic.value)
    if (response.success && response.passageText) {
      paragraphText.value = response.passageText
      paragraphTranslation.value = response.explanation || ''
      wordAnalysis.value = []
      paragraphFeedback.value = ''
      score.value = 0
    } else {
      speechError.value = response.message || 'Không thể tạo đoạn văn. Vui lòng thử lại.'
    }
  } catch (e) {
    console.error(e)
    speechError.value = 'Lỗi kết nối AI. Vui lòng thử lại.'
  } finally {
    isGenerating.value = false
  }
}

function toggleParagraphRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    // Reset analysis state
    wordAnalysis.value = []
    paragraphFeedback.value = ''
    score.value = 0
    speechError.value = null
    startRecording()
  }
}

async function analyzeParagraphPronunciation(blob) {
  isAnalyzing.value = true
  try {
    const formData = new FormData()
    formData.append('audio', blob)
    formData.append('paragraph', paragraphText.value)

    const response = await api.checkParagraphPronunciation(formData)

    if (response.success) {
      paragraphFeedback.value = response.feedback
      score.value = response.score || 0
      transcript.value = response.transcript || ''

      if (response.wordAnalysis && response.wordAnalysis.length > 0) {
        wordAnalysis.value = response.wordAnalysis
      } else {
        // Fallback: create word analysis from paragraph if not provided
        wordAnalysis.value = paragraphText.value.split(/\s+/).map(word => ({
          word: word,
          status: 'correct',
          feedback: '',
          tip: ''
        }))
      }
    } else {
      speechError.value = response.message || 'Không thể phân tích. Vui lòng thử lại.'
    }
  } catch (e) {
    console.error(e)
    speechError.value = 'Lỗi kết nối AI. Vui lòng thử lại.'
  } finally {
    isAnalyzing.value = false
  }
}

function selectWordForDetail(wordData) {
  if (wordData.status !== 'correct') {
    selectedWordDetail.value = wordData
  }
}

function resetParagraph() {
  paragraphText.value = ''
  customParagraph.value = ''
  wordAnalysis.value = []
  paragraphFeedback.value = ''
  score.value = 0
  selectedWordDetail.value = null
}
</script>

<style scoped>
.speaking-practice {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: var(--radius-lg);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.tab-btn.active {
  background: var(--mint-500);
  color: white;
}

.practice-container {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Word Selection */
.word-selection h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.hint-text {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.word-chip {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.word-chip:hover {
  background: var(--mint-100);
  border-color: var(--mint-300);
  color: var(--mint-700);
}

/* Target Section */
.target-section .label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.target-word {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--mint-600);
  margin: 0.5rem 0;
}

.word-meaning {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.speak-sample {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.speak-sample:hover {
  background: var(--mint-100);
  color: var(--mint-600);
  border-color: var(--mint-200);
}

/* Recording Area */
.recording-area {
  position: relative;
  margin: 1rem 0;
}

.mic-button {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.mic-button:hover {
  transform: scale(1.05);
  background: var(--bg-secondary);
}

.listening .mic-button {
  background: #ef4444;
  color: white;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.visualizer {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.listening .visualizer {
  opacity: 1;
}

.bar {
  width: 6px;
  background: #ef4444;
  border-radius: 3px;
  animation: visualize 0.8s infinite ease-in-out;
}

.bar:nth-child(1) {
  animation-delay: 0.1s;
  height: 10px;
}

.bar:nth-child(2) {
  animation-delay: 0.2s;
  height: 16px;
}

.bar:nth-child(3) {
  animation-delay: 0.3s;
  height: 24px;
}

.bar:nth-child(4) {
  animation-delay: 0.4s;
  height: 16px;
}

.bar:nth-child(5) {
  animation-delay: 0.5s;
  height: 10px;
}

@keyframes visualize {

  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(2);
  }
}

/* Results */
.transcript-box {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
}

.transcript-text {
  font-size: 1.25rem;
  font-weight: 500;
  min-height: 1.5rem;
}

.transcript-text.correct {
  color: var(--mint-600);
}

.transcript-text.incorrect {
  color: #ef4444;
  text-decoration: line-through;
}

.feedback-card {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid;
  text-align: left;
}

.feedback-card.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.feedback-card.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.feedback-header h3 {
  flex: 1;
  font-size: 1.1rem;
  margin: 0;
}

.score-badge {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tips-box {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  margin-top: 0.75rem;
  border-left: 3px solid var(--mint-500);
  color: var(--text-primary);
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  margin-top: 1rem;
}

.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Paragraph Tab Styles */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.paragraph-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.paragraph-input::placeholder {
  color: var(--text-muted);
}

.paragraph-input:focus {
  outline: none;
  border-color: var(--mint-400);
  background: var(--bg-tertiary);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.divider-text {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.topic-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.topic-selector select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Paragraph Practice Section */
.practice-paragraph-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.paragraph-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.paragraph-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--mint-500);
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.paragraph-content {
  font-size: 1.3rem;
  line-height: 2;
  color: var(--text-primary);
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  min-height: 80px;
}

.paragraph-content.analyzed {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
}

.speak-sample-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--mint-500);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.speak-sample-btn:hover {
  background: var(--mint-600);
  transform: translateY(-1px);
}

/* Recording Section */
.recording-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border-color);
}

.recording-section .recording-area {
  margin: 0;
}

/* Action Footer */
.action-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.action-footer .btn {
  flex: 0;
}

/* Legacy paragraph styles - keep for compatibility */
.paragraph-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
}

.paragraph-text.analyzed {
  background: var(--bg-tertiary);
}

.word-span {
  padding: 0.15rem 0.3rem;
  border-radius: 4px;
  margin-right: 0.2rem;
  cursor: default;
  transition: all 0.2s;
}

.word-span.correct {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.word-span.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #d97706;
  cursor: pointer;
}

.word-span.warning:hover {
  background: rgba(245, 158, 11, 0.35);
}

.word-span.incorrect {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
  cursor: pointer;
  text-decoration: underline wavy;
}

.word-span.incorrect:hover {
  background: rgba(239, 68, 68, 0.35);
}

/* Legend */
.legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item.correct .dot {
  background: #10b981;
}

.legend-item.warning .dot {
  background: #f59e0b;
}

.legend-item.incorrect .dot {
  background: #ef4444;
}

/* Word Detail Modal */
.word-detail-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: var(--radius-lg);
  max-width: 400px;
  width: 100%;
  position: relative;
  text-align: left;
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal-content h3.warning {
  color: #d97706;
}

.modal-content h3.incorrect {
  color: #dc2626;
}

.modal-content p {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.modal-content .tip-text {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border-left: 3px solid #f59e0b;
  color: var(--text-primary);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
