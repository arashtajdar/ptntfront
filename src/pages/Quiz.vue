<script setup>
import { ref } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'

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
    <Card class="quiz-card">
      <template #content>
        <Button label="Generate Quiz (30 questions)" icon="pi pi-refresh" @click="gen" class="p-button-sm" />
        <div v-if="loading" class="loading">Loading...</div>
        <div v-if="questions.length">
          <div class="quiz-qbox">
            <div class="quiz-qnum">Question {{ current+1 }} / {{ questions.length }}</div>
            <div class="quiz-qtext">{{ questions[current].text }}</div>
            <div v-if="questions[current].image" class="quiz-img">
              <img :src="'/public/images/'+questions[current].image" alt="question image" />
            </div>
            <div class="quiz-ans-btns">
              <Button label="V" icon="pi pi-check" @click="answer('V')" :disabled="questions[current]._answer === 'V'" severity="success" />
              <Button label="F" icon="pi pi-times" @click="answer('F')" :disabled="questions[current]._answer === 'F'" severity="danger" text />
            </div>
          </div>
          <div class="quiz-pagination">
            <Button label="Prev" icon="pi pi-angle-left" @click="go(current-1)" :disabled="current===0" class="p-button-sm" />
            <span class="quiz-goto">Go to:
              <span v-for="(q, idx) in questions" :key="q.id">
                <Button @click="go(idx)" :class="['goto-btn', {active: current===idx}]" :label="String(idx+1)" text />
              </span>
            </span>
            <Button label="Next" icon="pi pi-angle-right" @click="go(current+1)" :disabled="current===questions.length-1" class="p-button-sm" />
            <Button label="Submit" icon="pi pi-send" @click="submit" class="p-button-sm" style="margin-left:auto" />
          </div>
        </div>
        <div v-if="result" class="quiz-result">
          <h4>Result</h4>
          <pre>{{ result }}</pre>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.quiz-card {
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
.goto-btn.active {
  background: #007acc !important;
  color: #fff !important;
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
