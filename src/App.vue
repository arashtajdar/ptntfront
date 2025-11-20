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
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="brand">
          <i class="pi pi-bolt brand-icon"></i>
          <h2 class="app-title">Patente Front</h2>
        </div>
        <Menubar :model="menuItems" class="main-menu" />
        <div class="app-auth">
          <template v-if="token">
            <Button label="Logout" icon="pi pi-sign-out" @click="logout" severity="danger" outlined size="small" />
          </template>
          <template v-else>
            <Button label="Login" icon="pi pi-sign-in" @click="() => router.push('/login')" text size="small" />
            <Button label="Register" icon="pi pi-user-plus" @click="() => router.push('/register')" size="small" />
          </template>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  padding: 0.5rem 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: 1rem;
}

.brand-icon {
  font-size: 1.5rem;
  color: var(--primary-600);
}

.app-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.025em;
}

.main-menu {
  flex: 1;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.app-auth {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.5rem;
  }
  
  .header-content {
    padding: 0.5rem 1rem;
    flex-wrap: wrap;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .main-menu {
    order: 3;
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .app-auth {
    margin-left: auto;
  }
}
</style>
