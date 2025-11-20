<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    const res = await api.register({ name: name.value, email: email.value, password: password.value, password_confirmation: password_confirmation.value })
    const token = res && (res.token || (res.data && res.data.token))
    if (token) {
      localStorage.setItem('auth_token', token)
      router.push('/flashcard')
    } else {
      error.value = 'Registration failed.'
    }
  } catch (e) { error.value = String(e) }
}
</script>

<template>
  <div class="auth-container">
    <Card class="auth-card">
      <template #title>
        <div class="auth-header">
          <i class="pi pi-user-plus auth-icon"></i>
          <span>Create Account</span>
        </div>
        <p class="auth-subtitle">Join us and start mastering new languages</p>
      </template>
      <template #content>
        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>
        
        <div class="form-group">
          <label for="name">Full Name</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-user" />
            <InputText id="name" v-model="name" class="w-full" placeholder="John Doe" />
          </span>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-envelope" />
            <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com" />
          </span>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="password">Password</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock" />
              <InputText id="password" v-model="password" type="password" class="w-full" placeholder="••••••••" />
            </span>
          </div>
          
          <div class="form-group half">
            <label for="confirm">Confirm</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock" />
              <InputText id="confirm" v-model="password_confirmation" type="password" class="w-full" placeholder="••••••••" />
            </span>
          </div>
        </div>
        
        <Button label="Create Account" icon="pi pi-check-circle" @click="submit" class="w-full mt-4" size="large" />
        
        <div class="auth-footer">
          <span>Already have an account?</span>
          <Button label="Sign in" link @click="router.push('/login')" class="p-0 ml-2" />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-card {
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: var(--primary-700);
  margin-bottom: 0.5rem;
}

.auth-icon {
  font-size: 1.5rem;
  color: var(--primary-500);
}

.auth-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 400;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-main);
  font-size: 0.9rem;
}

.w-full {
  width: 100%;
}

.error-message {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #fee2e2;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Icon positioning fix for PrimeVue InputIcon */
.p-input-icon-left {
  position: relative;
  display: block;
}

.p-input-icon-left > i {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  margin-top: -0.5rem;
  color: var(--text-muted);
  z-index: 1;
}

.p-input-icon-left > .p-inputtext {
  padding-left: 2.5rem !important;
}
</style>
