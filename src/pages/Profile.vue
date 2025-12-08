<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import api from '../services/api'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import InputSwitch from 'primevue/inputswitch'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const user = ref(null)
const stats = ref(null)
const loading = ref(true)
const error = ref(null)
const showFarsi = ref(false)
const saving = ref(false)

onMounted(async () => {
  try {
    console.log('Fetching profile...')
    const response = await api.getProfile()
    console.log('Profile response:', response)
    
    if (!response || !response.user) {
      throw new Error('Invalid response format')
    }
    
    user.value = response.user
    showFarsi.value = response.user.show_farsi || false
    stats.value = response.stats || { questions: [], translations: [] }
  } catch (e) {
    error.value = 'Failed to load profile'
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function toggleFarsi() {
  saving.value = true
  try {
    const response = await api.updatePreferences({ show_farsi: showFarsi.value })
    if (response && response.user) {
      user.value = response.user
      toast.add({ 
        severity: 'success', 
        summary: 'Preferences Updated', 
        detail: `Farsi text ${showFarsi.value ? 'enabled' : 'disabled'}`, 
        life: 3000 
      })
    }
  } catch (e) {
    console.error('Failed to update preferences:', e)
    // Revert the toggle on error
    showFarsi.value = !showFarsi.value
    toast.add({ 
      severity: 'error', 
      summary: 'Update Failed', 
      detail: 'Could not save your preference', 
      life: 3000 
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="Profile" subtitle="Manage your account information" />
    <div class="profile-container">
      <div v-if="loading" class="loading">Loading profile...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="profile-content">
        <Card class="profile-card">
          <template #title>
            <div class="user-header">
              <Avatar :label="user.name.charAt(0)" size="xlarge" shape="circle" class="user-avatar" />
              <div class="user-info">
                <h1>{{ user.name }}</h1>
                <p class="email">{{ user.email }}</p>
              </div>
            </div>
          </template>
          <template #content>
            <div class="preferences-section">
              <h3>Preferences</h3>
              <div class="preference-item">
                <div class="preference-info">
                  <label for="farsi-toggle" class="preference-label">Show Farsi Text</label>
                  <p class="preference-description">Display Farsi translations alongside Italian text in questions</p>
                </div>
                <InputSwitch 
                  id="farsi-toggle"
                  v-model="showFarsi" 
                  @change="toggleFarsi"
                  :disabled="saving"
                />
              </div>
            </div>

            <div class="stats-section">
              <h3>Your Progress</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Questions Answered</span>
                  <span class="stat-value">{{ stats?.questions?.length || 0 }}</span>
                </div>
                <!-- Add more stats as needed based on actual data structure -->
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.user-avatar {
  background-color: var(--primary-500);
  color: white;
}

.user-info h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--text-color);
}

.email {
  margin: 0.5rem 0 0;
  color: var(--text-color-secondary);
}

.preferences-section {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--surface-200);
  margin-bottom: 2rem;
}

.preferences-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: var(--border-radius);
  gap: 1rem;
}

.preference-info {
  flex: 1;
}

.preference-label {
  display: block;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.preference-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.stats-section {
  margin-top: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--surface-ground);
  border-radius: var(--border-radius);
  text-align: center;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}
</style>
