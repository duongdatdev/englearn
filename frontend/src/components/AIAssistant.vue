<template>
  <div class="ai-assistant">
    <!-- Floating Button -->
    <button 
      class="ai-fab" 
      @click="togglePanel"
      :class="{ active: isOpen }"
    >
      <span class="ai-icon">🤖</span>
    </button>

    <!-- AI Panel -->
    <Transition name="slide">
      <div v-if="isOpen" class="ai-panel card">
        <div class="ai-header">
          <h3>🤖 AI Assistant</h3>
          <button class="btn-close" @click="isOpen = false">✕</button>
        </div>

        <div class="ai-content">
          <!-- Tabs -->
          <div class="ai-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="ai-tab-content">
            <!-- Synonyms/Antonyms Tab -->
            <div v-if="activeTab === 'synonyms'" class="tab-panel">
              <div class="input-group">
                <input 
                  v-model="wordInput" 
                  placeholder="Nhập từ tiếng Anh..."
                  @keyup.enter="getSynonyms"
                />
                <button class="btn btn-primary" @click="getSynonyms" :disabled="loading">
                  {{ loading ? '...' : 'Tìm' }}
                </button>
              </div>
              <div v-if="synonymsResult" class="result-box">
                <div class="result-section">
                  <strong>📗 Đồng nghĩa:</strong>
                  <div class="word-chips">
                    <span v-for="s in synonymsResult.synonyms" :key="s" class="chip chip-green">{{ s }}</span>
                  </div>
                </div>
                <div class="result-section">
                  <strong>📕 Trái nghĩa:</strong>
                  <div class="word-chips">
                    <span v-for="a in synonymsResult.antonyms" :key="a" class="chip chip-red">{{ a }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Explain Tab -->
            <div v-if="activeTab === 'explain'" class="tab-panel">
              <div class="input-group">
                <input 
                  v-model="wordInput" 
                  placeholder="Nhập từ cần giải thích..."
                  @keyup.enter="explainWord"
                />
                <button class="btn btn-primary" @click="explainWord" :disabled="loading">
                  {{ loading ? '...' : 'Giải thích' }}
                </button>
              </div>
              <div v-if="explainResult" class="result-box">
                <div class="result-section">
                  <strong>📖 Nghĩa:</strong>
                  <p>{{ explainResult.wordExplanation }}</p>
                </div>
                <div class="result-section">
                  <strong>📝 Ngữ pháp:</strong>
                  <p>{{ explainResult.grammarNote }}</p>
                </div>
                <div class="result-section">
                  <strong>💡 Ví dụ:</strong>
                  <ul>
                    <li v-for="ex in explainResult.usageExamples" :key="ex">{{ ex }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Sentences Tab -->
            <div v-if="activeTab === 'sentences'" class="tab-panel">
              <div class="input-group">
                <input 
                  v-model="wordInput" 
                  placeholder="Nhập từ cần tạo câu..."
                  @keyup.enter="generateSentences"
                />
                <select v-model="level" class="level-select">
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
                <button class="btn btn-primary" @click="generateSentences" :disabled="loading">
                  {{ loading ? '...' : 'Tạo' }}
                </button>
              </div>
              <div v-if="sentencesResult" class="result-box">
                <div class="sentence-list">
                  <div v-for="(sentence, i) in sentencesResult.sentences" :key="i" class="sentence-item">
                    {{ i + 1 }}. {{ sentence }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Search Tab -->
            <div v-if="activeTab === 'search'" class="tab-panel">
              <div class="input-group">
                <input 
                  v-model="searchInput" 
                  placeholder="Tìm kiếm thông minh..."
                  @keyup.enter="smartSearch"
                />
                <button class="btn btn-primary" @click="smartSearch" :disabled="loading">
                  {{ loading ? '...' : 'Tìm' }}
                </button>
              </div>
              <div v-if="searchResult" class="result-box">
                <div class="result-section">
                  <strong>🔍 Kết quả:</strong>
                  <div class="word-chips">
                    <span v-for="w in searchResult.synonyms" :key="w" class="chip chip-blue">{{ w }}</span>
                  </div>
                </div>
                <div class="result-section" v-if="searchResult.explanation">
                  <p class="muted">{{ searchResult.explanation }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../services/api.js'

const isOpen = ref(false)
const activeTab = ref('synonyms')
const wordInput = ref('')
const searchInput = ref('')
const level = ref('medium')
const loading = ref(false)
const error = ref('')

const synonymsResult = ref(null)
const explainResult = ref(null)
const sentencesResult = ref(null)
const searchResult = ref(null)

const tabs = [
  { id: 'synonyms', icon: '📚', label: 'Đồng/Trái nghĩa' },
  { id: 'explain', icon: '💡', label: 'Giải thích' },
  { id: 'sentences', icon: '✍️', label: 'Tạo câu' },
  { id: 'search', icon: '🔍', label: 'Tìm kiếm' }
]

function togglePanel() {
  isOpen.value = !isOpen.value
  error.value = ''
}

async function getSynonyms() {
  if (!wordInput.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    synonymsResult.value = await api.getSynonymsAntonyms(wordInput.value.trim())
    if (!synonymsResult.value.success) {
      error.value = synonymsResult.value.message
    }
  } catch (e) {
    error.value = 'Không thể kết nối với AI'
  }
  loading.value = false
}

async function explainWord() {
  if (!wordInput.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    explainResult.value = await api.explainWord(wordInput.value.trim())
    if (!explainResult.value.success) {
      error.value = explainResult.value.message
    }
  } catch (e) {
    error.value = 'Không thể kết nối với AI'
  }
  loading.value = false
}

async function generateSentences() {
  if (!wordInput.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    sentencesResult.value = await api.generateSentences(wordInput.value.trim(), level.value)
    if (!sentencesResult.value.success) {
      error.value = sentencesResult.value.message
    }
  } catch (e) {
    error.value = 'Không thể kết nối với AI'
  }
  loading.value = false
}

async function smartSearch() {
  if (!searchInput.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    searchResult.value = await api.smartSearch(searchInput.value.trim())
    if (!searchResult.value.success) {
      error.value = searchResult.value.message
    }
  } catch (e) {
    error.value = 'Không thể kết nối với AI'
  }
  loading.value = false
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.ai-fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
}

.ai-fab.active {
  transform: rotate(180deg);
}

.ai-icon {
  font-size: 1.75rem;
}

.ai-panel {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  max-height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.ai-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem 0.5rem;
}

.btn-close:hover {
  color: var(--text-primary);
}

.ai-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.ai-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.ai-tabs button {
  padding: 0.5rem 0.75rem;
  border: none;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: all 0.2s;
}

.ai-tabs button:hover {
  background: var(--mint-100);
  color: var(--mint-600);
}

.ai-tabs button.active {
  background: var(--mint-500);
  color: white;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-group input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  background: var(--input-bg);
  color: var(--text-primary);
}

.input-group input:focus {
  outline: none;
  border-color: var(--mint-400);
}

.level-select {
  padding: 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.8rem;
}

.result-box {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.result-section {
  margin-bottom: 0.75rem;
}

.result-section:last-child {
  margin-bottom: 0;
}

.result-section strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.result-section p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.result-section ul {
  margin: 0;
  padding-left: 1.25rem;
}

.result-section li {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.chip-green {
  background: rgba(16, 185, 129, 0.15);
  color: var(--mint-600);
}

.chip-red {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

.chip-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.sentence-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sentence-item {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sentence-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.muted {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 480px) {
  .ai-panel {
    width: calc(100vw - 2rem);
    right: -0.5rem;
  }
  
  .ai-tabs {
    gap: 0.25rem;
  }
  
  .ai-tabs button {
    font-size: 0.7rem;
    padding: 0.4rem 0.5rem;
  }
}
</style>
