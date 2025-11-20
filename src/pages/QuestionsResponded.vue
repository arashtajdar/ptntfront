<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Paginator from 'primevue/paginator'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const per_page = ref(10)
const total = ref(0)
const last_page = ref(1)
const search = ref('')
const filter_stats = ref('correct')
const filterOptions = [
  { label: 'Correct', value: 'correct' },
  { label: 'Wrong', value: 'wrong' },
  { label: 'None', value: 'none' }
]

async function load() {
  loading.value = true
  const res = await api.listQuestions(page.value, per_page.value, search.value, filter_stats.value)
  if (res && res.data) {
    list.value = res.data
    total.value = res.total
    last_page.value = res.last_page
  } else {
    list.value = []
    total.value = 0
    last_page.value = 1
  }
  loading.value = false
}

function doSearch() {
  page.value = 1
  load()
}

function setFilter(val) {
  filter_stats.value = val
  page.value = 1
  load()
}

function onPageChange(e) {
  page.value = e.page + 1
  load()
}

onMounted(load)
</script>

<template>
  <div class="card">
    <h2 class="card-title">My Responded Questions</h2>
    <div class="search-bar">
      <InputText v-model="search" @keyup.enter="doSearch" placeholder="Search text..." class="input" style="width:180px" />
      <Button label="Search" icon="pi pi-search" @click="doSearch" class="p-button-sm" />
      <Dropdown v-model="filter_stats" :options="filterOptions" optionLabel="label" optionValue="value" @change="setFilter(filter_stats)" style="margin-left:8px;width:120px" />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="list.length === 0 && !loading" class="empty">No answered questions yet.</div>
    <ul class="resp-list">
      <li v-for="q in list" :key="q.id" class="resp-list-item">
        <div><strong>#{{ q.id }}</strong> {{ q.text }}</div>
        <div v-if="q.image" style="margin:6px 0"><img :src="'/public/images/'+q.image" alt="question image" style="max-width:120px;border-radius:6px" /></div>
        <div class="meta">
          Answer: {{ q.answer }}
          <span v-if="q.correct_count !== undefined"> | Correct: {{ q.correct_count }}</span>
          <span v-if="q.wrong_count !== undefined"> | Wrong: {{ q.wrong_count }}</span>
          <span v-if="q.last_attempted"> | Last Attempt: {{ q.last_attempted }}</span>
        </div>
      </li>
    </ul>
    <div v-if="last_page > 1" class="pagination">
      <Paginator :rows="1" :totalRecords="last_page" :first="page-1" :pageLinkSize="5" @page="onPageChange" />
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
  max-width: 100%;
  margin: 0 auto;
}
.card-title {
  margin-bottom: 24px;
  color: #007acc;
  text-align: center;
}
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  align-items: center;
  justify-content: center;
}
.input {
  padding: 6px 10px;
  border: 1px solid #e0e6ed;
  border-radius: 5px;
  font-size: 1rem;
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
.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
</style>
