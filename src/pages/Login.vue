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
  <Card class="main-card">
    <template #title>
      Login
    </template>
    <template #content>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="form-group">
        <label>Email</label>
        <InputText v-model="email" type="email" class="input" />
      </div>
      <div class="form-group">
        <label>Password</label>
        <InputText v-model="password" type="password" class="input" />
      </div>
      <Button label="Login" icon="pi pi-sign-in" @click="submit" class="p-button-sm" />
    </template>
  </Card>
</template>

<style scoped>
.main-card {
  max-width: 400px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 18px;
}
.input {
  width: 100%;
}
.error {
  color: #c00;
  margin-bottom: 12px;
  text-align: center;
}
</style>
