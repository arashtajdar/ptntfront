<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Paginator from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import PageHeader from '../components/PageHeader.vue'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const per_page = ref(9)
const total = ref(0)
const last_page = ref(1)
const search = ref('')
const filter_stats = ref('correct')
const user = ref(null)
const showFarsi = ref(false)
const displayDialog = ref(false)
const selectedQuestion = ref(null)
const filterOptions = [
  { label: 'Correctly Answered', value: 'correct', icon: 'pi pi-check-circle', class: 'text-green-500' },
  { label: 'Wrongly Answered', value: 'wrong', icon: 'pi pi-times-circle', class: 'text-red-500' },
  { label: 'All Questions', value: 'none', icon: 'pi pi-list', class: 'text-primary-500' }
]

async function loadProfile() {
  try {
    const profile = await api.getProfile()
    if (profile && profile.user) {
      user.value = profile.user
      showFarsi.value = profile.user.show_farsi || false
    }
  } catch (e) {
    console.error('Failed to load user profile:', e)
  }
}

async function load() {
  loading.value = true
  // Simulate network delay for skeleton demo if needed, but api call is real
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

function openQuestion(q) {
  selectedQuestion.value = q
  displayDialog.value = true
}

function onPageChange(e) {
  page.value = e.page + 1
  load()
}

// Debounce search
let timeout = null
watch(search, (newVal) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    doSearch()
  }, 500)
})

onMounted(async () => {
  await loadProfile()
  load()
})
</script>

<template>
  <div class="page-wrapper">
    <PageHeader title="My Responded Questions" subtitle="Review your quiz history and performance" />
    
    <div class="content-container">
      <!-- Modern Search & Filter Toolbar -->
      <div class="toolbar">
        <div class="search-container">
          <i class="pi pi-search search-icon"></i>
          <InputText 
            v-model="search" 
            placeholder="Search questions..." 
            class="search-input" 
          />
        </div>
        
        <div class="filter-container">
          <Dropdown 
            v-model="filter_stats" 
            :options="filterOptions" 
            optionLabel="label" 
            optionValue="value" 
            @change="setFilter(filter_stats)" 
            class="filter-dropdown"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex align-items-center">
                <i :class="filterOptions.find(o => o.value === slotProps.value)?.icon" class="mr-2"></i>
                {{ filterOptions.find(o => o.value === slotProps.value)?.label }}
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <i :class="slotProps.option.icon" class="mr-2" :style="{ color: slotProps.option.value === 'correct' ? '#22c55e' : slotProps.option.value === 'wrong' ? '#ef4444' : 'var(--primary-500)' }"></i>
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="loading" class="questions-grid">
        <div v-for="i in 6" :key="i" class="question-card skeleton-card">
          <div class="card-header">
            <Skeleton width="40px" height="24px" class="mb-2"></Skeleton>
            <Skeleton width="100%" height="24px"></Skeleton>
          </div>
          <div class="card-body">
            <Skeleton width="100%" height="150px" class="mb-3"></Skeleton>
            <Skeleton width="60%" height="20px"></Skeleton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="list.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <i class="pi pi-search" style="font-size: 2rem; color: var(--text-secondary)"></i>
        </div>
        <h3>No questions found</h3>
        <p>Try adjusting your search or filters</p>
        <Button label="Clear Filters" text @click="() => { search = ''; filter_stats = 'none'; doSearch() }" />
      </div>

      <!-- Questions Grid -->
      <div v-else class="questions-grid">
        <div v-for="q in list" :key="q.id" class="question-card" @click="openQuestion(q)">
          <div class="card-status-stripe" :class="q.correct_count > q.wrong_count ? 'status-green' : 'status-red'"></div>
          
          <div class="card-content">
            <div class="card-header">
              <span class="id-badge">#{{ q.id }}</span>
              <div class="question-text-container">
                <h3 class="question-text" :title="q.text">{{ q.text }}</h3>
                <p v-if="showFarsi && q.text_fa" class="question-text-farsi">{{ q.text_fa }}</p>
              </div>
            </div>

            <div class="image-container" v-if="q.image">
              <img :src="'/images/'+q.image" alt="Question Image" loading="lazy" />
            </div>
            <div class="no-image-placeholder" v-else>
              <i class="pi pi-image" style="font-size: 1.5rem; opacity: 0.3;"></i>
            </div>

            <div class="card-footer">
              <div class="answer-info">
                <span class="label">Answer:</span>
                <span class="value">{{ q.answer }}</span>
              </div>
              
              <div class="stats-badges">
                <Tag :value="q.correct_count || 0" severity="success" icon="pi pi-check" rounded></Tag>
                <Tag :value="q.wrong_count || 0" severity="danger" icon="pi pi-times" rounded></Tag>
              </div>
            </div>
            
            <div class="last-attempt" v-if="q.last_attempted">
              <i class="pi pi-clock"></i>
              <span>{{ new Date(q.last_attempted).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="last_page > 1" class="pagination-container">
        <Paginator 
          :rows="per_page" 
          :totalRecords="total" 
          :first="(page - 1) * per_page" 
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        />
      </div>
    </div>

    <Dialog v-model:visible="displayDialog" modal header="Question Details" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }">
      <div v-if="selectedQuestion" class="dialog-content">
        <div class="dialog-status-stripe" :class="selectedQuestion.correct_count > selectedQuestion.wrong_count ? 'status-green' : 'status-red'"></div>
        
        <div class="dialog-section">
          <span class="dialog-label">Question:</span>
          <p class="dialog-text">{{ selectedQuestion.text }}</p>
          <p v-if="showFarsi && selectedQuestion.text_fa" class="dialog-text-farsi">{{ selectedQuestion.text_fa }}</p>
        </div>

        <div class="dialog-section" v-if="selectedQuestion.image">
           <div class="dialog-image-container">
             <img :src="'/images/'+selectedQuestion.image" alt="Question Image" />
           </div>
        </div>

        <div class="dialog-section">
          <span class="dialog-label">Answer:</span>
          <p class="dialog-value">{{ selectedQuestion.answer }}</p>
        </div>

        <div class="dialog-section">
          <span class="dialog-label">Stats:</span>
          <div class="dialog-stats">
              <Tag :value="selectedQuestion.correct_count || 0" severity="success" icon="pi pi-check" rounded></Tag>
              <Tag :value="selectedQuestion.wrong_count || 0" severity="danger" icon="pi pi-times" rounded></Tag>
          </div>
           <div class="last-attempt" v-if="selectedQuestion.last_attempted">
              <i class="pi pi-clock"></i>
              <span>Last Attempt: {{ new Date(selectedQuestion.last_attempted).toLocaleDateString() }}</span>
            </div>
        </div>
      </div>
      <template #footer>
        <Button label="Close" icon="pi pi-times" @click="displayDialog = false" text />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.content-container {
  padding: 0 1rem;
}

/* Toolbar & Search */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--surface-0);
  padding: 1rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  align-items: center;
  justify-content: space-between;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  z-index: 1;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding-left: 2.5rem !important; /* Space for icon */
  border-radius: 50px !important;
  border: 1px solid var(--surface-300);
  transition: all 0.2s;
}

.search-input:focus {
  box-shadow: 0 0 0 2px var(--primary-200);
  border-color: var(--primary-500);
}

.filter-container {
  min-width: 200px;
}

.filter-dropdown {
  width: 100%;
  border-radius: 50px;
}

/* Grid Layout */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Question Card */
.question-card {
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--surface-200);
}

.question-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-200);
  cursor: pointer;
}

.card-status-stripe {
  height: 4px;
  width: 100%;
}

.status-green { background: #22c55e; }
.status-red { background: #ef4444; }

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
}

.card-header {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.question-text-container {
  flex: 1;
}

.id-badge {
  background: var(--surface-100);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.question-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-text-farsi {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-secondary);
  font-style: italic;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 160px;
  background: var(--surface-50);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-100);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image-placeholder {
  width: 100%;
  height: 100px; /* Smaller placeholder */
  background: var(--surface-50);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--surface-200);
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-100);
}

.answer-info {
  display: flex;
  flex-direction: column;
}

.answer-info .label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.answer-info .value {
  font-weight: 700;
  color: var(--primary-600);
}

.stats-badges {
  display: flex;
  gap: 0.5rem;
}

.last-attempt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface-0);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--surface-300);
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--surface-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: var(--text-main);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container, .filter-container {
    width: 100%;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dialog-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dialog-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.dialog-text {
  font-size: 1.1rem;
  color: var(--text-main);
  line-height: 1.5;
  margin: 0;
}

.dialog-text-farsi {
  font-size: 1rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.dialog-value {
  font-size: 1.25rem;
  color: var(--primary-600);
  font-weight: 700;
  margin: 0;
}

.dialog-image-container {
  width: 100%;
  max-height: 400px;
  background: var(--surface-50);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-100);
}

.dialog-image-container img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.dialog-status-stripe {
    height: 4px;
    width: 100%;
    border-radius: 4px;
    margin-bottom: 0.5rem;
}

.dialog-stats {
    display: flex;
    gap: 0.5rem;
}

</style>
