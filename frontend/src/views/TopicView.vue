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
      <h1 class="topic-name">📝 {{ topic.name }}</h1>
      <p class="topic-meta">{{ words.length }} từ vựng</p>
    </header>
    
    <section class="mode-selection">
      <h2 class="section-title">Chọn chế độ học</h2>
      
      <div class="mode-grid">
        <div class="mode-card card card-clickable" @click="startFlashCard">
          <span class="mode-icon">🎴</span>
          <h3 class="mode-name">Flash Card</h3>
          <p class="mode-desc">Học từ vựng qua thẻ ghi nhớ</p>
        </div>
        
        <div class="mode-card card card-clickable" @click="startQuiz('vn-en')">
          <span class="mode-icon">🇻🇳 → 🇬🇧</span>
          <h3 class="mode-name">Việt → Anh</h3>
          <p class="mode-desc">Xem tiếng Việt, gõ tiếng Anh</p>
        </div>
        
        <div class="mode-card card card-clickable" @click="startQuiz('en-vn')">
          <span class="mode-icon">🇬🇧 → 🇻🇳</span>
          <h3 class="mode-name">Anh → Việt</h3>
          <p class="mode-desc">Xem tiếng Anh, gõ tiếng Việt</p>
        </div>
        
        <div class="mode-card card card-clickable" @click="startQuiz('meaning-word')">
          <span class="mode-icon">📖 → ✍️</span>
          <h3 class="mode-name">Nghĩa → Từ</h3>
          <p class="mode-desc">Xem định nghĩa, gõ từ tiếng Anh</p>
        </div>
      </div>
    </section>
    
    <section class="word-preview" v-if="words.length > 0">
      <div class="section-header">
        <h2 class="section-title">Danh sách từ vựng</h2>
        
        <!-- AI Search -->
        <div class="ai-search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="search-input"
            placeholder="🔍 Tìm kiếm thông minh (Anh/Việt/Nghĩa)..."
            @input="handleSearch"
          />
          <button 
            v-if="searchQuery && !searching" 
            class="btn-ai-search" 
            @click="aiSmartSearch"
          >
            🤖 AI
          </button>
          <span v-if="searching" class="searching-indicator">⏳</span>
        </div>
      </div>

      <!-- AI Search Results -->
      <div class="ai-search-result" v-if="aiSearchResult">
        🤖 <span>{{ aiSearchResult }}</span>
        <button class="btn-clear" @click="clearAISearch">✕</button>
      </div>
      
      <div class="word-list card">
        <div class="word-item" v-for="word in filteredWords" :key="word.id">
          <div class="word-info-left">
            <span class="word-english">{{ word.english }}</span>
            <button 
              class="btn-icon-audio" 
              @click="playAudio(word.english)"
            >
              🔊
            </button>
          </div>
          <span class="word-vietnamese">{{ word.vietnamese }}</span>
        </div>
        <div class="no-results" v-if="filteredWords.length === 0">
          Không tìm thấy từ nào. Thử nhấn 🤖 AI để tìm kiếm thông minh.
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

const route = useRoute()
const router = useRouter()
const topic = ref(null)
const words = ref([])
const bookName = ref('')
const searchQuery = ref('')
const searching = ref(false)
const aiSearchResult = ref('')
const aiMatchedWords = ref([])
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
    
    if (topic.value) {
      const book = await getBookById(topic.value.bookId)
      bookName.value = book?.name || ''
    }
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

function startFlashCard() {
  router.push(`/flashcard/${topic.value.id}`)
}

function startQuiz(mode) {
  router.push(`/quiz/${topic.value.id}/${mode}`)
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
}

.topic-meta {
  color: var(--text-muted);
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.mode-card {
  text-align: center;
  padding: 1.5rem;
}

.mode-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.mode-name {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.word-list {
  max-height: 400px;
  overflow-y: auto;
}

.word-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.word-item:last-child {
  border-bottom: none;
}

.word-english {
  font-weight: 500;
  color: var(--text-primary);
}

.word-vietnamese {
  color: var(--text-muted);
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
  font-size: 1rem;
  opacity: 0.6;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.btn-icon-audio:hover {
  opacity: 1;
  background-color: var(--mint-100);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: 1fr;
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
  margin-bottom: 1rem;
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
}

.search-input {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  min-width: 280px;
  background: var(--input-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--mint-400);
}

.btn-ai-search {
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ai-search:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}

.searching-indicator {
  font-size: 1.25rem;
}

.ai-search-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.btn-clear {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
}

.btn-clear:hover {
  opacity: 1;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
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
