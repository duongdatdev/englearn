import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('englearn_access_token')
      if (accessToken) {
        return import('../views/HomeView.vue')
      }
      return import('../views/WelcomeView.vue')
    }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('../views/WelcomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/book/:id',
    name: 'Book',
    component: () => import('../views/BookView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/topic/:id',
    name: 'Topic',
    component: () => import('../views/TopicView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/:topicId',
    name: 'Learn',
    component: () => import('../views/LearnView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/flashcard/:topicId',
    name: 'FlashCard',
    component: () => import('../views/FlashCardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz/:topicId/:mode',
    name: 'Quiz',
    component: () => import('../views/QuizView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/paragraph/:topicId',
    name: 'Paragraph',
    component: () => import('../views/ParagraphPracticeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../views/ReviewView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/review/:topicId',
    name: 'ReviewTopic',
    component: () => import('../views/ReviewView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/word-types/:topicId?',
    name: 'WordTypes',
    component: () => import('../views/WordTypePracticeView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('englearn_access_token')
  const userStr = localStorage.getItem('englearn_user')
  const user = userStr ? JSON.parse(userStr) : null
  const isAuthenticated = !!accessToken && !!user
  const isAdmin = user?.role === 'ADMIN'

  // Guest only pages (login, register)
  if (to.meta.guestOnly && isAuthenticated) {
    next('/')
    return
  }

  // Auth required pages
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Admin required pages
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/')
    return
  }

  next()
})

export default router
