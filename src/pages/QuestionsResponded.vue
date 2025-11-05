<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  const res = await api.listRespondedQuestions()
  list.value = res || []
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h2 class="card-title">My Responded Questions</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="list.length === 0" class="empty">No answered questions yet.</div>
    <ul class="resp-list">
      <li v-for="q in list" :key="q.id" class="resp-list-item">
        <div><strong>#{{ q.id }}</strong> {{ q.text }}</div>
        <div class="meta">Answer: {{ q.answer }} | Last Attempt: {{ q.last_attempted }}</div>
      </li>
    </ul>
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
