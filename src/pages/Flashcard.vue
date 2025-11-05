<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const card = ref(null)
const progress = ref(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.getRandomFlashcard('exclude_score_gt=3')
    if (res && res.translation) {
      card.value = res.translation
      progress.value = res.progress
    } else {
      card.value = res
    }
  } catch (e) { error.value = String(e) }
  loading.value = false
}

async function answer(result) {
  if (!card.value) return
  try {
    await api.submitFlashcardAnswer({ translationId: card.value.id, result })
    await load()
  } catch (e) { error.value = String(e) }
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h2 class="card-title">Flashcard</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="card" class="flashcard-content">
      <div class="flashcard-row"><span>English:</span> <b>{{ card.text_en }}</b></div>
      <div class="flashcard-row"><span>Farsi:</span> <b>{{ card.text_fa }}</b></div>
      <div class="flashcard-row"><span>Italian:</span> <b>{{ card.text_it }}</b></div>
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
.btn-alt {
  background: #eee;
  color: #007acc;
}
.btn:hover {
  background: #005fa3;
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
</style>
