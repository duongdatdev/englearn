<template>
  <div class="flashcard-container">
    <div class="flashcard" :class="{ flipped: isFlipped }" @click="flip">
      <div class="flashcard-front">
        <div class="flashcard-label">{{ frontLabel }}</div>
        <div class="flashcard-content-wrapper">
          <div class="flashcard-content">{{ frontContent }}</div>
          <button v-if="showSide === 'english'" class="btn-audio" @click.stop="playWordAudio"
            :class="{ 'playing': isPlaying }">
            <FeatherIcon type="volume-2" :size="20" />
          </button>
        </div>
        <div class="flashcard-pronunciation" v-if="showSide === 'english' && word.pronunciation">
          {{ word.pronunciation }}
        </div>
        <div class="flashcard-hint">Click để lật thẻ</div>
      </div>
      <div class="flashcard-back">
        <div class="back-scroll">
          <!-- Main info -->
          <div class="flashcard-section main-section">
            <span class="section-content english">{{ word.english }}</span>
            <span class="pronunciation" v-if="word.pronunciation">{{ word.pronunciation }}</span>
          </div>

          <div class="flashcard-section">
            <span class="section-label">
              <FeatherIcon type="globe" :size="12" /> Tiếng Việt
            </span>
            <span class="section-content vietnamese">{{ word.vietnamese }}</span>
          </div>

          <div class="flashcard-section" v-if="word.meaning">
            <span class="section-label">
              <FeatherIcon type="book" :size="12" /> Định nghĩa
            </span>
            <span class="section-content meaning">{{ word.meaning }}</span>
          </div>

          <div class="flashcard-section" v-if="word.example">
            <span class="section-label">
              <FeatherIcon type="edit-3" :size="12" /> Ví dụ
            </span>
            <span class="section-content example">{{ word.example }}</span>
          </div>

          <div class="flashcard-section" v-if="word.grammar">
            <span class="section-label">
              <FeatherIcon type="type" :size="12" /> Ngữ pháp
            </span>
            <span class="section-content grammar">{{ word.grammar }}</span>
          </div>

          <div class="flashcard-section" v-if="word.wordForms">
            <span class="section-label">
              <FeatherIcon type="list" :size="12" /> Word Forms
            </span>
            <span class="section-content word-forms">{{ word.wordForms }}</span>
          </div>

          <div class="flashcard-row" v-if="word.synonyms || word.antonyms">
            <div class="flashcard-section half" v-if="word.synonyms">
              <span class="section-label">
                <FeatherIcon type="check" :size="12" /> Đồng nghĩa
              </span>
              <span class="section-content small">{{ word.synonyms }}</span>
            </div>
            <div class="flashcard-section half" v-if="word.antonyms">
              <span class="section-label">
                <FeatherIcon type="x" :size="12" /> Trái nghĩa
              </span>
              <span class="section-content small">{{ word.antonyms }}</span>
            </div>
          </div>

          <!-- AI Section -->
          <div class="ai-actions" @click.stop>
            <button class="ai-btn" @click="getAIExplain" :disabled="aiLoading.explain">
              <FeatherIcon v-if="aiLoading.explain" type="loader" :size="14" class="spin" />
              <FeatherIcon v-else type="cpu" :size="14" />
              Giải thích AI
            </button>
            <button class="ai-btn" @click="getAISentences" :disabled="aiLoading.sentences">
              <FeatherIcon v-if="aiLoading.sentences" type="loader" :size="14" class="spin" />
              <FeatherIcon v-else type="edit-3" :size="14" />
              Tạo câu mới
            </button>
            <button class="ai-btn" @click="getAISynonyms" :disabled="aiLoading.synonyms">
              <FeatherIcon v-if="aiLoading.synonyms" type="loader" :size="14" class="spin" />
              <FeatherIcon v-else type="layers" :size="14" />
              Từ liên quan
            </button>
          </div>

          <!-- AI Results -->
          <div class="ai-result" v-if="aiExplain" @click.stop>
            <div class="ai-result-header">
              <FeatherIcon type="cpu" :size="14" /> AI Giải thích
            </div>
            <p>{{ aiExplain.wordExplanation }}</p>
            <p v-if="aiExplain.grammarNote"><strong>Ngữ pháp:</strong> {{ aiExplain.grammarNote }}</p>
          </div>

          <div class="ai-result" v-if="aiSentences" @click.stop>
            <div class="ai-result-header">
              <FeatherIcon type="edit-3" :size="14" /> Câu ví dụ mới
            </div>
            <ul>
              <li v-for="(s, i) in aiSentences.sentences" :key="i">{{ s }}</li>
            </ul>
          </div>

          <div class="ai-result" v-if="aiSynonyms" @click.stop>
            <div class="ai-result-header">
              <FeatherIcon type="layers" :size="14" /> Từ liên quan
            </div>
            <div class="ai-chips">
              <span class="ai-chip green" v-for="syn in aiSynonyms.synonyms" :key="syn">{{ syn }}</span>
            </div>
            <div class="ai-chips" v-if="aiSynonyms.antonyms?.length">
              <span class="ai-chip red" v-for="ant in aiSynonyms.antonyms" :key="ant">{{ ant }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAudio } from '../composables/useAudio.js'
import { api } from '../services/api.js'
import FeatherIcon from './FeatherIcon.vue'

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
const aiLoading = ref({ explain: false, sentences: false, synonyms: false })
const aiExplain = ref(null)
const aiSentences = ref(null)
const aiSynonyms = ref(null)

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
  aiExplain.value = null
  aiSentences.value = null
  aiSynonyms.value = null
}

const { isPlaying, playAudio } = useAudio()

function playWordAudio() {
  playAudio(props.word.english)
}

async function getAIExplain() {
  aiLoading.value.explain = true
  try {
    const result = await api.explainWord(props.word.english, 'TOEIC vocabulary')
    if (result.success) aiExplain.value = result
  } catch (e) { console.error(e) }
  aiLoading.value.explain = false
}

async function getAISentences() {
  aiLoading.value.sentences = true
  try {
    const result = await api.generateSentences(props.word.english, 'medium')
    if (result.success) aiSentences.value = result
  } catch (e) { console.error(e) }
  aiLoading.value.sentences = false
}

async function getAISynonyms() {
  aiLoading.value.synonyms = true
  try {
    const result = await api.getSynonymsAntonyms(props.word.english)
    if (result.success) aiSynonyms.value = result
  } catch (e) { console.error(e) }
  aiLoading.value.synonyms = false
}

watch(() => props.word, () => {
  aiExplain.value = null
  aiSentences.value = null
  aiSynonyms.value = null
})

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
  height: 420px;
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
  padding: 1.5rem;
  justify-content: flex-start;
}

.back-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.back-scroll::-webkit-scrollbar {
  width: 4px;
}

.back-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.flashcard-label {
  font-size: 0.875rem;
  color: var(--mint-500);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.flashcard-content {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.flashcard-pronunciation {
  font-size: 1rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-style: italic;
}

.flashcard-hint {
  position: absolute;
  bottom: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.flashcard-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-audio {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: all var(--transition-fast);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.btn-audio:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
  color: var(--mint-600);
}

.btn-audio.playing {
  animation: pulse 1s infinite;
  color: var(--mint-600);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.flashcard-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.main-section {
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.25rem;
}

.section-label {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.section-content {
  font-weight: 500;
}

.section-content.english {
  font-size: 1.5rem;
}

.pronunciation {
  font-size: 0.9rem;
  opacity: 0.9;
  font-style: italic;
}

.section-content.vietnamese {
  font-size: 1.1rem;
}

.section-content.meaning {
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.95;
  line-height: 1.4;
}

.section-content.example {
  font-size: 0.85rem;
  font-weight: 400;
  font-style: italic;
  opacity: 0.9;
  line-height: 1.4;
}

.section-content.grammar {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--mint-600);
  background-color: var(--mint-50);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  line-height: 1.4;
  display: block;
}

[data-theme="dark"] .section-content.grammar {
  color: var(--mint-300);
  background-color: rgba(21, 183, 158, 0.2);
}

.section-content.word-forms {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-primary);
  opacity: 0.9;
  font-family: monospace;
  background-color: var(--bg-tertiary);
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.section-content.small {
  font-size: 0.8rem;
  font-weight: 400;
  opacity: 0.9;
}

.flashcard-row {
  display: flex;
  gap: 1rem;
}

.flashcard-section.half {
  flex: 1;
}

/* AI Features */
.ai-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
}

.ai-btn {
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ai-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.ai-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.ai-result {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
}

.ai-result-header {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ai-result p {
  font-size: 0.8rem;
  margin: 0.25rem 0;
  line-height: 1.4;
}

.ai-result ul {
  margin: 0;
  padding-left: 1rem;
}

.ai-result li {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.ai-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.ai-chip {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
}

.ai-chip.green {
  background: rgba(16, 185, 129, 0.3);
}

.ai-chip.red {
  background: rgba(239, 68, 68, 0.3);
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
