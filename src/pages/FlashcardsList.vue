<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Paginator from 'primevue/paginator'
import PageHeader from '../components/PageHeader.vue'

const list = ref([])
const page = ref(1)
const per_page = ref(10)
const pagination = ref(null)
const loading = ref(false)
const progress = ref(null)

async function load() {
  loading.value = true
  try {
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
  } catch (e) {
    console.error('Failed to load flashcards:', e)
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
  <div>
    <PageHeader title="All Flashcards" subtitle="Browse your complete flashcard collection" />
    <Card class="main-card">
    <template #content>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="progress !== null" class="progress-section">
        <div class="progress-label">
          <span>Progress</span>
          <span class="progress-value">{{ progress }}%</span>
        </div>
        <ProgressBar :value="progress" :showValue="false" style="height: 8px; border-radius: 4px" />
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
  </div>
</template>

<style scoped>
.main-card {
  max-width: 100%;
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
.progress-section {
  margin-bottom: 2rem;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
