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
      <h2 class="section-title">Danh sách từ vựng</h2>
      
      <div class="word-list card">
        <div class="word-item" v-for="word in words" :key="word.id">
          <span class="word-english">{{ word.english }}</span>
          <span class="word-vietnamese">{{ word.vietnamese }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTopicById, getWordsByTopicId, getBookById } from '../db/database.js'

const route = useRoute()
const router = useRouter()
const topic = ref(null)
const words = ref([])
const bookName = ref('')

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

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .topic-name {
    font-size: 1.5rem;
  }
}
</style>
