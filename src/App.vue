<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('auth_token'))

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
      <nav class="app-nav">
        <router-link to="/flashcard">Flashcard</router-link>
        <router-link to="/flashcards">All Flashcards</router-link>
        <router-link to="/quiz">Quiz</router-link>
        <router-link to="/questions-responded">My Questions</router-link>
        <router-link to="/flashcards-responded">My Flashcards</router-link>
      </nav>
      <div class="app-auth">
        <template v-if="token">
          <button class="btn" @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
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
.app-nav {
  display: flex;
  gap: 16px;
  margin-left: 24px;
}
.app-nav a {
  text-decoration: none;
  color: var(--primary);
  font-weight: 500;
  padding: 4px 10px;
  border-radius: var(--radius);
  transition: background 0.2s;
}
.app-nav a.router-link-active {
  background: var(--primary);
  color: #fff;
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
