import Dexie from 'dexie'

// Create database
export const db = new Dexie('EngLearnDB')

// Define schema - Version 4 with wordForms field
db.version(4).stores({
  books: '++id, name',
  topics: '++id, bookId, name',
  words: '++id, topicId, english, vietnamese, meaning, pronunciation, synonyms, antonyms, example, grammar, wordForms',
  progress: '++id, wordId, correct, wrong, lastReview'
}).upgrade(tx => {
  return tx.table('words').toCollection().modify(word => {
    word.wordForms = word.wordForms || ''
  })
})

// Version 3
db.version(3).stores({
  books: '++id, name',
  topics: '++id, bookId, name',
  words: '++id, topicId, english, vietnamese, meaning, pronunciation, synonyms, antonyms, example, grammar',
  progress: '++id, wordId, correct, wrong, lastReview'
})

// Version 2
db.version(2).stores({
  books: '++id, name',
  topics: '++id, bookId, name',
  words: '++id, topicId, english, vietnamese, meaning, pronunciation, synonyms, antonyms, example',
  progress: '++id, wordId, correct, wrong, lastReview'
})

// Keep version 1 for backward compatibility
db.version(1).stores({
  books: '++id, name',
  topics: '++id, bookId, name',
  words: '++id, topicId, english, vietnamese, meaning',
  progress: '++id, wordId, correct, wrong, lastReview'
})

// Helper functions
export async function getAllBooks() {
  return await db.books.toArray()
}

export async function getBookById(id) {
  return await db.books.get(Number(id))
}

export async function getTopicsByBookId(bookId) {
  return await db.topics.where('bookId').equals(Number(bookId)).toArray()
}

export async function getTopicById(id) {
  return await db.topics.get(Number(id))
}

export async function getWordsByTopicId(topicId) {
  return await db.words.where('topicId').equals(Number(topicId)).toArray()
}

export async function addBook(book) {
  return await db.books.add(book)
}

export async function updateBook(id, book) {
  return await db.books.update(Number(id), book)
}

export async function deleteBook(id) {
  // Delete all related topics and words first
  const topics = await getTopicsByBookId(id)
  for (const topic of topics) {
    await db.words.where('topicId').equals(topic.id).delete()
  }
  await db.topics.where('bookId').equals(Number(id)).delete()
  return await db.books.delete(Number(id))
}

export async function addTopic(topic) {
  return await db.topics.add(topic)
}

export async function updateTopic(id, topic) {
  return await db.topics.update(Number(id), topic)
}

export async function deleteTopic(id) {
  await db.words.where('topicId').equals(Number(id)).delete()
  return await db.topics.delete(Number(id))
}

export async function addWord(word) {
  return await db.words.add(word)
}

export async function updateWord(id, word) {
  return await db.words.update(Number(id), word)
}

export async function deleteWord(id) {
  return await db.words.delete(Number(id))
}

export async function bulkAddWords(words) {
  return await db.words.bulkAdd(words)
}

// Progress functions
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

// Export/Import functions
export async function exportDatabase() {
  const books = await db.books.toArray()
  const topics = await db.topics.toArray()
  const words = await db.words.toArray()
  return { books, topics, words }
}

export async function importDatabase(data) {
  await db.transaction('rw', [db.books, db.topics, db.words], async () => {
    await db.books.clear()
    await db.topics.clear()
    await db.words.clear()
    
    if (data.books) await db.books.bulkAdd(data.books)
    if (data.topics) await db.topics.bulkAdd(data.topics)
    if (data.words) await db.words.bulkAdd(data.words)
  })
}

// Check if database is empty
export async function isDatabaseEmpty() {
  const count = await db.books.count()
  return count === 0
}
