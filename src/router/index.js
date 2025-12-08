import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Flashcard from '../pages/Flashcard.vue'
import FlashcardsList from '../pages/FlashcardsList.vue'
import Quiz from '../pages/Quiz.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import QuestionsResponded from '../pages/QuestionsResponded.vue'
import FlashcardsResponded from '../pages/FlashcardsResponded.vue'
import Images from '../pages/Images.vue'
import Profile from '../pages/Profile.vue'
import AllQuestions from '../pages/AllQuestions.vue'

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/flashcard', component: Flashcard, meta: { requiresAuth: true } },
  { path: '/flashcards', component: FlashcardsList, meta: { requiresAuth: true } },
  { path: '/quiz', component: Quiz, meta: { requiresAuth: true } },
  { path: '/questions-responded', component: QuestionsResponded, meta: { requiresAuth: true } },
  { path: '/flashcards-responded', component: FlashcardsResponded, meta: { requiresAuth: true } },
  { path: '/signs', component: Images, meta: { requiresAuth: true } },
  { path: '/all-questions', component: AllQuestions, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
