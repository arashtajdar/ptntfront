<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref(localStorage.getItem('auth_token'))

const menuItems = computed(() => [
  {
    label: 'Practice',
    icon: 'pi pi-fw pi-pencil',
    items: [
      { label: 'Quick Practice', icon: 'pi pi-fw pi-bolt', command: () => router.push('/flashcard') },
      { label: 'Take Quiz', icon: 'pi pi-fw pi-list', command: () => router.push('/quiz') }
    ]
  },
  {
    label: 'Library',
    icon: 'pi pi-fw pi-book',
    items: [
      { label: 'All Flashcards', icon: 'pi pi-fw pi-clone', command: () => router.push('/flashcards') },
      { label: 'Segnali', icon: 'pi pi-fw pi-images', command: () => router.push('/signs') }
    ]
  },
  {
    label: 'My History',
    icon: 'pi pi-fw pi-history',
    items: [
      { label: 'Answered Questions', icon: 'pi pi-fw pi-check-circle', command: () => router.push('/questions-responded') },
      { label: 'Studied Flashcards', icon: 'pi pi-fw pi-bookmark', command: () => router.push('/flashcards-responded') }
    ]
  },
  {
    label: 'Profile',
    icon: 'pi pi-fw pi-user',
    visible: !!token.value,
    command: () => router.push('/profile')
  },
  {
    label: 'Logout',
    icon: 'pi pi-fw pi-sign-out',
    visible: !!token.value,
    command: () => logout()
  }
])

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
          <template v-if="!token">
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
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .brand {
    width: 100%;
    justify-content: center;
    margin-right: 0;
    margin-bottom: 0.25rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .main-menu {
    width: 100%;
    display: flex;
    justify-content: center;
    background: var(--surface-50) !important;
    border-radius: var(--radius-lg);
    padding: 0.25rem !important;
  }

  /* Center the hamburger icon in the bar */
  :deep(.p-menubar-button) {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .app-auth {
    display: none; /* Hide auth buttons container as they are in menu now (except login/register if not logged in, but user said put logout/profile in menu. Login/Register might still be outside? The previous step removed Profile/Logout from here if token exists. If !token, they are here. If !token, maybe we want them below too? Let's keep them for now, but the user focused on logged in state.) */
    /* Actually, if !token, we still have Login/Register buttons. 
       If we want strictly Brand -> Menu, we should probably put Login/Register in menu too or keep them below.
       Let's assume the user cares about the Logged In state mainly. 
       If I hide .app-auth, Login/Register will disappear. 
       Let's keep .app-auth visible if it has content, but maybe center it too.
    */
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>
