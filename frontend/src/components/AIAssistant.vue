<template>
  <div class="ai-assistant">
    <!-- Floating Button -->
    <button class="ai-fab" @click="togglePanel" :class="{ active: isOpen }">
      <span class="ai-fab-icon">
        <FeatherIcon type="cpu" :size="24" />
      </span>
      <span class="ai-fab-pulse"></span>
    </button>

    <!-- AI Panel -->
    <Transition name="slide">
      <div v-if="isOpen" class="ai-panel">
        <div class="ai-header">
          <div class="ai-header-title">
            <div class="ai-logo">
              <FeatherIcon type="cpu" :size="20" />
            </div>
            <div>
              <h3>AI Assistant</h3>
              <span class="ai-status">Sẵn sàng hỗ trợ</span>
            </div>
          </div>
          <button class="btn-close" @click="isOpen = false">
            <FeatherIcon type="x" :size="20" />
          </button>
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
              <FeatherIcon :type="tab.icon" :size="16" />
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="ai-tab-content">
            <!-- Loading Overlay -->
            <Transition name="fade">
              <div v-if="loading" class="loading-overlay">
                <div class="loading-spinner">
                  <div class="spinner-ring"></div>
                  <FeatherIcon type="cpu" :size="20" class="spinner-icon" />
                </div>
                <span class="loading-text">Đang xử lý...</span>
              </div>
            </Transition>

            <!-- Synonyms/Antonyms Tab -->
            <div v-if="activeTab === 'synonyms'" class="tab-panel">
              <div class="input-group">
                <div class="input-wrapper">
                  <FeatherIcon type="edit-3" :size="18" class="input-icon" />
                  <input 
                    v-model="wordInput" 
                    placeholder="Nhập từ tiếng Anh..." 
                    @keyup.enter="getSynonyms" 
                  />
                </div>
                <button class="btn-submit" @click="getSynonyms" :disabled="loading || !wordInput.trim()">
                  <FeatherIcon type="search" :size="18" />
                </button>
              </div>
              <Transition name="result">
                <div v-if="synonymsResult && !loading" class="result-box">
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="thumbs-up" :size="16" />
                      <strong>Đồng nghĩa</strong>
                    </div>
                    <div class="word-chips">
                      <span v-for="s in synonymsResult.synonyms" :key="s" class="chip chip-green">{{ s }}</span>
                      <span v-if="!synonymsResult.synonyms?.length" class="no-result">Không tìm thấy</span>
                    </div>
                  </div>
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="thumbs-down" :size="16" />
                      <strong>Trái nghĩa</strong>
                    </div>
                    <div class="word-chips">
                      <span v-for="a in synonymsResult.antonyms" :key="a" class="chip chip-red">{{ a }}</span>
                      <span v-if="!synonymsResult.antonyms?.length" class="no-result">Không tìm thấy</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Explain Tab -->
            <div v-if="activeTab === 'explain'" class="tab-panel">
              <div class="input-group">
                <div class="input-wrapper">
                  <FeatherIcon type="book-open" :size="18" class="input-icon" />
                  <input 
                    v-model="wordInput" 
                    placeholder="Nhập từ cần giải thích..." 
                    @keyup.enter="explainWord" 
                  />
                </div>
                <button class="btn-submit" @click="explainWord" :disabled="loading || !wordInput.trim()">
                  <FeatherIcon type="zap" :size="18" />
                </button>
              </div>
              <Transition name="result">
                <div v-if="explainResult && !loading" class="result-box">
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="book" :size="16" />
                      <strong>Nghĩa</strong>
                    </div>
                    <div class="result-text" v-html="formatMarkdown(explainResult.wordExplanation)"></div>
                  </div>
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="feather" :size="16" />
                      <strong>Ngữ pháp</strong>
                    </div>
                    <div class="result-text" v-html="formatMarkdown(explainResult.grammarNote)"></div>
                  </div>
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="message-circle" :size="16" />
                      <strong>Ví dụ</strong>
                    </div>
                    <ul class="example-list">
                      <li v-for="ex in explainResult.usageExamples" :key="ex">{{ ex }}</li>
                    </ul>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Sentences Tab -->
            <div v-if="activeTab === 'sentences'" class="tab-panel">
              <div class="input-group">
                <div class="input-wrapper">
                  <FeatherIcon type="edit-3" :size="18" class="input-icon" />
                  <input 
                    v-model="wordInput" 
                    placeholder="Nhập từ cần tạo câu..." 
                    @keyup.enter="generateSentences" 
                  />
                </div>
                <select v-model="level" class="level-select">
                  <option value="easy">Dễ</option>
                  <option value="medium">TB</option>
                  <option value="hard">Khó</option>
                </select>
                <button class="btn-submit" @click="generateSentences" :disabled="loading || !wordInput.trim()">
                  <FeatherIcon type="edit" :size="18" />
                </button>
              </div>
              <Transition name="result">
                <div v-if="sentencesResult && !loading" class="result-box">
                  <div class="sentence-list">
                    <div v-for="(sentence, i) in sentencesResult.sentences" :key="i" class="sentence-item">
                      <span class="sentence-num">{{ i + 1 }}</span>
                      <span class="sentence-text">{{ sentence }}</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Search Tab -->
            <div v-if="activeTab === 'search'" class="tab-panel">
              <div class="input-group">
                <div class="input-wrapper">
                  <FeatherIcon type="search" :size="18" class="input-icon" />
                  <input 
                    v-model="searchInput" 
                    placeholder="Tìm kiếm thông minh..." 
                    @keyup.enter="smartSearch" 
                  />
                </div>
                <button class="btn-submit" @click="smartSearch" :disabled="loading || !searchInput.trim()">
                  <FeatherIcon type="arrow-right" :size="18" />
                </button>
              </div>
              <Transition name="result">
                <div v-if="searchResult && !loading" class="result-box">
                  <div class="result-section">
                    <div class="result-header">
                      <FeatherIcon type="list" :size="16" />
                      <strong>Kết quả tìm kiếm</strong>
                    </div>
                    <div class="word-chips">
                      <span v-for="w in searchResult.synonyms" :key="w" class="chip chip-blue">{{ w }}</span>
                    </div>
                  </div>
                  <div class="result-section" v-if="searchResult.explanation">
                    <p class="result-text muted">{{ searchResult.explanation }}</p>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="error" class="error-message">
              <FeatherIcon type="alert-circle" :size="16" />
              <span>{{ error }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../services/api.js'
import FeatherIcon from './FeatherIcon.vue'

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
  { id: 'synonyms', icon: 'layers', label: 'Đồng/Trái' },
  { id: 'explain', icon: 'book-open', label: 'Giải thích' },
  { id: 'sentences', icon: 'edit-3', label: 'Tạo câu' },
  { id: 'search', icon: 'search', label: 'Tìm kiếm' }
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

// Format markdown text to HTML
function formatMarkdown(text) {
  if (!text) return ''
  
  // Convert markdown to HTML
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Numbered lists: "1. ", "2. ", etc.
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="list-item"><span class="list-num">$1.</span> $2</div>')
    // Line breaks (double newline = paragraph, single = br)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph if needed
    .replace(/^(.+)$/, '<p>$1</p>')
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

/* Floating Action Button */
.ai-fab {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  border: none;
  cursor: pointer;
  box-shadow: 
    0 4px 15px rgba(16, 185, 129, 0.4),
    0 0 0 0 rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-fab:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(16, 185, 129, 0.5),
    0 0 0 0 rgba(16, 185, 129, 0.4);
}

.ai-fab.active {
  background: linear-gradient(135deg, var(--mint-600) 0%, var(--mint-700) 100%);
}

.ai-fab-icon {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: transform 0.3s ease;
}

.ai-fab.active .ai-fab-icon {
  transform: rotate(180deg);
}

.ai-fab-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  animation: pulse-ring 2s ease-out infinite;
}

.ai-fab.active .ai-fab-pulse {
  animation: none;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.15); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}

/* AI Panel */
.ai-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 480px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .ai-panel {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Header */
.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  border-radius: 20px 20px 0 0;
}

.ai-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-logo {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.ai-status {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.btn-close {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

/* Content */
.ai-content {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

/* Custom Scrollbar */
.ai-content::-webkit-scrollbar {
  width: 8px;
}

.ai-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.ai-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
  transition: background 0.2s;
}

.ai-content::-webkit-scrollbar-thumb:hover {
  background: var(--mint-400);
}

[data-theme="dark"] .ai-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .ai-content::-webkit-scrollbar-thumb:hover {
  background: var(--mint-400);
}

/* Tabs - 2x2 Grid Layout */
.ai-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  background: var(--bg-tertiary);
  padding: 0.5rem;
  border-radius: 14px;
}

.ai-tabs button {
  padding: 0.75rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.ai-tabs button:hover:not(.active) {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.ai-tabs button.active {
  background: var(--mint-500);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.tab-label {
  display: inline;
}

/* Tab Content */
.ai-tab-content {
  position: relative;
  min-height: 120px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--bg-secondary), 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 12px;
  z-index: 10;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--border-color);
  border-top-color: var(--mint-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-icon {
  color: var(--mint-500);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Input Group */
.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 0.85rem 0.75rem 2.75rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.9rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--mint-400);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.btn-submit {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-select {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.level-select:focus {
  outline: none;
  border-color: var(--mint-400);
}

/* Result Box */
.result-box {
  background: var(--bg-tertiary);
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.result-section {
  margin-bottom: 1rem;
}

.result-section:last-child {
  margin-bottom: 0;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.result-header strong {
  font-size: 0.85rem;
  font-weight: 600;
}

.result-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.result-text :deep(p) {
  margin: 0 0 0.5rem 0;
}

.result-text :deep(p:last-child) {
  margin-bottom: 0;
}

.result-text :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.result-text :deep(em) {
  font-style: italic;
  color: var(--mint-600);
}

[data-theme="dark"] .result-text :deep(em) {
  color: var(--mint-400);
}

.result-text :deep(.list-item) {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid var(--mint-500);
}

.result-text :deep(.list-num) {
  font-weight: 600;
  color: var(--mint-500);
  min-width: 1.5rem;
}

.result-text :deep(h2),
.result-text :deep(h3),
.result-text :deep(h4) {
  margin: 0.75rem 0 0.5rem 0;
  color: var(--text-primary);
  font-weight: 600;
}

.result-text :deep(h2) { font-size: 1rem; }
.result-text :deep(h3) { font-size: 0.95rem; }
.result-text :deep(h4) { font-size: 0.9rem; }

.example-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: none;
}

.example-list li {
  position: relative;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 0.35rem;
  padding-left: 0.25rem;
}

.example-list li::before {
  content: '•';
  position: absolute;
  left: -1rem;
  color: var(--mint-500);
}

/* Word Chips */
.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: transform 0.15s ease;
}

.chip:hover {
  transform: scale(1.05);
}

.chip-green {
  background: rgba(16, 185, 129, 0.12);
  color: var(--mint-600);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

[data-theme="dark"] .chip-green {
  background: rgba(16, 185, 129, 0.15);
  color: var(--mint-300);
}

.chip-red {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

[data-theme="dark"] .chip-red {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.chip-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .chip-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.no-result {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Sentence List */
.sentence-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sentence-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.sentence-num {
  width: 24px;
  height: 24px;
  background: var(--mint-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.sentence-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

[data-theme="dark"] .error-message {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.muted {
  color: var(--text-muted) !important;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.result-enter-active {
  transition: all 0.3s ease-out;
}

.result-leave-active {
  transition: all 0.2s ease-in;
}

.result-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.result-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive - Tablet */
@media (max-width: 768px) {
  .ai-panel {
    width: 420px;
    max-height: 550px;
  }
}

/* Responsive - Mobile */
@media (max-width: 520px) {
  .ai-assistant {
    bottom: 1rem;
    right: 1rem;
  }

  .ai-fab {
    width: 50px;
    height: 50px;
  }

  .ai-panel {
    width: calc(100vw - 2rem);
    right: 0;
    max-height: 75vh;
    bottom: 65px;
  }

  .ai-header {
    padding: 0.85rem 1rem;
  }

  .ai-logo {
    width: 36px;
    height: 36px;
  }

  .ai-content {
    padding: 1rem;
  }

  .ai-tabs {
    gap: 0.4rem;
    padding: 0.4rem;
  }

  .ai-tabs button {
    padding: 0.6rem 0.5rem;
    font-size: 0.8rem;
    gap: 0.4rem;
  }

  .input-wrapper input {
    padding: 0.65rem 0.75rem 0.65rem 2.5rem;
    font-size: 0.85rem;
  }

  .btn-submit {
    width: 40px;
    height: 40px;
  }
}

/* Responsive - Small Mobile */
@media (max-width: 360px) {
  .ai-panel {
    width: calc(100vw - 1rem);
  }

  .ai-tabs button {
    font-size: 0.75rem;
    padding: 0.5rem 0.4rem;
  }

  .tab-label {
    display: none;
  }
}
</style>
