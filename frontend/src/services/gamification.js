/**
 * Gamification Service
 * Handles XP, levels, streaks, and achievements
 * Data is isolated per user
 */

/**
 * Get storage key based on current user
 */
function getStorageKey() {
  const userStr = localStorage.getItem('englearn_user')
  const user = userStr ? JSON.parse(userStr) : null
  if (user && user.id) {
    return `englearn_gamification_${user.id}`
  }
  // Fallback for guest (shouldn't happen if routes are protected)
  return 'englearn_gamification_guest'
}

// XP rewards
export const XP_REWARDS = {
  LEARN_NEW_WORD: 10,
  REVIEW_CORRECT: 5,
  REVIEW_EASY: 7,
  REVIEW_HARD: 3,
  COMPLETE_TOPIC: 50,
  STREAK_BONUS: 10,      // Bonus per streak day
  PERFECT_REVIEW: 20     // All cards correct in a session
}

// Level thresholds (XP required)
const LEVEL_FORMULA = (level) => Math.floor(100 * Math.pow(level, 1.5))

// Achievement definitions
const ACHIEVEMENTS = {
  first_word: {
    id: 'first_word',
    name: 'Khởi đầu',
    description: 'Học từ vựng đầu tiên',
    icon: 'sun',
    condition: (stats) => stats.totalWordsLearned >= 1
  },
  ten_words: {
    id: 'ten_words',
    name: 'Tiến bộ',
    description: 'Học 10 từ vựng',
    icon: 'book',
    condition: (stats) => stats.totalWordsLearned >= 10
  },
  fifty_words: {
    id: 'fifty_words',
    name: 'Chăm chỉ',
    description: 'Học 50 từ vựng',
    icon: 'target',
    condition: (stats) => stats.totalWordsLearned >= 50
  },
  hundred_words: {
    id: 'hundred_words',
    name: 'Học giả',
    description: 'Học 100 từ vựng',
    icon: 'award',
    condition: (stats) => stats.totalWordsLearned >= 100
  },
  three_day_streak: {
    id: 'three_day_streak',
    name: 'Kiên trì',
    description: 'Đạt streak 3 ngày',
    icon: 'zap',
    condition: (stats) => stats.maxStreak >= 3
  },
  seven_day_streak: {
    id: 'seven_day_streak',
    name: 'Tuần hoàn hảo',
    description: 'Đạt streak 7 ngày',
    icon: 'activity',
    condition: (stats) => stats.maxStreak >= 7
  },
  thirty_day_streak: {
    id: 'thirty_day_streak',
    name: 'Bậc thầy',
    description: 'Đạt streak 30 ngày',
    icon: 'award',
    condition: (stats) => stats.maxStreak >= 30
  },
  level_5: {
    id: 'level_5',
    name: 'Newcomer',
    description: 'Đạt Level 5',
    icon: 'star',
    condition: (stats) => stats.level >= 5
  },
  level_10: {
    id: 'level_10',
    name: 'Explorer',
    description: 'Đạt Level 10',
    icon: 'star',
    condition: (stats) => stats.level >= 10
  },
  perfect_review: {
    id: 'perfect_review',
    name: 'Hoàn hảo',
    description: 'Hoàn thành ôn tập không sai',
    icon: 'check-circle',
    condition: (stats) => stats.perfectReviews >= 1
  }
}

/**
 * Get gamification data
 */
export function getGamificationData() {
  const data = localStorage.getItem(getStorageKey())
  return data ? JSON.parse(data) : getDefaultData()
}

/**
 * Get default gamification data
 */
function getDefaultData() {
  return {
    xp: 0,
    level: 1,
    totalWordsLearned: 0,
    totalReviews: 0,
    perfectReviews: 0,
    streak: {
      current: 0,
      max: 0,
      lastActiveDate: null
    },
    achievements: [],
    history: []
  }
}

/**
 * Save gamification data
 */
function saveData(data) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data))
}

/**
 * Add XP and handle level up
 */
export function addXP(amount, reason = '') {
  const data = getGamificationData()
  const oldLevel = data.level
  
  data.xp += amount
  data.level = calculateLevel(data.xp)
  
  // Add to history
  data.history.push({
    type: 'xp',
    amount,
    reason,
    date: new Date().toISOString()
  })
  
  // Keep only last 100 history items
  if (data.history.length > 100) {
    data.history = data.history.slice(-100)
  }
  
  saveData(data)
  
  const leveledUp = data.level > oldLevel
  return {
    xp: data.xp,
    level: data.level,
    leveledUp,
    oldLevel,
    newLevel: data.level
  }
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
  let level = 1
  let xpRequired = 0
  
  while (xpRequired <= xp) {
    level++
    xpRequired += LEVEL_FORMULA(level)
  }
  
  return level - 1
}

/**
 * Get level info (current XP, XP for next level, progress)
 */
export function getLevelInfo() {
  const data = getGamificationData()
  
  let xpForCurrentLevel = 0
  for (let i = 1; i < data.level; i++) {
    xpForCurrentLevel += LEVEL_FORMULA(i)
  }
  
  const xpForNextLevel = xpForCurrentLevel + LEVEL_FORMULA(data.level)
  const xpInLevel = data.xp - xpForCurrentLevel
  const xpNeeded = LEVEL_FORMULA(data.level)
  const progress = (xpInLevel / xpNeeded) * 100
  
  return {
    level: data.level,
    totalXP: data.xp,
    xpInLevel,
    xpNeeded,
    progress: Math.min(100, Math.max(0, progress))
  }
}

/**
 * Update streak
 */
export function updateStreak() {
  const data = getGamificationData()
  const today = getTodayString()
  const yesterday = getYesterdayString()
  
  if (data.streak.lastActiveDate === today) {
    // Already active today
    return { current: data.streak.current, increased: false }
  }
  
  if (data.streak.lastActiveDate === yesterday) {
    // Continue streak
    data.streak.current += 1
  } else if (data.streak.lastActiveDate === null) {
    // First time
    data.streak.current = 1
  } else {
    // Streak broken
    data.streak.current = 1
  }
  
  // Update max streak
  data.streak.max = Math.max(data.streak.max, data.streak.current)
  data.streak.lastActiveDate = today
  
  // Add streak bonus XP
  if (data.streak.current > 1) {
    data.xp += XP_REWARDS.STREAK_BONUS
    data.history.push({
      type: 'streak_bonus',
      amount: XP_REWARDS.STREAK_BONUS,
      streak: data.streak.current,
      date: new Date().toISOString()
    })
  }
  
  saveData(data)
  
  return { 
    current: data.streak.current, 
    increased: true,
    max: data.streak.max 
  }
}

/**
 * Get current streak info
 */
export function getStreak() {
  const data = getGamificationData()
  const today = getTodayString()
  const yesterday = getYesterdayString()
  
  // Check if streak is still valid
  if (data.streak.lastActiveDate !== today && 
      data.streak.lastActiveDate !== yesterday) {
    // Streak might be broken (unless they haven't learned today yet)
    return {
      current: data.streak.lastActiveDate === null ? 0 : 
               (data.streak.lastActiveDate === yesterday ? data.streak.current : 0),
      max: data.streak.max,
      isActive: data.streak.lastActiveDate === today,
      willBreak: data.streak.lastActiveDate !== today && 
                 data.streak.lastActiveDate !== yesterday &&
                 data.streak.current > 0
    }
  }
  
  return {
    current: data.streak.current,
    max: data.streak.max,
    isActive: data.streak.lastActiveDate === today,
    willBreak: false
  }
}

/**
 * Record word learned
 */
export function recordWordLearned() {
  const data = getGamificationData()
  data.totalWordsLearned += 1
  saveData(data)
  return addXP(XP_REWARDS.LEARN_NEW_WORD, 'Học từ mới')
}

/**
 * Record review completed
 */
export function recordReview(quality, isPerfectSession = false) {
  const data = getGamificationData()
  data.totalReviews += 1
  
  if (isPerfectSession) {
    data.perfectReviews += 1
  }
  
  saveData(data)
  
  let xpAmount = XP_REWARDS.REVIEW_CORRECT
  if (quality >= 5) {
    xpAmount = XP_REWARDS.REVIEW_EASY
  } else if (quality <= 2) {
    xpAmount = XP_REWARDS.REVIEW_HARD
  }
  
  if (isPerfectSession) {
    xpAmount += XP_REWARDS.PERFECT_REVIEW
  }
  
  return addXP(xpAmount, 'Ôn tập')
}

/**
 * Check and unlock achievements
 */
export function checkAchievements() {
  const data = getGamificationData()
  const stats = {
    totalWordsLearned: data.totalWordsLearned,
    maxStreak: data.streak.max,
    level: data.level,
    perfectReviews: data.perfectReviews
  }
  
  const newAchievements = []
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!data.achievements.includes(achievement.id) && achievement.condition(stats)) {
      data.achievements.push(achievement.id)
      newAchievements.push(achievement)
    }
  })
  
  if (newAchievements.length > 0) {
    saveData(data)
  }
  
  return newAchievements
}

/**
 * Get all achievements with unlock status
 */
export function getAchievements() {
  const data = getGamificationData()
  
  return Object.values(ACHIEVEMENTS).map(achievement => ({
    ...achievement,
    unlocked: data.achievements.includes(achievement.id)
  }))
}

/**
 * Get overall stats
 */
export function getStats() {
  const data = getGamificationData()
  const levelInfo = getLevelInfo()
  const streak = getStreak()
  
  return {
    xp: data.xp,
    level: levelInfo.level,
    levelProgress: levelInfo.progress,
    xpToNextLevel: levelInfo.xpNeeded - levelInfo.xpInLevel,
    streak: streak.current,
    maxStreak: streak.max,
    totalWordsLearned: data.totalWordsLearned,
    totalReviews: data.totalReviews,
    achievementsUnlocked: data.achievements.length,
    totalAchievements: Object.keys(ACHIEVEMENTS).length
  }
}

// Helper functions
function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayString() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

/**
 * Reset gamification data for current user (for debugging)
 */
export function resetGamification() {
  localStorage.removeItem(getStorageKey())
}
