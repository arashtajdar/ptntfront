<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const card = ref(null)
const progress = ref(null)
const loading = ref(false)
const error = ref('')
const showTrans = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [flashRes, progRes] = await Promise.all([
      api.getRandomFlashcard('exclude_score_gt=3'),
      api.getOverallProgress()
    ])
    if (flashRes && flashRes.translation) {
      card.value = flashRes.translation
    } else {
      card.value = flashRes
    }
    if (progRes && typeof progRes.percentage !== 'undefined') {
      progress.value = progRes.percentage
    }
  } catch (e) { error.value = String(e) }
  loading.value = false
}

async function answer(result) {
  if (!card.value) return
  try {
    await api.submitFlashcardAnswer({ translationId: card.value.id, result })
    await load()
    showTrans.value = false
  } catch (e) { error.value = String(e) }
}

function toggleTrans() {
  showTrans.value = !showTrans.value
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h2 class="card-title">Flashcard</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="progress !== null" class="progress-bar">
      <span>Progress: </span>
      <span class="progress-value">{{ progress }}%</span>
      <div class="progress-track">
        <div class="progress-fill" :style="{width: progress + '%'}"></div>
      </div>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="card" class="flashcard-content">
      <div class="flashcard-row"><span>Italian:</span> <b>{{ card.text_it }}</b></div>
      <button class="btn btn-toggle" @click="toggleTrans" style="margin-bottom:12px">{{ showTrans ? 'Hide' : 'Show' }} English & Farsi</button>
      <div v-if="showTrans">
        <div class="flashcard-row"><span>English:</span> <b>{{ card.text_en }}</b></div>
        <div class="flashcard-row"><span>Farsi:</span> <b>{{ card.text_fa }}</b></div>
      </div>
      <div class="flashcard-row"><small>Score: {{ card.score ?? 0 }}</small></div>
      <div class="flashcard-actions">
        <button class="btn" @click="answer('correct')">Correct</button>
        <button class="btn btn-alt" @click="answer('wrong')">Wrong</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
  max-width: 400px;
  margin: 0 auto;
}
.card-title {
  margin-bottom: 24px;
  color: #007acc;
  text-align: center;
}
.flashcard-content {
  margin-bottom: 18px;
}
.flashcard-row {
  margin-bottom: 10px;
  font-size: 1.1rem;
}
.flashcard-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  justify-content: center;
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
/* ...existing styles... */
.btn-alt {
  background: #eee;
  color: #007acc;
}
.btn-toggle {
  background: #f7f9fc;
  color: #007acc;
  border: 1px solid #e0e6ed;
  font-size: 0.98rem;
  padding: 6px 14px;
  margin-top: 8px;
}
.btn:hover {
  background: #005fa3;
}
/* ...existing styles... */
.loading {
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}
.error {
  color: #c00;
  margin-bottom: 12px;
  text-align: center;
}
.progress-bar {
  margin-bottom: 18px;
  text-align: center;
}
.progress-value {
  font-weight: bold;
  color: #007acc;
  margin-left: 4px;
}
.progress-track {
  width: 100%;
  max-width: 300px;
  height: 10px;
  background: #e0e6ed;
  border-radius: 5px;
  margin: 8px auto 0 auto;
  position: relative;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #007acc;
  border-radius: 5px;
  transition: width 0.3s;
}
</style>
