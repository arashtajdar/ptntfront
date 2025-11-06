<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'

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
  <Card class="main-card">
    <template #title>
      Flashcard
    </template>
    <template #content>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="progress !== null" class="progress-bar">
        <span>Progress:</span>
        <ProgressBar :value="progress" showValue />
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="card" class="flashcard-content">
        <div class="flashcard-row"><span>Italian:</span> <b>{{ card.text_it }}</b></div>
        <Button class="btn-toggle" @click="toggleTrans" style="margin-bottom:12px" :label="showTrans ? 'Hide English & Farsi' : 'Show English & Farsi'" text />
        <div v-if="showTrans">
          <div class="flashcard-row"><span>English:</span> <b>{{ card.text_en }}</b></div>
          <div class="flashcard-row"><span>Farsi:</span> <b>{{ card.text_fa }}</b></div>
        </div>
        <div class="flashcard-row"><small>Score: {{ card.score ?? 0 }}</small></div>
        <div class="flashcard-actions">
          <Button label="Correct" icon="pi pi-check" @click="answer('correct')" severity="success" />
          <Button label="Wrong" icon="pi pi-times" @click="answer('wrong')" severity="danger" text />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.main-card {
  max-width: 400px;
  margin: 0 auto;
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
</style>
