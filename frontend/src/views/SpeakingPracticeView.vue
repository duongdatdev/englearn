<template>
  <div class="speaking-practice animate-fadeIn">
    <div class="header">
      <button class="btn btn-ghost" @click="$router.back()">
        <FeatherIcon type="arrow-left" :size="20" /> Quay lại
      </button>
      <h1>Luyện nói & Phát âm</h1>
    </div>

    <div class="card practice-container">
      <!-- Target Word -->
      <div class="target-section">
        <span class="label">Từ cần đọc:</span>
        <h2 class="target-word">{{ targetWord }}</h2>
        <button class="btn-icon speak-sample" @click="speakSample">
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

        <!-- Real-time display -->
        <div class="realtime-box" v-if="isRecording && displayText">
          <p class="realtime-text">"{{ displayText }}"</p>
        </div>

        <!-- Error message -->
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
            <strong>💡 Mẹo:</strong> {{ tips }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAudioRecorder } from '../composables/useAudioRecorder'
import { api } from '../services/api'
import FeatherIcon from '../components/FeatherIcon.vue'

const { isRecording, audioBlob, error: recorderError, startRecording, stopRecording, isSupported } = useAudioRecorder()
const targetWord = ref('Butterfly') // TODO: Get from route/props
const feedback = ref(null)
const tips = ref(null)
const score = ref(0)
const isCorrect = ref(false)
const isAnalyzing = ref(false)
const transcript = ref('')
const speechError = ref(null)

// Sync recorder error to local error state
watch(recorderError, (val) => {
  if (val) speechError.value = val
})

onMounted(() => {
  if (!isSupported) {
    alert('Trình duyệt của bạn không hỗ trợ ghi âm. Vui lòng thử Chrome hoặc Edge.')
  }
})

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    // Reset state before starting
    feedback.value = null
    tips.value = null
    score.value = 0
    isCorrect.value = false
    transcript.value = ''
    speechError.value = null
    startRecording()
  }
}

function speakSample() {
  const utterance = new SpeechSynthesisUtterance(targetWord.value)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

// Watch for audioBlob changes (when recording stops)
watch(audioBlob, async (newBlob) => {
  if (newBlob) {
    await analyzePronunciation(newBlob)
  }
})

async function analyzePronunciation(blob) {
  isAnalyzing.value = true
  try {
    const formData = new FormData()
    formData.append('audio', blob)
    formData.append('word', targetWord.value)

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

// MockdisplayText for UI compatibility (or remove it from template)
const displayText = computed(() => {
  return isRecording.value ? '...' : ''
})
</script>

<style scoped>
.speaking-practice {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.practice-container {
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.target-section .label {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.target-word {
  font-size: 3rem;
  font-weight: 800;
  color: var(--mint-600);
  margin: 0.5rem 0;
}

.speak-sample {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  cursor: pointer;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
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
  font-size: 1rem;
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
  margin-bottom: 1.5rem;
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
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feedback-text {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tips-box {
  background: rgba(255, 255, 255, 0.5);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}

/* Real-time transcript display */
.realtime-box {
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.realtime-text {
  font-size: 1.1rem;
  color: var(--mint-500);
  font-style: italic;
  margin: 0;
}

/* Error box */
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

/* Disabled state */
.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
