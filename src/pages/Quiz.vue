<script setup>
import { ref } from 'vue'
import api from '../services/api'

const questions = ref([])
const loading = ref(false)
const result = ref(null)
const current = ref(0)

async function gen() {
  loading.value = true
  const res = await api.generateQuiz(30)
  if (Array.isArray(res)) {
    questions.value = res.map(q => ({ ...q }))
    current.value = 0
    result.value = null
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
  const ids = questions.value.map(q => q.id)
  const answers = questions.value.map(q => q._answer || '')
  const res = await api.submitQuiz({ question_ids: ids, answers })
  result.value = res
}
</script>

<template>
  <div>
    <h3>Quiz</h3>
    <div class="card quiz-card">
      <button class="btn" @click="gen">Generate Quiz (30 questions)</button>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="questions.length">
        <div class="quiz-qbox">
          <div class="quiz-qnum">Question {{ current+1 }} / {{ questions.length }}</div>
          <div class="quiz-qtext">{{ questions[current].text }}</div>
          <div v-if="questions[current].image" class="quiz-img">
            <img :src="'/public/images/'+questions[current].image" alt="question image" />
          </div>
          <div class="quiz-ans-btns">
            <button class="btn" @click="answer('V')" :disabled="questions[current]._answer === 'V'">V</button>
            <button class="btn btn-alt" @click="answer('F')" :disabled="questions[current]._answer === 'F'">F</button>
          </div>
        </div>
        <div class="quiz-pagination">
          <button class="btn" @click="go(current-1)" :disabled="current===0">Prev</button>
          <span class="quiz-goto">Go to:
            <span v-for="(q, idx) in questions" :key="q.id">
              <button class="goto-btn" @click="go(idx)" :class="{active: current===idx}">{{ idx+1 }}</button>
            </span>
          </span>
          <button class="btn" @click="go(current+1)" :disabled="current===questions.length-1">Next</button>
          <button class="btn" @click="submit" style="margin-left:auto">Submit</button>
        </div>
      </div>
      <div v-if="result" class="quiz-result">
        <h4>Result</h4>
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card.quiz-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
  max-width: 600px;
  margin: 0 auto;
}
.quiz-qbox {
  margin-bottom: 18px;
}
.quiz-qnum {
  font-size: 1.1rem;
  color: #007acc;
  margin-bottom: 8px;
}
.quiz-qtext {
  font-size: 1.15rem;
  margin-bottom: 10px;
}
.quiz-img img {
  max-width: 300px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.quiz-ans-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
}
.btn {
  background: #007acc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s;
}
.btn-alt {
  background: #eee;
  color: #007acc;
}
.btn:disabled {
  background: #b3d6ee;
  cursor: not-allowed;
}
.quiz-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.quiz-goto {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.goto-btn {
  background: #eee;
  color: #007acc;
  border: none;
  border-radius: 3px;
  padding: 2px 8px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 2px;
  transition: background 0.2s, color 0.2s;
}
.goto-btn.active {
  background: #007acc;
  color: #fff;
}
.loading {
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}
.quiz-result {
  margin-top: 24px;
  background: #f7f9fc;
  border-radius: 6px;
  padding: 16px;
}
</style>
