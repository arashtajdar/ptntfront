<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Paginator from 'primevue/paginator'

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

function onPageChange(e) {
  page.value = e.page + 1
  load()
}

onMounted(load)
</script>

<template>
  <Card class="main-card">
    <template #title>
      All Flashcards
    </template>
    <template #content>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="progress !== null" class="progress-bar">
        <span>Progress:</span>
        <ProgressBar :value="progress" showValue />
      </div>
      <div v-if="list.length === 0" class="empty">No flashcards</div>
      <ul class="flashcard-list">
        <li v-for="t in list" :key="t.id" class="flashcard-list-item">
          <div><strong>{{ t.text_en }}</strong> — {{ t.text_fa }} (<em>{{ t.text_it }}</em>)</div>
          <div class="meta">Score: {{ t.score ?? 0 }} | Attempts: {{ t.attempts ?? 0 }}</div>
        </li>
      </ul>
      <div v-if="pagination && pagination.last_page > 1" class="pagination">
        <Paginator :rows="1" :totalRecords="pagination.last_page" :first="page-1" :pageLinkSize="5" @page="onPageChange" />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.main-card {
  max-width: 600px;
  margin: 0 auto;
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
  margin-top: 18px;
  display: flex;
  justify-content: center;
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
</style>
