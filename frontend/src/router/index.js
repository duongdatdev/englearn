import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/book/:id',
    name: 'Book',
    component: () => import('../views/BookView.vue')
  },
  {
    path: '/topic/:id',
    name: 'Topic',
    component: () => import('../views/TopicView.vue')
  },
  {
    path: '/learn/:topicId',
    name: 'Learn',
    component: () => import('../views/LearnView.vue')
  },
  {
    path: '/flashcard/:topicId',
    name: 'FlashCard',
    component: () => import('../views/FlashCardView.vue')
  },
  {
    path: '/quiz/:topicId/:mode',
    name: 'Quiz',
    component: () => import('../views/QuizView.vue')
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultView.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue')
  },
  {
    path: '/paragraph/:topicId',
    name: 'Paragraph',
    component: () => import('../views/ParagraphPracticeView.vue')
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../views/ReviewView.vue')
  },
  {
    path: '/review/:topicId',
    name: 'ReviewTopic',
    component: () => import('../views/ReviewView.vue')
  },
  {
    path: '/word-types/:topicId?',
    name: 'WordTypes',
    component: () => import('../views/WordTypePracticeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
