<template>
  <div class="topic-view animate-fadeIn">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Trang chủ</router-link>
      <span class="breadcrumb-separator">/</span>
      <router-link :to="`/book/${topic?.bookId}`" class="breadcrumb-link">{{ bookName }}</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ topic?.name || 'Đang tải...' }}</span>
    </div>

    <header class="topic-header" v-if="topic">
      <h1 class="topic-name">
        <FeatherIcon type="file-text" :size="28" /> {{ topic.name }}
      </h1>
      <p class="topic-meta">{{ words.length }} từ vựng</p>
    </header>

    <section class="mode-selection">
      <h2 class="section-title">Chọn chế độ</h2>

      <div class="mode-categories">
        <!-- Primary Modes: Learn & SRS -->
        <div class="mode-category">
          <span class="category-label">
            <FeatherIcon type="star" :size="14" /> Chế độ chính
          </span>

          <div class="primary-grid">
            <!-- Learn Mode -->
            <div class="mode-card mode-card-primary card card-clickable" @click="startLearn">
              <span class="mode-icon primary">
                <FeatherIcon type="book-open" :size="32" />
              </span>
              <div class="mode-info">
                <h3 class="mode-name">Học từ mới</h3>
                <p class="mode-desc">Phương pháp 3 bước: Xem - Nghe - Kiểm tra</p>
              </div>
              <span class="mode-badge new">Mới</span>
            </div>

            <!-- SRS Review Mode -->
            <div class="mode-card mode-card-srs card card-clickable" @click="startSRSReview"
              :class="{ 'has-due': topicProgress.dueToday > 0 }">
              <span class="mode-icon srs">
                <FeatherIcon type="clock" :size="32" />
                <span class="due-badge" v-if="topicProgress.dueToday > 0">{{ topicProgress.dueToday }}</span>
              </span>
              <div class="mode-info">
                <h3 class="mode-name">Ôn tập SRS</h3>
                <p class="mode-desc">Học nhắc lại thông minh (Spaced Repetition)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary: Practice Modes -->
        <div class="mode-category">
          <span class="category-label">
            <FeatherIcon type="tool" :size="14" /> Luyện tập thêm
          </span>
          <div class="mode-grid">
            <div class="mode-card card card-clickable" @click="startFlashCard">
              <span class="mode-icon">
                <FeatherIcon type="credit-card" :size="28" />
              </span>
              <h3 class="mode-name">Flash Card</h3>
              <p class="mode-desc">Lật thẻ ghi nhớ</p>
            </div>

            <div class="mode-card card card-clickable" @click="startQuiz('vn-en')">
              <span class="mode-icon">
                <FeatherIcon type="globe" :size="22" />
                <FeatherIcon type="arrow-right" :size="14" />
                <span class="flag-text">EN</span>
              </span>
              <h3 class="mode-name">Việt → Anh</h3>
              <p class="mode-desc">Gõ tiếng Anh</p>
            </div>

            <div class="mode-card card card-clickable" @click="startQuiz('en-vn')">
              <span class="mode-icon">
                <span class="flag-text">EN</span>
                <FeatherIcon type="arrow-right" :size="14" />
                <FeatherIcon type="globe" :size="22" />
              </span>
              <h3 class="mode-name">Anh → Việt</h3>
              <p class="mode-desc">Gõ tiếng Việt</p>
            </div>

            <div class="mode-card card card-clickable" @click="startQuiz('meaning-word')">
              <span class="mode-icon">
                <FeatherIcon type="book" :size="22" />
                <FeatherIcon type="arrow-right" :size="14" />
                <FeatherIcon type="edit-3" :size="22" />
              </span>
              <h3 class="mode-name">Nghĩa → Từ</h3>
              <p class="mode-desc">Gõ từ tiếng Anh</p>
            </div>

            <div class="mode-card mode-card-ai card card-clickable" @click="startParagraphPractice">
              <span class="mode-icon ai">
                <FeatherIcon type="file-text" :size="22" />
                <FeatherIcon type="cpu" :size="14" />
              </span>
              <h3 class="mode-name">Điền đoạn văn</h3>
              <p class="mode-desc">AI tạo đoạn văn</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="word-preview" v-if="words.length > 0">
      <div class="section-header">
        <h2 class="section-title">Danh sách từ vựng</h2>

        <!-- AI Search -->
        <div class="ai-search-box">
          <FeatherIcon type="search" :size="16" class="search-icon" />
          <input v-model="searchQuery" type="text" class="search-input"
            placeholder="Tìm kiếm thông minh (Anh/Việt/Nghĩa)..." @input="handleSearch" />
          <button v-if="searchQuery && !searching" class="btn-ai-search" @click="aiSmartSearch">
            <FeatherIcon type="cpu" :size="14" /> AI
          </button>
          <FeatherIcon v-if="searching" type="loader" :size="18" class="spin searching-indicator" />
        </div>
      </div>

      <!-- AI Search Results -->
      <div class="ai-search-result" v-if="aiSearchResult">
        <FeatherIcon type="cpu" :size="16" />
        <span>{{ aiSearchResult }}</span>
        <button class="btn-clear" @click="clearAISearch">
          <FeatherIcon type="x" :size="16" />
        </button>
      </div>

      <div class="word-list card">
        <div class="word-item" v-for="word in filteredWords" :key="word.id">
          <div class="word-info-left">
            <span class="word-english">{{ word.english }}</span>
            <button class="btn-icon-audio" @click="playAudio(word.english)">
              <FeatherIcon type="volume-2" :size="16" />
            </button>
          </div>
          <span class="word-vietnamese">{{ word.vietnamese }}</span>
        </div>
        <div class="no-results" v-if="filteredWords.length === 0">
          Không tìm thấy từ nào. Thử nhấn
          <FeatherIcon type="cpu" :size="14" /> AI để tìm kiếm thông minh.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTopicById, getWordsByTopicId, getBookById } from '../db/database.js'
import { useAudio } from '../composables/useAudio.js'
import { api } from '../services/api.js'
import { getTopicProgress } from '../services/srs.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const route = useRoute()
const router = useRouter()
const topic = ref(null)
const words = ref([])
const bookName = ref('')
const searchQuery = ref('')
const searching = ref(false)
const aiSearchResult = ref('')
const aiMatchedWords = ref([])
const topicProgress = ref({ total: 0, dueToday: 0, mastered: 0, learning: 0 })
const { playAudio } = useAudio()

const filteredWords = computed(() => {
  if (!searchQuery.value.trim()) {
    return words.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  // First check AI matched words
  if (aiMatchedWords.value.length > 0) {
    return words.value.filter(w =>
      aiMatchedWords.value.some(m => w.english.toLowerCase().includes(m.toLowerCase()))
    )
  }

  // Local search
  return words.value.filter(w =>
    w.english.toLowerCase().includes(query) ||
    w.vietnamese.toLowerCase().includes(query) ||
    (w.meaning && w.meaning.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  try {
    const topicId = route.params.id
    topic.value = await getTopicById(topicId)
    words.value = await getWordsByTopicId(topicId)

    if (topic.value && topic.value.book) {
      bookName.value = topic.value.book.name
    }

    // Load SRS progress for this topic
    topicProgress.value = getTopicProgress(topicId)
  } catch (error) {
    console.error('Error loading topic:', error)
  }
})

function handleSearch() {
  aiMatchedWords.value = []
  aiSearchResult.value = ''
}

async function aiSmartSearch() {
  if (!searchQuery.value.trim()) return

  searching.value = true
  try {
    const result = await api.smartSearch(searchQuery.value.trim())
    if (result.success && result.synonyms?.length > 0) {
      aiMatchedWords.value = result.synonyms
      aiSearchResult.value = result.explanation || `Tìm thấy: ${result.synonyms.join(', ')}`
    } else {
      aiSearchResult.value = 'Không tìm thấy kết quả phù hợp'
    }
  } catch (e) {
    console.error('AI search failed:', e)
    aiSearchResult.value = 'Lỗi kết nối AI'
  }
  searching.value = false
}

function clearAISearch() {
  aiSearchResult.value = ''
  aiMatchedWords.value = []
}

function startLearn() {
  router.push(`/learn/${topic.value.id}`)
}

function startFlashCard() {
  router.push(`/flashcard/${topic.value.id}`)
}

function startQuiz(mode) {
  router.push(`/quiz/${topic.value.id}/${mode}`)
}

function startParagraphPractice() {
  router.push(`/paragraph/${topic.value.id}`)
}

function startSRSReview() {
  router.push(`/review/${topic.value.id}`)
}
</script>

<style scoped>
.topic-view {
  padding-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.breadcrumb-link {
  color: var(--mint-500);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-muted);
}

.topic-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.topic-name {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.topic-meta {
  color: var(--text-muted);
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

/* Mode Categories */
.mode-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.mode-category {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

/* Primary Grid Mode */
.primary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Common Primary Card Styles */
.mode-card-primary,
.mode-card-srs {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  text-align: left;
}

/* Learn Card Specifics */
.mode-card-primary {
  background: linear-gradient(135deg, var(--mint-50), rgba(16, 185, 129, 0.08));
  border-color: var(--mint-200);
}

.mode-card-primary:hover {
  border-color: var(--mint-400);
  background: linear-gradient(135deg, var(--mint-100), rgba(16, 185, 129, 0.12));
}

[data-theme="dark"] .mode-card-primary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
  border-color: rgba(16, 185, 129, 0.3);
}

[data-theme="dark"] .mode-card-primary:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-color: var(--mint-500);
}

.mode-card-primary .mode-icon.primary {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-400), var(--mint-500));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.mode-info {
  flex: 1;
  text-align: left;
}

.mode-info .mode-name {
  font-size: 1.15rem;
  margin-bottom: 0.25rem;
}

.mode-info .mode-desc {
  font-size: 0.875rem;
}

.mode-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-badge.new {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
}

/* Mode Grid for Review Cards */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.mode-card {
  text-align: center;
  padding: 1.25rem 1rem;
}

.mode-icon {
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
  color: var(--mint-500);
}

.flag-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--mint-600);
}

.mode-name {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.mode-card-ai {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.mode-card-ai:hover {
  border-color: rgba(139, 92, 246, 0.4);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.12));
}

.mode-icon.ai {
  color: #8b5cf6;
}

/* SRS Mode Card */
.mode-card-srs {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(247, 147, 30, 0.08));
  border: 1px solid rgba(255, 107, 53, 0.2);
  position: relative;
}

.mode-card-srs:hover {
  border-color: rgba(255, 107, 53, 0.4);
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.12));
}

.mode-card-srs.has-due {
  border-color: rgba(255, 107, 53, 0.4);
}

.mode-icon.srs {
  color: #ff6b35;
  position: relative;
}

.due-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.4);
}

.word-list {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--mint-400) transparent;
}

/* Custom Scrollbar for word-list */
.word-list::-webkit-scrollbar {
  width: 6px;
}

.word-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
  margin: 0.5rem 0;
}

.word-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--mint-400), var(--mint-500));
  border-radius: 3px;
  transition: background 0.2s;
}

.word-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--mint-500), var(--mint-600));
}

[data-theme="dark"] .word-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--mint-500), var(--mint-600));
}

[data-theme="dark"] .word-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--mint-400), var(--mint-500));
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s ease;
  border-radius: 8px;
  margin-bottom: 2px;
}

.word-item:hover {
  background: var(--bg-tertiary);
}

.word-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.word-english {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.word-vietnamese {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: right;
}

.word-info-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon-audio {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  padding: 0.35rem;
  border-radius: 50%;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.btn-icon-audio:hover {
  opacity: 1;
  background-color: var(--mint-100);
  transform: scale(1.15);
  color: var(--mint-500);
}

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .primary-grid {
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .primary-grid {
    grid-template-columns: 1fr;
  }

  .mode-card-primary,
  .mode-card-srs {
    flex-direction: column;
    text-align: center;
  }

  .mode-info {
    text-align: center;
  }

  .mode-badge,
  .due-badge {
    position: static;
    margin-top: 0.5rem;
  }

  .topic-name {
    font-size: 1.5rem;
  }
}

/* AI Search Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-header .section-title {
  margin-bottom: 0;
}

.ai-search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.25rem;
  transition: all 0.2s ease;
}

.ai-search-box:focus-within {
  border-color: var(--mint-400);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  min-width: 320px;
  background: transparent;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.btn-ai-search {
  padding: 0.5rem 0.85rem;
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.btn-ai-search:hover {
  transform: scale(1.03);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}

.searching-indicator {
  color: var(--mint-500);
  margin-right: 0.5rem;
}

.ai-search-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08));
  border-radius: 10px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn-clear {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-clear:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

.no-results {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
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

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ai-search-box {
    width: 100%;
  }

  .search-input {
    min-width: 0;
    flex: 1;
  }
}
</style>
