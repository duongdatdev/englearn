<template>
  <div class="my-decks-view animate-fadeIn">
    <div class="header">
      <div class="header-content">
        <h1>
          <FeatherIcon type="layers" :size="32" />
          Bộ từ của tôi
        </h1>
        <p>Quản lý các bộ từ vựng cá nhân của bạn</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <FeatherIcon type="plus" :size="18" /> Tạo bộ từ mới
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-overview" v-if="topics.length > 0">
      <div class="stat-card">
        <span class="stat-value">{{ topics.length }}</span>
        <span class="stat-label">Bộ từ</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ totalWords }}</span>
        <span class="stat-label">Tổng số từ</span>
      </div>
    </div>

    <!-- Decks Grid -->
    <div class="decks-grid" v-if="loading">
      <div class="skeleton-card" v-for="i in 3" :key="i"></div>
    </div>

    <div class="decks-grid" v-else-if="topics.length > 0">
      <div v-for="topic in topics" :key="topic.id" class="topic-card card">
        <div class="topic-header">
          <div class="topic-icon">
            <FeatherIcon type="book" :size="24" />
          </div>
          <div class="topic-actions">
            <button class="btn-icon" @click="editTopic(topic)">
              <FeatherIcon type="edit-2" :size="16" />
            </button>
            <button class="btn-icon delete" @click="confirmDelete(topic)">
              <FeatherIcon type="trash-2" :size="16" />
            </button>
          </div>
        </div>
        
        <h3 class="topic-name">{{ topic.name }}</h3>
        <p class="topic-meta">0 từ vựng</p>

        <div class="topic-footer">
          <button class="btn btn-secondary full-width" @click="openDeck(topic)">
             Xem & Thêm từ
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <FeatherIcon type="folder" :size="48" />
      </div>
      <h2>Chưa có bộ từ nào</h2>
      <p>Tạo bộ từ đầu tiên để bắt đầu học theo cách riêng của bạn!</p>
      <button class="btn btn-primary" @click="showCreateModal = true">
        Tạo ngay
      </button>
    </div>

    <!-- Create Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal card">
        <h2>Tạo bộ từ mới</h2>
        <div class="form-group">
          <label>Tên bộ từ</label>
          <input 
            v-model="newTopicName" 
            placeholder="Ví dụ: Từ vựng du lịch, IELTS Speaking..." 
            class="form-input"
            @keyup.enter="createTopic"
            ref="inputRef"
          >
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showCreateModal = false">Hủy</button>
          <button class="btn btn-primary" @click="createTopic" :disabled="!newTopicName.trim()">
            <FeatherIcon type="check" :size="18" /> Tạo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const topics = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const newTopicName = ref('')
const inputRef = ref(null)

const totalWords = computed(() => {
  return 0 // TODO: Add word count to API response or fetch separately
})

watch(showCreateModal, (val) => {
  if (val) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

onMounted(async () => {
  await fetchTopics()
})

async function fetchTopics() {
  loading.value = true
  try {
    topics.value = await api.getMyTopics()
  } catch (error) {
    console.error('Failed to load topics:', error)
  } finally {
    loading.value = false
  }
}

async function createTopic() {
  if (!newTopicName.value.trim()) return

  try {
    await api.createCustomTopic({
      name: newTopicName.value,
      // book: null (handled by backend for custom topics)
    })
    showCreateModal.value = false
    newTopicName.value = ''
    await fetchTopics()
  } catch (error) {
    console.error('Failed to create topic:', error)
    alert('Không thể tạo bộ từ. Vui lòng thử lại.')
  }
}

async function confirmDelete(topic) {
  if (confirm(`Bạn có chắc muốn xóa bộ từ "${topic.name}"?`)) {
    try {
      await api.deleteTopic(topic.id)
      await fetchTopics()
    } catch (error) {
      console.error('Failed to delete topic:', error)
      alert('Không thể xóa bộ từ.')
    }
  }
}

function editTopic(topic) {
  // TODO: Rename functionality
}

function openDeck(topic) {
  // Navigate to deck editor (to be created)
  router.push(`/decks/${topic.id}`)
}
</script>

<style scoped>
.my-decks-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  color: var(--text-primary);
}

.header-content p {
  color: var(--text-muted);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--mint-500);
}

.stat-label {
  color: var(--text-muted);
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.topic-card {
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.topic-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint-600);
}

.topic-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.topic-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.topic-meta {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.topic-footer {
  margin-top: auto;
}

.full-width {
  width: 100%;
  justify-content: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal h2 {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-input:focus {
  border-color: var(--mint-500);
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: var(--card-bg);
  border-radius: var(--radius-2xl);
  border: 2px dashed var(--border-color);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--text-muted);
}

.empty-state h2 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

/* Skeleton */
.skeleton-card {
  height: 200px;
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}
</style>
