<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const list = ref([])
const page = ref(1)
const per_page = ref(10)
const pagination = ref(null)
const loading = ref(false)
const progress = ref(null)

async function load() {
  loading.value = true
  const [flashRes, progRes] = await Promise.all([
    api.listFlashcards(page.value, per_page.value),
    api.getOverallProgress()
  ])
  if (flashRes && flashRes.translations) {
    list.value = flashRes.translations
    pagination.value = flashRes.pagination
  }
  if (progRes && typeof progRes.percentage !== 'undefined') {
    progress.value = progRes.percentage
  }
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h2 class="card-title">All Flashcards</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="progress !== null" class="progress-bar">
      <span>Progress: </span>
      <span class="progress-value">{{ progress }}%</span>
      <div class="progress-track">
        <div class="progress-fill" :style="{width: progress + '%'}"></div>
      </div>
    </div>
    <div v-if="list.length === 0" class="empty">No flashcards</div>
    <ul class="flashcard-list">
      <li v-for="t in list" :key="t.id" class="flashcard-list-item">
        <div><strong>{{ t.text_en }}</strong> — {{ t.text_fa }} (<em>{{ t.text_it }}</em>)</div>
        <div class="meta">Score: {{ t.score ?? 0 }} | Attempts: {{ t.attempts ?? 0 }}</div>
      </li>
    </ul>
    <div class="pagination">
      <button class="btn" @click="page>1 && (page--, load())" :disabled="page===1">Prev</button>
      <span>Page {{ page }}</span>
      <button class="btn" @click="pagination && page < pagination.last_page && (page++, load())" :disabled="pagination && page >= pagination.last_page">Next</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
  max-width: 600px;
  margin: 0 auto;
}
.card-title {
  margin-bottom: 24px;
  color: #007acc;
  text-align: center;
}
.flashcard-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
}
.flashcard-list-item {
  padding: 14px 0;
  border-bottom: 1px solid #e0e6ed;
  font-size: 1.1rem;
}
.meta {
  color: #888;
  font-size: 0.95rem;
}
.pagination {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-top: 18px;
}
.btn {
  background: #007acc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s;
}
.btn:disabled {
  background: #b3d6ee;
  cursor: not-allowed;
}
.loading {
  color: #888;
  text-align: center;
  margin-bottom: 12px;
}
.empty {
  color: #888;
  text-align: center;
  margin-bottom: 12px;
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
