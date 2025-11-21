<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import Card from 'primevue/card'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import PageHeader from '../components/PageHeader.vue'

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
  <div>
    <PageHeader title="Flashcard Practice" subtitle="Master Italian driving terms" />
    <div class="flashcard-container">
    <Card class="flashcard-panel">
      <template #content>
        <div v-if="loading" class="state-container">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--primary-500)"></i>
          <p>Loading your next challenge...</p>
        </div>
        
        <div v-else-if="error" class="state-container error">
          <i class="pi pi-exclamation-circle" style="font-size: 2rem"></i>
          <p>{{ error }}</p>
          <Button label="Try Again" icon="pi pi-refresh" @click="load" text />
        </div>
        
        <div v-else class="content-wrapper">
          <div v-if="progress !== null" class="progress-section">
            <div class="progress-label">
              <span>Progress</span>
              <span class="progress-value">{{ progress }}%</span>
            </div>
            <ProgressBar :value="progress" :showValue="false" style="height: 8px; border-radius: 4px" />
          </div>

          <div v-if="card" class="flashcard-display">
            <div class="word-main">
              <span class="lang-label">Italian</span>
              <h1 class="word-text">{{ card.text_it }}</h1>
            </div>
            
            <div class="divider">
              <Button 
                @click="toggleTrans" 
                :icon="showTrans ? 'pi pi-eye-slash' : 'pi pi-eye'"
                :label="showTrans ? 'Hide Translation' : 'Reveal Translation'" 
                rounded
                outlined
                size="small"
              />
            </div>

            <transition name="slide-fade">
              <div v-if="showTrans" class="translation-box">
                <div class="trans-row">
                  <span class="lang-label">English</span>
                  <p class="trans-text">{{ card.text_en }}</p>
                </div>
                <div class="trans-row">
                  <span class="lang-label">Farsi</span>
                  <p class="trans-text farsi-text">{{ card.text_fa }}</p>
                </div>
              </div>
            </transition>
            
            <div class="card-footer">
              <div class="score-badge" v-if="card.score !== undefined">
                <i class="pi pi-star-fill"></i>
                <span>Level {{ card.score }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <Button 
                label="I knew it" 
                icon="pi pi-check" 
                @click="answer('correct')" 
                severity="success" 
                raised
                class="action-btn"
              />
              <Button 
                label="Study more" 
                icon="pi pi-times" 
                @click="answer('wrong')" 
                severity="danger" 
                text
                class="action-btn"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.flashcard-panel {
  width: 100%;
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  color: var(--primary-700);
  margin-bottom: 1rem;
}

.card-icon {
  font-size: 1.25rem;
  color: var(--primary-500);
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--text-secondary);
}

.state-container.error {
  color: #ef4444;
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

.flashcard-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.word-main {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--surface-0) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--primary-100);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.lang-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-400);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.word-text {
  font-size: 2rem;
  color: var(--primary-900);
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.divider {
  display: flex;
  justify-content: center;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--surface-200);
  z-index: 0;
}

.divider :deep(.p-button) {
  position: relative; /* z-index needs position */
  z-index: 1;
  background: var(--card-bg);
}

.translation-box {
  background: var(--surface-50);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--surface-200);
}

.trans-row {
  margin-bottom: 1rem;
  text-align: center;
}

.trans-row:last-child {
  margin-bottom: 0;
}

.trans-text {
  font-size: 1.25rem;
  color: var(--text-main);
  margin: 0;
  font-weight: 500;
}

.farsi-text {
  font-family: 'Tahoma', sans-serif; /* Better for Farsi */
}

.card-footer {
  display: flex;
  justify-content: center;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--surface-100);
  border-radius: 99px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.score-badge i {
  color: #fbbf24;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  width: 100%;
  justify-content: center;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
