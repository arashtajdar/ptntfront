<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('auth_token'))

const menuItems = [
  { label: 'Flashcard', command: () => router.push('/flashcard') },
  { label: 'All Flashcards', command: () => router.push('/flashcards') },
  { label: 'Quiz', command: () => router.push('/quiz') },
  { label: 'My Questions', command: () => router.push('/questions-responded') },
  { label: 'My Flashcards', command: () => router.push('/flashcards-responded') },
  { label: 'Images', command: () => router.push('/images') }
]

function logout() {
  localStorage.removeItem('auth_token')
  token.value = null
  router.push('/login')
}
</script>

<template>
  <div class="app-bg">
    <header class="app-header">
      <h2 class="app-title">Patente Front</h2>
      <Menubar :model="menuItems" class="main-menu" />
      <div class="app-auth">
        <template v-if="token">
          <Button label="Logout" icon="pi pi-sign-out" @click="logout" severity="danger" />
        </template>
        <template v-else>
          <Button label="Login" icon="pi pi-sign-in" @click="() => router.push('/login')" text />
          <Button label="Register" icon="pi pi-user-plus" @click="() => router.push('/register')" text />
        </template>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --primary: #007acc;
  --bg: #f7f9fc;
  --card-bg: #fff;
  --border: #e0e6ed;
  --radius: 8px;
  --shadow: 0 2px 8px rgba(0,0,0,0.04);
  --text: #222;
  --nav-bg: #fff;
}
.app-bg {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}
.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 32px;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.app-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary);
}
.main-menu {
  flex: 1;
  margin-left: 24px;
  background: transparent;
  border: none;
}
.app-auth {
  margin-left: auto;
  display: flex;
  gap: 12px;
}
.btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 6px 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: background 0.2s;
}
.btn:hover {
  background: #005fa3;
}
.app-main {
  max-width: 700px;
  margin: 32px auto;
  padding: 24px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
</style>
