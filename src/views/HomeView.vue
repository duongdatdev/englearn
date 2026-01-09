<template>
  <div class="home-view animate-fadeIn">
    <section class="hero">
      <h1 class="hero-title">Học Tiếng Anh Hiệu Quả</h1>
      <p class="hero-subtitle">Flash Cards, Quiz và nhiều hơn nữa</p>
    </section>
    
    <section class="books-section">
      <h2 class="section-title">📚 Sách Từ Vựng</h2>
      
      <div v-if="loading" class="loading">
        <span class="animate-pulse">Đang tải...</span>
      </div>
      
      <div v-else-if="books.length === 0" class="empty-state">
        <p>Chưa có sách nào.</p>
        <router-link to="/admin" class="btn btn-primary">
          Thêm sách mới
        </router-link>
      </div>
      
      <div v-else class="grid grid-cols-2">
        <BookCard 
          v-for="book in books" 
          :key="book.id"
          :book="book"
          :topic-count="topicCounts[book.id] || 0"
          @click="goToBook(book.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import { getAllBooks, getTopicsByBookId } from '../db/database.js'
import { seedDatabase } from '../db/seedData.js'

const router = useRouter()
const books = ref([])
const topicCounts = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    // Seed database if empty
    await seedDatabase()
    
    // Load books
    books.value = await getAllBooks()
    
    // Get topic counts for each book
    for (const book of books.value) {
      const topics = await getTopicsByBookId(book.id)
      topicCounts.value[book.id] = topics.length
    }
  } catch (error) {
    console.error('Error loading books:', error)
  } finally {
    loading.value = false
  }
})

function goToBook(id) {
  router.push(`/book/${id}`)
}
</script>

<style scoped>
.home-view {
  padding-bottom: 2rem;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  color: var(--mint-500);
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
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
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
