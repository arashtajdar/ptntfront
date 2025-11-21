<script setup>
import { ref, nextTick, computed, onUnmounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import PageHeader from '../components/PageHeader.vue'
import ProgressBar from 'primevue/progressbar'

const questions = ref([])
const loading = ref(false)
const result = ref(null)
const current = ref(0)
const resultContainer = ref(null)

// Timer logic
const timer = ref(20 * 60) // 20 minutes in seconds
const timerInterval = ref(null)

const formattedTimer = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const timerColor = computed(() => {
  if (timer.value < 60) return '#ef4444' // Red (< 1 min)
  if (timer.value < 5 * 60) return '#f97316' // Orange (< 5 min)
  return '#22c55e' // Green
})

function startTimer() {
  clearInterval(timerInterval.value)
  timer.value = 20 * 60
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      submit() // Auto-submit when time runs out
    }
  }, 1000)
}

function stopTimer() {
  clearInterval(timerInterval.value)
}

onUnmounted(() => {
  stopTimer()
})

async function gen() {
  loading.value = true
  const res = await api.generateQuiz(30)
  if (Array.isArray(res)) {
    questions.value = res.map(q => ({ ...q }))
    current.value = 0
    result.value = null
    startTimer()
  }
  loading.value = false
}

function answer(val) {
  questions.value[current.value]._answer = val
  // go to next if not last
  if (current.value < questions.value.length - 1) {
    current.value++
  }
}

function go(idx) {
  if (idx >= 0 && idx < questions.value.length) current.value = idx
}

async function submit() {
  stopTimer()
  const ids = questions.value.map(q => q.id)
  const answers = questions.value.map(q => q._answer || '')
  const res = await api.submitQuiz({ question_ids: ids, answers })
  result.value = res
  await nextTick()
  if (resultContainer.value) {
    resultContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div>
    <PageHeader title="Quiz Challenge" subtitle="Test your knowledge with 30 questions" />
    <div class="quiz-container">
    <Card class="quiz-card">
      <template #title>
        <div class="quiz-header">
          <div v-if="!questions.length" class="start-btn-container">
            <Button 
              label="Start New Quiz" 
              icon="pi pi-play" 
              @click="gen" 
              severity="primary"
              rounded
              size="large"
            />
          </div>
          <div v-else class="header-content">
            <div class="timer-display" :style="{ color: timerColor }">
              <i class="pi pi-clock"></i>
              <span>{{ formattedTimer }}</span>
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="loading" class="state-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-500)"></i>
          <p>Generating questions...</p>
        </div>

        <div v-else-if="questions.length" class="quiz-content">
          <div class="progress-indicator">
            <div class="progress-text">
              <span>Question {{ current + 1 }}</span>
              <span class="total">of {{ questions.length }}</span>
            </div>
            <ProgressBar :value="((current + 1) / questions.length) * 100" :showValue="false" style="height: 6px" />
          </div>

          <div class="question-box">
            <div class="question-content">
              <div class="question-image">
                <img :src="questions[current].image ? '/images/'+questions[current].image : '/images/no-image.svg'" alt="Question Image" />
              </div>
              
              <div class="question-text-wrapper">
                <h3 class="question-text">{{ questions[current].text }}</h3>
              </div>
            </div>

            <div class="answer-actions">
              <Button 
                label="Vero" 
                icon="pi pi-check" 
                @click="answer('V')" 
                :class="['ans-btn', { 
                  'selected-true': questions[current]._answer === 'V',
                  'correct-answer': result && questions[current].answer === 'V',
                  'wrong-answer': result && questions[current]._answer === 'V' && questions[current].answer !== 'V'
                }]"
                :outlined="questions[current]._answer !== 'V'"
                :disabled="!!result"
                severity="success" 
                size="large"
              />
              <Button 
                label="Falso" 
                icon="pi pi-times" 
                @click="answer('F')" 
                :class="['ans-btn', { 
                  'selected-false': questions[current]._answer === 'F',
                  'correct-answer': result && questions[current].answer === 'F',
                  'wrong-answer': result && questions[current]._answer === 'F' && questions[current].answer !== 'F'
                }]"
                :outlined="questions[current]._answer !== 'F'"
                :disabled="!!result"
                severity="danger" 
                size="large"
              />
            </div>
            
            <div v-if="result" class="answer-feedback">
              <div class="feedback-item">
                <span class="feedback-label">Your answer:</span>
                <span :class="['feedback-value', questions[current]._answer === questions[current].answer ? 'correct' : 'incorrect']">
                  {{ questions[current]._answer || 'Not answered' }}
                </span>
              </div>
              <div class="feedback-item">
                <span class="feedback-label">Correct answer:</span>
                <span class="feedback-value correct">{{ questions[current].answer }}</span>
              </div>
            </div>
          </div>

          <div class="quiz-navigation">
            <Button 
              icon="pi pi-arrow-left" 
              @click="go(current-1)" 
              :disabled="current === 0" 
              text 
              rounded 
              aria-label="Previous"
            />
            
            <div class="pagination-dots">
              <div 
                v-for="(q, idx) in questions" 
                :key="q.id"
                class="dot"
                :class="{ 
                  active: current === idx,
                  answered: q._answer,
                  'dot-correct': result && q._answer === q.answer,
                  'dot-wrong': result && q._answer && q._answer !== q.answer
                }"
                @click="go(idx)"
              >{{ idx + 1 }}</div>
            </div>

            <Button 
              icon="pi pi-arrow-right" 
              @click="go(current+1)" 
              :disabled="current === questions.length - 1" 
              text 
              rounded 
              aria-label="Next"
            />
          </div>

          <div class="submit-section">
            <div v-if="!questions.every(q => q._answer)" class="submit-message">
              <i class="pi pi-info-circle"></i>
              <p>Please answer all questions to submit ({{ questions.filter(q => q._answer).length }}/{{ questions.length }} answered)</p>
            </div>
            <Button 
              v-else
              label="Submit Quiz" 
              icon="pi pi-send" 
              @click="submit" 
              severity="contrast"
              raised
            />
          </div>
        </div>

        <div v-if="result" ref="resultContainer" class="result-container">
          <div class="result-header">
            <i :class="['pi', result.wrong <= 3 ? 'pi-check-circle' : 'pi-times-circle', 'result-icon']" 
               :style="{ color: result.wrong <= 3 ? '#22c55e' : '#ef4444' }"></i>
            <h3 :style="{ color: result.wrong <= 3 ? '#22c55e' : '#ef4444' }">
              {{ result.wrong <= 3 ? 'You Passed!' : 'You Failed!' }}
            </h3>
            <p v-if="result.wrong > 3" style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.9rem">
              Max 3 errors allowed
            </p>
          </div>
          
          <div class="score-section">
            <div class="score-circle" :style="{ background: `conic-gradient(${result.wrong <= 3 ? '#22c55e' : '#ef4444'} ${result.score || 0}%, var(--surface-200) 0)` }">
              <div class="score-inner">
                <span class="score-value" :style="{ color: result.wrong <= 3 ? '#22c55e' : '#ef4444' }">
                  {{ Math.round(result.score || 0) }}%
                </span>
                <span class="score-label">Score</span>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total</span>
              <span class="stat-value">{{ result.total }}</span>
            </div>
            <div class="stat-card correct">
              <span class="stat-label">Correct</span>
              <span class="stat-value">{{ result.correct }}</span>
            </div>
            <div class="stat-card wrong">
              <span class="stat-label">Wrong</span>
              <span class="stat-value">{{ result.wrong }}</span>
            </div>
          </div>

          <div class="result-actions">
            <Button label="Start New Quiz" icon="pi pi-refresh" @click="gen" size="large" severity="primary" raised />
          </div>
        </div>
      </template>
    </Card>
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.quiz-card {
  width: 100%;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.quiz-header {
  display: flex;
  justify-content: center; /* Center content by default */
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.start-btn-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 2rem 0;
}

.header-content {
  display: flex;
  justify-content: flex-end; /* Timer to the right */
  width: 100%;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  background: var(--surface-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-200);
  transition: color 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  color: var(--primary-700);
  font-weight: 600;
}

.quiz-icon {
  font-size: 1.5rem;
  color: var(--primary-500);
}

.state-container {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.progress-indicator {
  margin-bottom: 2rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.question-box {
  margin-bottom: 2.5rem;
}

.question-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.question-text-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.question-text {
  font-size: 1.5rem;
  color: var(--text-main);
  margin: 0;
  line-height: 1.4;
}

.question-image {
  width: 300px;
  height: 200px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-50);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.question-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.answer-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.ans-btn {
  min-width: 120px;
  transition: all 0.2s;
}

.ans-btn.selected-true {
  background-color: #22c55e !important;
  border-color: #22c55e !important;
  color: white !important;
  transform: scale(1.05);
}

.ans-btn.selected-false {
  background-color: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
  transform: scale(1.05);
}

.ans-btn.correct-answer {
  background-color: #22c55e !important;
  border-color: #22c55e !important;
  color: white !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}

.ans-btn.wrong-answer {
  background-color: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.ans-btn:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.answer-feedback {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feedback-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.feedback-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.feedback-value {
  font-weight: 700;
  font-size: 1.125rem;
}

.feedback-value.correct {
  color: #22c55e;
}

.feedback-value.incorrect {
  color: #ef4444;
}

.quiz-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-200);
}

.pagination-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 100%;
  padding: 0 1rem;
}

.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-200);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid transparent;
}

.dot:hover {
  background: var(--surface-300);
}

.dot.active {
  background: var(--primary-500);
  color: white;
  transform: scale(1.1);
  box-shadow: var(--shadow-sm);
}

.dot.answered {
  background: var(--surface-300);
  border-color: var(--primary-300);
  color: var(--text-main);
}

.dot.active.answered {
  background: var(--primary-600);
  border-color: transparent;
  color: white;
}

.dot.dot-correct {
  background: #22c55e;
  border-color: #16a34a;
  color: white;
}

.dot.dot-wrong {
  background: #ef4444;
  border-color: #dc2626;
  color: white;
}

.dot.active.dot-correct {
  background: #16a34a;
  transform: scale(1.1);
}

.dot.active.dot-wrong {
  background: #dc2626;
  transform: scale(1.1);
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--surface-100);
  border: 1px solid var(--surface-300);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}

.submit-message i {
  font-size: 1.25rem;
  color: var(--primary-500);
}

.submit-message p {
  margin: 0;
  font-size: 0.95rem;
}

.result-container {
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  margin-top: 1rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.result-header {
  margin-bottom: 2rem;
}

.result-icon {
  font-size: 3rem;
  color: #fbbf24; /* Amber-400 for trophy */
  margin-bottom: 1rem;
  display: block;
}

.result-header h3 {
  font-size: 1.75rem;
  color: var(--text-main);
  margin: 0;
}

.score-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 1s ease-out;
}

.score-inner {
  width: 140px;
  height: 140px;
  background: var(--surface-0);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-600);
  line-height: 1;
}

.score-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: var(--surface-50);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-200);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card.correct {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.stat-card.correct .stat-value {
  color: #16a34a;
}

.stat-card.wrong {
  background: #fef2f2;
  border-color: #fecaca;
}

.stat-card.wrong .stat-value {
  color: #dc2626;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
}

.result-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .question-content {
    flex-direction: column;
    gap: 1rem;
  }

  .question-image {
    width: 100%;
    height: 180px;
  }

  .question-text {
    font-size: 1.125rem;
  }

  .answer-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .ans-btn {
    width: 100%;
  }
}
</style>
