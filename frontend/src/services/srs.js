/**
 * Spaced Repetition System (SRS) Service
 * Implements SM-2 algorithm for optimal review scheduling
 * Data is isolated per user
 */

// SM-2 Algorithm Parameters
const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

/**
 * Get storage key based on current user
 */
function getStorageKey() {
  const userStr = localStorage.getItem('englearn_user')
  const user = userStr ? JSON.parse(userStr) : null
  if (user && user.id) {
    return `englearn_srs_progress_${user.id}`
  }
  // Fallback for guest (shouldn't happen if routes are protected)
  return 'englearn_srs_progress_guest'
}

/**
 * Quality ratings for SM-2
 * 0-2: Failed to recall
 * 3: Recalled with difficulty
 * 4: Recalled correctly
 * 5: Recalled easily
 */
export const QUALITY = {
  FORGOT: 0,        // Completely forgot
  HARD: 3,          // Hard to recall
  GOOD: 4,          // Recalled correctly
  EASY: 5           // Very easy
}

/**
 * Get all SRS progress data
 */
export function getAllProgress() {
  const data = localStorage.getItem(getStorageKey())
  return data ? JSON.parse(data) : {}
}

/**
 * Save SRS progress data
 */
function saveProgress(data) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data))
}

/**
 * Get card progress for a specific word
 */
export function getCardProgress(wordId) {
  const progress = getAllProgress()
  return progress[`word_${wordId}`] || null
}

/**
 * Initialize a new card in the SRS system
 */
export function initializeCard(word) {
  const progress = getAllProgress()
  const cardKey = `word_${word.id}`
  
  if (!progress[cardKey]) {
    progress[cardKey] = {
      wordId: word.id,
      word: word.english,
      vietnamese: word.vietnamese,
      topicId: word.topicId || word.topic?.id,
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      nextReviewDate: getTodayString(),
      lastReviewDate: null,
      createdAt: new Date().toISOString()
    }
    saveProgress(progress)
  }
  
  return progress[cardKey]
}

/**
 * Calculate next review using SM-2 algorithm
 * @param {number} quality - Rating 0-5
 * @param {object} card - Current card progress
 * @returns {object} Updated card with new interval and next review date
 */
export function calculateNextReview(quality, card) {
  let { easeFactor, interval, repetitions } = card
  
  if (quality < 3) {
    // Failed recall - reset
    repetitions = 0
    interval = 1
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor)
  
  // Calculate next review date
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)
  
  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: formatDate(nextDate),
    lastReviewDate: getTodayString()
  }
}

/**
 * Update card progress after review
 */
export function updateCardProgress(wordId, quality) {
  const progress = getAllProgress()
  const cardKey = `word_${wordId}`
  
  if (progress[cardKey]) {
    const updatedCard = calculateNextReview(quality, progress[cardKey])
    progress[cardKey] = updatedCard
    saveProgress(progress)
    return updatedCard
  }
  return null
}

/**
 * Get all cards due for review today
 */
export function getCardsForReview(topicId = null) {
  const progress = getAllProgress()
  const today = getTodayString()
  
  return Object.values(progress).filter(card => {
    const isDue = card.nextReviewDate <= today
    const matchesTopic = topicId ? card.topicId == topicId : true
    return isDue && matchesTopic
  }).sort((a, b) => {
    // Sort by: due first, then by ease factor (harder cards first)
    if (a.nextReviewDate !== b.nextReviewDate) {
      return a.nextReviewDate.localeCompare(b.nextReviewDate)
    }
    return a.easeFactor - b.easeFactor
  })
}

/**
 * Get review statistics
 */
export function getReviewStats() {
  const progress = getAllProgress()
  const cards = Object.values(progress)
  const today = getTodayString()
  
  return {
    totalCards: cards.length,
    dueToday: cards.filter(c => c.nextReviewDate <= today).length,
    mastered: cards.filter(c => c.interval >= 21).length, // 3 weeks interval
    learning: cards.filter(c => c.interval < 21 && c.interval > 0).length,
    newToday: cards.filter(c => c.lastReviewDate === today && c.repetitions === 1).length,
    reviewedToday: cards.filter(c => c.lastReviewDate === today).length
  }
}

/**
 * Get cards by topic with their SRS status
 */
export function getTopicProgress(topicId) {
  const progress = getAllProgress()
  const today = getTodayString()
  
  const topicCards = Object.values(progress).filter(c => c.topicId == topicId)
  
  return {
    total: topicCards.length,
    dueToday: topicCards.filter(c => c.nextReviewDate <= today).length,
    mastered: topicCards.filter(c => c.interval >= 21).length,
    learning: topicCards.filter(c => c.interval < 21 && c.interval > 0).length
  }
}

/**
 * Get upcoming reviews (next 7 days)
 */
export function getUpcomingReviews() {
  const progress = getAllProgress()
  const upcoming = {}
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)
    upcoming[dateStr] = Object.values(progress).filter(c => c.nextReviewDate === dateStr).length
  }
  
  return upcoming
}

// Helper functions
function getTodayString() {
  return formatDate(new Date())
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Bulk initialize cards for a topic
 */
export function initializeTopicCards(words, topicId) {
  const progress = getAllProgress()
  let newCount = 0
  
  words.forEach(word => {
    const cardKey = `word_${word.id}`
    if (!progress[cardKey]) {
      progress[cardKey] = {
        wordId: word.id,
        word: word.english,
        vietnamese: word.vietnamese,
        topicId: topicId,
        easeFactor: DEFAULT_EASE_FACTOR,
        interval: 0,
        repetitions: 0,
        nextReviewDate: getTodayString(),
        lastReviewDate: null,
        createdAt: new Date().toISOString()
      }
      newCount++
    }
  })
  
  saveProgress(progress)
  return newCount
}

/**
 * Clear all SRS data for current user (for debugging)
 */
export function clearAllProgress() {
  localStorage.removeItem(getStorageKey())
}
