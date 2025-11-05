<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
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
    error.value = String(e)
  }
}
</script>

<template>
  <div class="card">
    <h2 class="card-title">Login</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="form-group">
      <label>Email</label>
      <input v-model="email" type="email" class="input" />
    </div>
    <div class="form-group">
      <label>Password</label>
      <input v-model="password" type="password" class="input" />
    </div>
    <button class="btn" @click="submit">Login</button>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 32px 24px;
  max-width: 400px;
  margin: 0 auto;
}
.card-title {
  margin-bottom: 24px;
  color: #007acc;
  text-align: center;
}
.form-group {
  margin-bottom: 18px;
}
.input {
  display: block;
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e6ed;
  border-radius: 5px;
  font-size: 1rem;
}
.error {
  color: #c00;
  margin-bottom: 12px;
  text-align: center;
}
</style>
