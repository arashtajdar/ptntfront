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
  <Card class="main-card">
    <template #title>
      Register
    </template>
    <template #content>
      <div v-if="error" class="error">{{ error }}</div>
      <div class="form-group">
        <label>Name</label>
        <InputText v-model="name" class="input" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <InputText v-model="email" type="email" class="input" />
      </div>
      <div class="form-group">
        <label>Password</label>
        <InputText v-model="password" type="password" class="input" />
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <InputText v-model="password_confirmation" type="password" class="input" />
      </div>
      <Button label="Register" icon="pi pi-user-plus" @click="submit" class="p-button-sm" />
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
