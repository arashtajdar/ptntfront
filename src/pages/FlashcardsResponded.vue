<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  const res = await api.listRespondedFlashcards()
  list.value = res || []
  loading.value = false
}

onMounted(load)
</script>

<template>
  <Card class="main-card">
    <template #title>
      My Responded Flashcards
    </template>
    <template #content>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-if="list.length === 0" class="empty">No flashcards answered yet.</div>
      <ul class="resp-list">
        <li v-for="t in list" :key="t.id" class="resp-list-item">
          <div><strong>{{ t.text_en || t.text }}</strong> — {{ t.text_fa }}</div>
          <div class="meta">Score: {{ t.score ?? 0 }} | Last Attempt: {{ t.last_attempt_at }}</div>
        </li>
      </ul>
    </template>
  </Card>
</template>

<style scoped>
.main-card {
  max-width: 100%;
  margin: 0 auto;
}
.resp-list {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
}
.resp-list-item {
  padding: 14px 0;
  border-bottom: 1px solid #e0e6ed;
  font-size: 1.1rem;
}
.meta {
  color: #888;
  font-size: 0.95rem;
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
</style>
