<template>
  <div class="book-view animate-fadeIn">
    <div class="breadcrumb">
      <router-link to="/" class="breadcrumb-link">Trang chủ</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ book?.name || 'Đang tải...' }}</span>
    </div>
    
    <header class="book-header" v-if="book">
      <span class="book-icon">{{ book.coverImage || '📚' }}</span>
      <div class="book-info">
        <h1 class="book-name">{{ book.name }}</h1>
        <p class="book-description" v-if="book.description">{{ book.description }}</p>
      </div>
    </header>
    
    <section class="topics-section">
      <h2 class="section-title">📝 Chủ Đề</h2>
      
      <div v-if="loading" class="loading">
        <span class="animate-pulse">Đang tải...</span>
      </div>
      
      <div v-else-if="topics.length === 0" class="empty-state">
        <p>Chưa có chủ đề nào trong sách này.</p>
        <router-link to="/admin" class="btn btn-primary">
          Thêm chủ đề
        </router-link>
      </div>
      
      <div v-else class="grid grid-cols-3">
        <TopicCard 
          v-for="topic in topics" 
          :key="topic.id"
          :topic="topic"
          :word-count="wordCounts[topic.id] || 0"
          @click="goToTopic(topic.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopicCard from '../components/TopicCard.vue'
import { getBookById, getTopicsByBookId, getWordsByTopicId } from '../db/database.js'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const topics = ref([])
const wordCounts = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const bookId = route.params.id
    
    book.value = await getBookById(bookId)
    topics.value = await getTopicsByBookId(bookId)
    
    // Get word counts for each topic
    for (const topic of topics.value) {
      const words = await getWordsByTopicId(topic.id)
      wordCounts.value[topic.id] = words.length
    }
  } catch (error) {
    console.error('Error loading book:', error)
  } finally {
    loading.value = false
  }
})

function goToTopic(id) {
  router.push(`/topic/${id}`)
}
</script>

<style scoped>
.book-view {
  padding-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
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

.book-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.book-icon {
  font-size: 4rem;
}

.book-info {
  flex: 1;
}

.book-name {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.book-description {
  color: var(--text-muted);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-color);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
