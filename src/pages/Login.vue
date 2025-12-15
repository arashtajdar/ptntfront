<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.login({ email: email.value, password: password.value })
    if (res && (res.token || (res.data && res.data.token))) {
      const token = res.token || res.data.token
      localStorage.setItem('auth_token', token)
      router.push('/flashcard')
    } else {
      error.value = 'Login failed. Check credentials.'
    }
  } catch (e) {
    if (e.response && e.response.status === 403 && e.response.data.message === 'Your email address is not verified.') {
      error.value = 'Please verify your email address before logging in.'
    } else {
      error.value = String(e)
    }
  } finally {
    loading.value = false
  }
}

import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const successMessage = ref('')

onMounted(() => {
  if (route.query.verified === '1') {
    successMessage.value = 'Email verified successfully! You can now log in.'
  }
})
</script>

<template>
  <div class="auth-container">
    <Card class="auth-card">
      <template #title>
        <div class="auth-header">
          <i class="pi pi-user auth-icon"></i>
          <span>Welcome Back</span>
        </div>
        <p class="auth-subtitle">Sign in to continue your learning journey</p>
      </template>
      <template #content>
        <div v-if="successMessage" class="success-message">
          <i class="pi pi-check-circle"></i>
          <span>{{ successMessage }}</span>
        </div>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-envelope" />
            <InputText id="email" v-model="email" type="email" class="w-full" placeholder="you@example.com" />
          </span>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-lock" />
            <InputText id="password" v-model="password" type="password" class="w-full" placeholder="••••••••" />
          </span>
        </div>
        
        <Button label="Sign In" icon="pi pi-sign-in" @click="submit" class="w-full mt-4" size="large" :loading="loading" />
        
        <div class="auth-footer">
          <span>Don't have an account?</span>
          <Button label="Create account" link @click="router.push('/register')" class="p-0 ml-2" />
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
  max-width: 420px;
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

.success-message {
  background: #f0fdf4;
  color: #15803d;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #dcfce7;
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
