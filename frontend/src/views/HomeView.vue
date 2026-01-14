<template>
  <div class="home-view animate-fadeIn">
    <section class="hero">
      <h1 class="hero-title">Học Tiếng Anh Hiệu Quả</h1>
      <p class="hero-subtitle">Flash Cards, Quiz và nhiều hơn nữa</p>
    </section>

    <!-- AI Practice Section -->
    <section class="ai-practice-section">
      <h2 class="section-title">
        <FeatherIcon type="cpu" :size="24" /> Luyện tập với AI
      </h2>
      <div class="practice-grid">
        <div class="practice-card card card-clickable" @click="goToWordTypes">
          <div class="practice-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <FeatherIcon type="git-branch" :size="32" />
          </div>
          <div class="practice-info">
            <h3>Phân loại từ</h3>
            <p>Học nhận biết 8 loại từ cơ bản (Noun, Verb, Adj...) với quiz AI</p>
          </div>
          <FeatherIcon type="chevron-right" :size="20" class="practice-arrow" />
        </div>
      </div>
    </section>

    <!-- Dashboard Widget -->
    <section class="dashboard-section">
      <DashboardWidget ref="dashboardRef" />
    </section>

    <section class="books-section">
      <h2 class="section-title">
        <FeatherIcon type="book" :size="24" /> Sách Từ Vựng
      </h2>

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
        <BookCard v-for="book in books" :key="book.id" :book="book" :topic-count="topicCounts[book.id] || 0"
          @click="goToBook(book.id)" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import FeatherIcon from '../components/FeatherIcon.vue'
import DashboardWidget from '../components/DashboardWidget.vue'
import { getAllBooks, getTopicsByBookId } from '../db/database.js'

const router = useRouter()
const books = ref([])
const topicCounts = ref({})
const loading = ref(true)
const dashboardRef = ref(null)

onMounted(async () => {
  try {
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

function goToWordTypes() {
  router.push('/word-types')
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* AI Practice Section */
.ai-practice-section {
  margin-bottom: 2.5rem;
}

.practice-grid {
  display: grid;
  gap: 1rem;
}

.practice-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.08));
}

.practice-card:hover {
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.practice-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.practice-info {
  flex: 1;
}

.practice-info h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.practice-info p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.practice-arrow {
  color: var(--text-muted);
}
</style>
