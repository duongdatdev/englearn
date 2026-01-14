import { ref, computed, watch } from 'vue'

const API_URL = 'http://localhost:8080/api'

// Storage keys
const ACCESS_TOKEN_KEY = 'englearn_access_token'
const REFRESH_TOKEN_KEY = 'englearn_refresh_token'
const USER_KEY = 'englearn_user'

// Reactive state (singleton)
const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
const accessToken = ref(localStorage.getItem(ACCESS_TOKEN_KEY) || null)
const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) || null)
const isLoading = ref(false)
const error = ref(null)

// Watch and persist to localStorage
watch(user, (newUser) => {
  if (newUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}, { deep: true })

watch(accessToken, (newToken) => {
  if (newToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
})

watch(refreshToken, (newToken) => {
  if (newToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, newToken)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
})

/**
 * Auth composable for managing authentication state
 */
export function useAuth() {
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const currentUser = computed(() => user.value)

  /**
   * Register a new user
   */
  async function register(email, password, displayName = null) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Save tokens and user
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = data.user

      // Sync localStorage progress to server
      await syncLocalProgressToServer()

      return { success: true, user: data.user }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with email and password
   */
  async function login(email, password) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Save tokens and user
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = data.user

      // Sync localStorage progress to server
      await syncLocalProgressToServer()

      return { success: true, user: data.user }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout and clear tokens
   */
  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    error.value = null
  }

  /**
   * Refresh access token using refresh token
   */
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken.value })
      })

      const data = await response.json()

      if (!response.ok) {
        // Refresh token expired, logout
        logout()
        return false
      }

      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = data.user
      return true
    } catch (e) {
      logout()
      return false
    }
  }

  /**
   * Get current user from server
   */
  async function fetchCurrentUser() {
    if (!accessToken.value) {
      return null
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return fetchCurrentUser()
        }
        return null
      }

      if (!response.ok) {
        return null
      }

      const userData = await response.json()
      user.value = userData
      return userData
    } catch (e) {
      return null
    }
  }

  /**
   * Check if user is authenticated (verify with server)
   */
  async function checkAuth() {
    if (!accessToken.value) {
      return false
    }

    const userData = await fetchCurrentUser()
    return !!userData
  }

  /**
   * Make authenticated API request
   */
  async function authFetch(url, options = {}) {
    if (!accessToken.value) {
      throw new Error('Not authenticated')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken.value}`,
      ...options.headers
    }

    let response = await fetch(url, { ...options, headers })

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken.value}`
        response = await fetch(url, { ...options, headers })
      } else {
        throw new Error('Session expired. Please login again.')
      }
    }

    return response
  }

  /**
   * Sync localStorage progress to server on first login
   */
  async function syncLocalProgressToServer() {
    try {
      // Get gamification data from localStorage
      const gamificationData = localStorage.getItem('englearn_gamification')
      const srsData = localStorage.getItem('englearn_srs_progress')

      if (!gamificationData && !srsData) {
        return
      }

      const gamification = gamificationData ? JSON.parse(gamificationData) : {}
      const srs = srsData ? JSON.parse(srsData) : {}

      const progressDto = {
        xp: gamification.xp || 0,
        level: gamification.level || 1,
        totalWordsLearned: gamification.totalWordsLearned || 0,
        totalReviews: gamification.totalReviews || 0,
        perfectReviews: gamification.perfectReviews || 0,
        streak: gamification.streak?.current || 0,
        maxStreak: gamification.streak?.max || 0,
        lastActiveDate: gamification.streak?.lastActiveDate || null,
        srsData: JSON.stringify(srs),
        achievements: JSON.stringify(gamification.achievements || []),
        history: JSON.stringify(gamification.history || [])
      }

      await authFetch(`${API_URL}/user/progress/sync`, {
        method: 'POST',
        body: JSON.stringify(progressDto)
      })

    } catch (e) {
      console.error('Failed to sync progress:', e)
    }
  }

  /**
   * Get authorization header for API calls
   */
  function getAuthHeader() {
    return accessToken.value ? { 'Authorization': `Bearer ${accessToken.value}` } : {}
  }

  return {
    // State
    user: currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    accessToken,
    
    // Methods
    register,
    login,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    checkAuth,
    authFetch,
    getAuthHeader
  }
}
