<template>
  <div class="admin-view animate-fadeIn">
    <h1 class="page-title">
      <FeatherIcon type="settings" :size="28" /> Quản lý từ vựng
    </h1>

    <div class="admin-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
        <FeatherIcon type="book" :size="16" /> Sách
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'topics' }" @click="activeTab = 'topics'">
        <FeatherIcon type="file-text" :size="16" /> Chủ đề
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'words' }" @click="activeTab = 'words'">
        <FeatherIcon type="book-open" :size="16" /> Từ vựng
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'import' }" @click="activeTab = 'import'">
        <FeatherIcon type="download" :size="16" /> Import/Export
      </button>
    </div>

    <!-- Books Tab -->
    <div v-if="activeTab === 'books'" class="tab-content card">
      <div class="tab-header">
        <h2>Danh sách sách</h2>
        <button class="btn btn-primary" @click="showAddBook = true">
          <FeatherIcon type="plus" :size="16" /> Thêm sách
        </button>
      </div>

      <div class="item-list">
        <div class="list-item" v-for="book in books" :key="book.id">
          <div class="item-info">
            <FeatherIcon type="book" :size="20" class="item-icon" />
            <span class="item-name">{{ book.name }}</span>
          </div>
          <div class="item-actions">
            <button class="btn btn-ghost btn-sm" @click="editBook(book)">
              <FeatherIcon type="edit-2" :size="16" />
            </button>
            <button class="btn btn-ghost btn-sm" @click="confirmDeleteBook(book)">
              <FeatherIcon type="trash-2" :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Book Modal -->
      <div class="modal" v-if="showAddBook || editingBook">
        <div class="modal-content card">
          <h3>{{ editingBook ? 'Sửa sách' : 'Thêm sách mới' }}</h3>
          <input v-model="bookForm.name" class="input" placeholder="Tên sách">
          <input v-model="bookForm.description" class="input" placeholder="Mô tả (tùy chọn)">
          <input v-model="bookForm.coverImage" class="input" placeholder="Icon (emoji, tùy chọn)">
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelBookEdit">Hủy</button>
            <button class="btn btn-primary" @click="saveBook">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Topics Tab -->
    <div v-if="activeTab === 'topics'" class="tab-content card">
      <div class="tab-header">
        <h2>Danh sách chủ đề</h2>
        <button class="btn btn-primary" @click="showAddTopic = true">
          <FeatherIcon type="plus" :size="16" /> Thêm chủ đề
        </button>
      </div>

      <div class="filter-bar">
        <select v-model="selectedBookId" class="input">
          <option value="">-- Chọn sách --</option>
          <option v-for="book in books" :key="book.id" :value="book.id">
            {{ book.name }}
          </option>
        </select>
      </div>

      <div class="item-list">
        <div class="list-item" v-for="topic in filteredTopics" :key="topic.id">
          <div class="item-info">
            <FeatherIcon type="file-text" :size="20" class="item-icon" />
            <span class="item-name">{{ topic.name }}</span>
          </div>
          <div class="item-actions">
            <button class="btn btn-ghost btn-sm" @click="editTopic(topic)">
              <FeatherIcon type="edit-2" :size="16" />
            </button>
            <button class="btn btn-ghost btn-sm" @click="confirmDeleteTopic(topic)">
              <FeatherIcon type="trash-2" :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Topic Modal -->
      <div class="modal" v-if="showAddTopic || editingTopic">
        <div class="modal-content card">
          <h3>{{ editingTopic ? 'Sửa chủ đề' : 'Thêm chủ đề mới' }}</h3>
          <select v-model="topicForm.bookId" class="input">
            <option value="">-- Chọn sách --</option>
            <option v-for="book in books" :key="book.id" :value="book.id">
              {{ book.name }}
            </option>
          </select>
          <input v-model="topicForm.name" class="input" placeholder="Tên chủ đề">
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelTopicEdit">Hủy</button>
            <button class="btn btn-primary" @click="saveTopic">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Words Tab -->
    <div v-if="activeTab === 'words'" class="tab-content card">
      <div class="tab-header">
        <h2>Danh sách từ vựng</h2>
        <button class="btn btn-primary" @click="showAddWord = true">
          <FeatherIcon type="plus" :size="16" /> Thêm từ
        </button>
      </div>

      <div class="filter-bar">
        <select v-model="selectedTopicId" class="input">
          <option value="">-- Chọn chủ đề --</option>
          <option v-for="topic in topics" :key="topic.id" :value="topic.id">
            {{ topic.name }}
          </option>
        </select>
      </div>

      <div class="item-list">
        <div class="list-item word-item" v-for="word in filteredWords" :key="word.id">
          <div class="item-info">
            <div class="word-details">
              <span class="word-english">{{ word.english }}</span>
              <span class="word-vietnamese">{{ word.vietnamese }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-ghost btn-sm" @click="editWord(word)">
              <FeatherIcon type="edit-2" :size="16" />
            </button>
            <button class="btn btn-ghost btn-sm" @click="confirmDeleteWord(word)">
              <FeatherIcon type="trash-2" :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Word Modal -->
      <div class="modal" v-if="showAddWord || editingWord">
        <div class="modal-content card modal-large">
          <h3>{{ editingWord ? 'Sửa từ' : 'Thêm từ mới' }}</h3>
          <div class="modal-scroll">
            <select v-model="wordForm.topicId" class="input">
              <option value="">-- Chọn chủ đề --</option>
              <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                {{ topic.name }}
              </option>
            </select>
            <div class="form-row">
              <input v-model="wordForm.english" class="input" placeholder="Từ tiếng Anh *">
              <input v-model="wordForm.pronunciation" class="input" placeholder="Phiên âm (VD: /əˈɡriːmənt/)">
            </div>
            <input v-model="wordForm.vietnamese" class="input" placeholder="Nghĩa tiếng Việt *">
            <textarea v-model="wordForm.meaning" class="input textarea" placeholder="Định nghĩa tiếng Anh"></textarea>
            <textarea v-model="wordForm.example" class="input textarea" placeholder="Câu ví dụ"></textarea>
            <textarea v-model="wordForm.grammar" class="input textarea"
              placeholder="Ngữ pháp (VD: collocations, prepositions...)"></textarea>
            <input v-model="wordForm.wordForms" class="input"
              placeholder="Word Forms (VD: beauty (n), beautiful (adj))">
            <div class="form-row">
              <input v-model="wordForm.synonyms" class="input" placeholder="Từ đồng nghĩa (cách nhau bằng dấu phẩy)">
              <input v-model="wordForm.antonyms" class="input" placeholder="Từ trái nghĩa (cách nhau bằng dấu phẩy)">
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelWordEdit">Hủy</button>
            <button class="btn btn-primary" @click="saveWord">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import/Export Tab -->
    <div v-if="activeTab === 'import'" class="tab-content card">
      <h2 class="mb-6">Import / Export dữ liệu</h2>

      <div class="import-export-section">
        <div class="section-block">
          <h3>
            <FeatherIcon type="download" :size="20" /> Export dữ liệu
          </h3>
          <p class="text-muted">Xuất toàn bộ dữ liệu ra file JSON để backup</p>
          <button class="btn btn-primary mt-4" @click="handleExport">
            Tải xuống JSON
          </button>
        </div>

        <div class="section-block">
          <h3>
            <FeatherIcon type="upload" :size="20" /> Import dữ liệu
          </h3>
          <p class="text-muted">Nhập thêm sách mới từ file JSON (không ghi đè dữ liệu hiện tại)</p>
          <input type="file" ref="fileInput" accept=".json" @change="handleFileSelect" class="file-input">
          <button class="btn btn-secondary mt-4" @click="$refs.fileInput.click()">
            Chọn file JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getAllBooks, addBook, updateBook, deleteBook,
  getTopicsByBookId, addTopic, updateTopic, deleteTopic,
  getWordsByTopicId, addWord, updateWord, deleteWord,
  exportDatabase, importDatabase, db
} from '../db/database.js'
import { api } from '../services/api.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const activeTab = ref('import')

// Data
const books = ref([])
const topics = ref([])
const words = ref([])

// Filters
const selectedBookId = ref('')
const selectedTopicId = ref('')

// Modals
const showAddBook = ref(false)
const showAddTopic = ref(false)
const showAddWord = ref(false)

// Editing
const editingBook = ref(null)
const editingTopic = ref(null)
const editingWord = ref(null)

// Forms
const bookForm = ref({ name: '', description: '', coverImage: '' })
const topicForm = ref({ bookId: '', name: '' })
const wordForm = ref({ topicId: '', english: '', vietnamese: '', meaning: '', pronunciation: '', synonyms: '', antonyms: '', example: '', grammar: '', wordForms: '' })

// Computed
const filteredTopics = computed(() => {
  if (!selectedBookId.value) return topics.value
  return topics.value.filter(t => t.bookId === Number(selectedBookId.value))
})

const filteredWords = computed(() => {
  if (!selectedTopicId.value) return words.value
  return words.value.filter(w => w.topicId === Number(selectedTopicId.value))
})

// Load data
async function loadData() {
  books.value = await getAllBooks()

  // Load all topics
  topics.value = []
  for (const book of books.value) {
    const bookTopics = await getTopicsByBookId(book.id)
    topics.value.push(...bookTopics)
  }

  // Load all words
  words.value = []
  for (const topic of topics.value) {
    const topicWords = await getWordsByTopicId(topic.id)
    words.value.push(...topicWords)
  }
}

onMounted(loadData)

// Book CRUD
function editBook(book) {
  editingBook.value = book
  bookForm.value = { ...book }
}

function cancelBookEdit() {
  editingBook.value = null
  showAddBook.value = false
  bookForm.value = { name: '', description: '', coverImage: '' }
}

async function saveBook() {
  if (!bookForm.value.name) return

  if (editingBook.value) {
    await updateBook(editingBook.value.id, bookForm.value)
  } else {
    await addBook(bookForm.value)
  }

  await loadData()
  cancelBookEdit()
}

async function confirmDeleteBook(book) {
  if (confirm(`Xóa sách "${book.name}" và tất cả chủ đề, từ vựng liên quan?`)) {
    await deleteBook(book.id)
    await loadData()
  }
}

// Topic CRUD
function editTopic(topic) {
  editingTopic.value = topic
  topicForm.value = { ...topic }
}

function cancelTopicEdit() {
  editingTopic.value = null
  showAddTopic.value = false
  topicForm.value = { bookId: '', name: '' }
}

async function saveTopic() {
  if (!topicForm.value.name || !topicForm.value.bookId) return

  topicForm.value.bookId = Number(topicForm.value.bookId)

  if (editingTopic.value) {
    await updateTopic(editingTopic.value.id, topicForm.value)
  } else {
    await addTopic(topicForm.value)
  }

  await loadData()
  cancelTopicEdit()
}

async function confirmDeleteTopic(topic) {
  if (confirm(`Xóa chủ đề "${topic.name}" và tất cả từ vựng liên quan?`)) {
    await deleteTopic(topic.id)
    await loadData()
  }
}

// Word CRUD
function editWord(word) {
  editingWord.value = word
  wordForm.value = { ...word }
}

function cancelWordEdit() {
  editingWord.value = null
  showAddWord.value = false
  wordForm.value = { topicId: '', english: '', vietnamese: '', meaning: '', pronunciation: '', synonyms: '', antonyms: '', example: '', grammar: '', wordForms: '' }
}

async function saveWord() {
  if (!wordForm.value.english || !wordForm.value.vietnamese || !wordForm.value.topicId) return

  wordForm.value.topicId = Number(wordForm.value.topicId)

  if (editingWord.value) {
    await updateWord(editingWord.value.id, wordForm.value)
  } else {
    await addWord(wordForm.value)
  }

  await loadData()
  cancelWordEdit()
}

async function confirmDeleteWord(word) {
  if (confirm(`Xóa từ "${word.english}"?`)) {
    await deleteWord(word.id)
    await loadData()
  }
}

// Import/Export
async function handleExport() {
  try {
    const data = await exportDatabase()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'englearn-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    alert('Export thành công! File đã được tải về.')
  } catch (error) {
    alert('Lỗi khi export: ' + error.message)
  }
}


async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    const bookCount = data.books?.length || 0
    const topicCount = data.topics?.length || 0
    const wordCount = data.words?.length || 0

    if (confirm(`Import sẽ thêm ${bookCount} sách, ${topicCount} chủ đề, ${wordCount} từ vựng.\nTiếp tục?`)) {
      const result = await importDatabase(data)
      await loadData()
      alert(`Import thành công!\n- ${result.booksImported} sách\n- ${result.topicsImported} chủ đề\n- ${result.wordsImported} từ vựng`)
    }
  } catch (error) {
    alert('Lỗi khi import: ' + error.message)
  }

  event.target.value = ''
}
</script>

<style scoped>
.admin-view {
  padding-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background-color: white;
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--neutral-600);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  border-color: var(--mint-300);
  color: var(--mint-600);
}

.tab-btn.active {
  background-color: var(--mint-500);
  border-color: var(--mint-500);
  color: white;
}

/* Dark mode for tabs */
[data-theme="dark"] .tab-btn {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-muted);
}

[data-theme="dark"] .tab-btn:hover {
  border-color: var(--mint-400);
  color: var(--mint-400);
}

.tab-content {
  padding: 1.5rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.tab-header .btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-bar {
  margin-bottom: 1rem;
}

.filter-bar .input {
  max-width: 300px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-icon {
  color: var(--mint-500);
}

.item-name {
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.word-item .item-info {
  flex: 1;
}

.word-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.word-english {
  font-weight: 500;
  color: var(--text-primary);
}

.word-vietnamese {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content h3 {
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.textarea {
  min-height: 80px;
  resize: vertical;
}

/* Import/Export */
.import-export-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.section-block {
  padding: 1.5rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.section-block h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.section-block p {
  color: var(--text-muted);
}

.sync-status {
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
  background-color: var(--card-bg);
}

.sync-status span.success {
  color: #10b981;
}

.sync-status span.error {
  color: #ef4444;
}

.sync-status span.info {
  color: #3b82f6;
}

.file-input {
  display: none;
}

@media (max-width: 768px) {
  .import-export-section {
    grid-template-columns: 1fr;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-row {
    flex-direction: column;
  }
}

/* Extended modal for word form */
.modal-large {
  max-width: 600px;
}

.modal-scroll {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.modal-scroll::-webkit-scrollbar {
  width: 4px;
}

.modal-scroll::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-row .input {
  flex: 1;
}
</style>
