import Dexie from 'dexie'
import { api } from '../services/api.js'

// Create database (Only for user progress now)
export const db = new Dexie('EngLearnDB')

// Define schema
db.version(4).stores({
  // Content tables are deprecated in favor of Backend API
  books: '++id, name', // Unused
  topics: '++id, bookId, name', // Unused
  words: '++id, topicId, english, vietnamese, meaning, pronunciation, synonyms, antonyms, example, grammar, wordForms', // Unused
  progress: '++id, wordId, correct, wrong, lastReview'
})

// Helper functions - Redirect to API

export async function getAllBooks() {
  return await api.getBooks()
}

export async function getBookById(id) {
  return await api.getBookById(id)
}

export async function getTopicsByBookId(bookId) {
  return await api.getTopicsByBookId(bookId)
}

export async function getTopicById(id) {
  return await api.getTopicById(id)
}

export async function getWordsByTopicId(topicId) {
  return await api.getWordsByTopicId(topicId)
}

export async function addBook(book) {
  return await api.createBook(book)
}

export async function updateBook(id, book) {
  return await api.updateBook(id, book)
}

export async function deleteBook(id) {
  return await api.deleteBook(id)
}

export async function addTopic(topic) {
  return await api.createTopic(topic)
}

export async function updateTopic(id, topic) {
  return await api.updateTopic(id, topic)
}

export async function deleteTopic(id) {
  return await api.deleteTopic(id)
}

export async function addWord(word) {
  return await api.createWord(word)
}

export async function updateWord(id, word) {
  return await api.updateWord(id, word)
}

export async function deleteWord(id) {
  return await api.deleteWord(id)
}

// Bulk add words - Assuming backend doesn't support bulk add based on api.js. 
// If AdminView uses this for import, we should iterate. 
// AdminView import calls importDatabase which calls bulkAdd.
export async function bulkAddWords(words) {
  // Not supported via API yet in a single call, or iterate.
  // For now, let's just loop sequentially or assume this is for local manual seeding (deprecated).
  // If we really need bulk import, we should add API endpoint.
  // But for now, let's map it to individual creates
  const promises = words.map(w => api.createWord(w))
  return Promise.all(promises)
}

// Progress functions - Keep using Local Dexie
export async function getProgress(wordId) {
  return await db.progress.where('wordId').equals(Number(wordId)).first()
}

export async function updateProgress(wordId, correct) {
  const existing = await getProgress(wordId)
  if (existing) {
    await db.progress.update(existing.id, {
      correct: correct ? existing.correct + 1 : existing.correct,
      wrong: correct ? existing.wrong : existing.wrong + 1,
      lastReview: new Date()
    })
  } else {
    await db.progress.add({
      wordId: Number(wordId),
      correct: correct ? 1 : 0,
      wrong: correct ? 0 : 1,
      lastReview: new Date()
    })
  }
}

// Export/Import functions - Updated to use API for fetching
export async function exportDatabase() {
  const books = await api.getBooks()
  // Fetch all recursively
  const booksFull = []
  const topicsFull = []
  const wordsFull = [] // This might be too heavy? AdminView limits scope?

  // Current exportDatabase fetched EVERYTHING.
  // With API, we might want to do this carefully.
  // For now, let's replicate behavior: fetch all.
  for (const b of books) {
    booksFull.push(b)
    const topics = await api.getTopicsByBookId(b.id)
    topicsFull.push(...topics)
    for (const t of topics) {
      const words = await api.getWordsByTopicId(t.id)
      wordsFull.push(...words)
    }
  }

  return { books: booksFull, topics: topicsFull, words: wordsFull }
}

export async function importDatabase(data) {
  // This is tricky. Do we wipe Backend? 
  // AdminView says "Import will overwrite existing data".
  // Existing local logic was db.books.clear().
  // Does Backend have clear all? No.
  // So implementing 'importDatabase' properly on backend requires a 'reset' endpoint.
  // Or we delete one by one (slow).
  // For now, let's ALERT that import behavior might be different or unimplemented.
  console.warn("Import not fully supported with backend switch yet.")
  // We can attempt to create but IDs will conflict if we don't clear.
  // For safety, let's throw or check.
  alert("Tính năng Import hiện đang bị khóa khi chuyển sang Backend.")
}

// Check if database is empty - Now check Backend
export async function isDatabaseEmpty() {
  const books = await api.getBooks()
  return books.length === 0
}
