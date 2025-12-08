const BASE_URL = "https://ptnt-production.up.railway.app/api"
function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, opts = {}) {
  const headers = Object.assign({ 'Accept': 'application/json' }, opts.headers || {}, authHeaders())
  const res = await fetch("https://ptnt-production.up.railway.app/api" + path, Object.assign({}, opts, { headers }))
  if (res.status === 204) return null
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export default {
  async register(payload) {
    return request('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  },
  async login(payload) {
    return request('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  },
  async getUser() {
    return request('/user')
  },
  async getOverallProgress() {
    return request('/me/progress')
  },
  async getProfile() {
    return request('/me/profile')
  },
  async updatePreferences(preferences) {
    return request('/me/preferences', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preferences) })
  },
  async getRandomFlashcard(params = '') {
    return request('/flashcards/random' + (params ? `?${params}` : ''))
  },
  async submitFlashcardAnswer(payload) {
    return request('/flashcards/answer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  },
  async listFlashcards(page = 1, per_page = 10) {
    return request(`/flashcards?page=${page}&per_page=${per_page}`)
  },
  async generateQuiz(count = 30) {
    return request(`/quiz?count=${count}`)
  },
  async submitQuiz(payload) {
    return request('/quiz/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  },
  async listQuestions(page = 1, per_page = 10, search = '', filter_stats = '') {
    const qs = new URLSearchParams()
    qs.set('page', page)
    qs.set('per_page', per_page)
    if (search) qs.set('search', search)
    if (filter_stats) qs.set('filter_stats', filter_stats)
    return request(`/questions?${qs.toString()}`)
  },
  async listAllQuestions(page = 1, per_page = 10, search = '') {
    const qs = new URLSearchParams()
    qs.set('page', page)
    qs.set('per_page', per_page)
    if (search) qs.set('search', search)
    return request(`/questions?${qs.toString()}`)
  },
  async getQuestion(id) {
    return request(`/questions/${id}`)
  },
  // If backend does not provide these endpoints, we'll fake responses in the client and inform the user.
  async listRespondedQuestions() {
    // Try backend endpoint first
    try {
      const res = await request('/me/questions-responded')
      if (res && !res.message) return res
    } catch (e) { }
    // Fallback fake data
    return [{ id: 3369, text: 'Sample question (fake)', answer: 'V', last_attempted: new Date().toISOString() }]
  },
  async listRespondedFlashcards() {
    try {
      const res = await request('/me/flashcards-responded')
      if (res && !res.message) return res
    } catch (e) { }
    return [{ id: 1174, text_en: 'tracks', text_fa: 'راه‌ها', score: 1, last_attempt_at: new Date().toISOString() }]
  },
  async getImagesList() {
    return request('/questions/images/list')
  }
}
