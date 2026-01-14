const API_URL = 'http://localhost:8080/api'

// Helper to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('englearn_access_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const api = {
  async getBooks() {
    const response = await fetch(`${API_URL}/books`)
    return response.json()
  },

  async getBookById(id) {
    const response = await fetch(`${API_URL}/books/${id}`)
    if (!response.ok) throw new Error('Book not found')
    return response.json()
  },

  async getTopicsByBookId(bookId) {
    const response = await fetch(`${API_URL}/topics/book/${bookId}`)
    return response.json()
  },

  async getTopicById(id) {
    const response = await fetch(`${API_URL}/topics/${id}`)
    if (!response.ok) throw new Error('Topic not found')
    return response.json()
  },

  async getWordsByTopicId(topicId) {
    const response = await fetch(`${API_URL}/words/topic/${topicId}`)
    return response.json()
  },

  async createBook(book) {
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    })
    return response.json()
  },

  async createTopic(topic) {
    const response = await fetch(`${API_URL}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(topic)
    })
    return response.json()
  },


  async createWord(word) {
    const response = await fetch(`${API_URL}/words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(word)
    })
    return response.json()
  },

  async updateBook(id, book) {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(book)
    })
    return response.json()
  },

  async deleteBook(id) {
    await fetch(`${API_URL}/books/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async updateTopic(id, topic) {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(topic)
    })
    return response.json()
  },

  async deleteTopic(id) {
    await fetch(`${API_URL}/topics/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async updateWord(id, word) {
    const response = await fetch(`${API_URL}/words/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(word)
    })
    return response.json()
  },

  async deleteWord(id) {
    await fetch(`${API_URL}/words/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
  },

  async checkHealth() {
    try {
      await fetch(`${API_URL}/books`)
      return true
    } catch (e) {
      return false
    }
  },

  // AI Features
  async getSynonymsAntonyms(word) {
    const response = await fetch(`${API_URL}/ai/synonyms-antonyms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    })
    return response.json()
  },

  async checkSpelling(input, expected, context = null) {
    const response = await fetch(`${API_URL}/ai/spell-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, expected, context })
    })
    return response.json()
  },

  async explainWord(word, context = null) {
    const response = await fetch(`${API_URL}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, context })
    })
    return response.json()
  },

  async generateSentences(word, level = 'medium') {
    const response = await fetch(`${API_URL}/ai/sentences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, level })
    })
    return response.json()
  },

  async getQuizHint(question, wrongAnswer, correctAnswer) {
    const response = await fetch(`${API_URL}/ai/quiz-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, wrongAnswer, correctAnswer })
    })
    return response.json()
  },

  async smartSearch(input) {
    const response = await fetch(`${API_URL}/ai/smart-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    })
    return response.json()
  },

  async generateParagraphBlanks(words, topic) {
    const response = await fetch(`${API_URL}/ai/paragraph-blanks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, topic })
    })
    return response.json()
  },

  async gradeSentence(word, vietnamese, userSentence) {
    const response = await fetch(`${API_URL}/ai/grade-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, vietnamese, userSentence })
    })
    return response.json()
  },

  // Word Type Learning
  async getWordTypeLesson(words = []) {
    const response = await fetch(`${API_URL}/ai/word-type-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words })
    })
    return response.json()
  },

  async getWordTypeQuiz(words = [], questionCount = 5) {
    const response = await fetch(`${API_URL}/ai/word-type-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words, level: String(questionCount) })
    })
    return response.json()
  }
}
