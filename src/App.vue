<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const token = ref(null)
const mobileMenuOpen = ref(false)

// Initialize token and watch for changes
onMounted(() => {
  token.value = localStorage.getItem('auth_token')
})

// Computed property to track login state
const isLoggedIn = computed(() => !!token.value)

// Watch route changes to update token (catches login/logout)
watch(() => route.path, () => {
  token.value = localStorage.getItem('auth_token')
  mobileMenuOpen.value = false // Close menu on navigation
})

// All pages in a flat list for mobile menu
const allPages = computed(() => [
  { label: 'Home', icon: 'pi pi-fw pi-home', path: '/' },
  { label: 'Quick Practice', icon: 'pi pi-fw pi-bolt', path: '/flashcard' },
  { label: 'Take Quiz', icon: 'pi pi-fw pi-question-circle', path: '/quiz' },
  { label: 'All Flashcards', icon: 'pi pi-fw pi-clone', path: '/flashcards' },
  { label: 'Segnali', icon: 'pi pi-fw pi-images', path: '/signs' },
  { label: 'Answered Questions', icon: 'pi pi-fw pi-check-circle', path: '/questions-responded' },
  { label: 'Studied Flashcards', icon: 'pi pi-fw pi-bookmark', path: '/flashcards-responded' },
  ...(isLoggedIn.value ? [
    { label: 'Profile', icon: 'pi pi-fw pi-user', path: '/profile' }
  ] : [])
])

const menuItems = computed(() => [
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Practice',
    icon: 'pi pi-fw pi-pencil',
    items: [
      { label: 'Quick Practice', icon: 'pi pi-fw pi-bolt', command: () => router.push('/flashcard') },
      { label: 'Take Quiz', icon: 'pi pi-fw pi-question-circle', command: () => router.push('/quiz') }
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
    visible: isLoggedIn.value,
    command: () => router.push('/profile')
  },
  {
    label: 'Logout',
    icon: 'pi pi-fw pi-sign-out',
    visible: isLoggedIn.value,
    command: () => logout()
  }
])

function logout() {
  localStorage.removeItem('auth_token')
  token.value = null
  router.push('/login')
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function navigateToPage(path) {
  router.push(path)
  mobileMenuOpen.value = false
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
          <template v-if="!isLoggedIn">
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

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
      <button class="nav-btn" @click="toggleMobileMenu">
        <i class="pi pi-bars"></i>
        <span>Menu</span>
      </button>
      <button class="nav-btn nav-btn-primary" @click="navigateToPage('/')">
        <i class="pi pi-home"></i>
        <span>Home</span>
      </button>
      <button class="nav-btn" @click="navigateToPage('/quiz')">
        <i class="pi pi-question"></i>
        <span>Quiz</span>
      </button>
    </nav>

    <!-- Mobile Menu Drawer -->
    <transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click="toggleMobileMenu">
        <div class="mobile-menu-drawer" @click.stop>
          <div class="mobile-menu-header">
            <h3>Menu</h3>
            <button class="close-btn" @click="toggleMobileMenu">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="mobile-menu-items">
            <button
              v-for="page in allPages"
              :key="page.path"
              class="mobile-menu-item"
              @click="navigateToPage(page.path)"
            >
              <i :class="page.icon"></i>
              <span>{{ page.label }}</span>
            </button>
            <button
              v-if="isLoggedIn"
              class="mobile-menu-item logout-item"
              @click="logout"
            >
              <i class="pi pi-fw pi-sign-out"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
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

/* Mobile Bottom Navigation - Hidden on desktop */
.mobile-bottom-nav {
  display: none;
}

.mobile-menu-overlay {
  display: none;
}

@media (max-width: 768px) {
  .app-container {
    padding-bottom: 70px; /* Space for bottom nav */
  }

  /* Completely hide app-header on mobile */
  .app-header {
    display: none !important;
  }

  .app-main {
    margin: 0;
    padding: 0;
  }

  /* Mobile Bottom Navigation */
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #e0e6ed;
    padding: 8px;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
    flex: 1;
    max-width: 100px;
  }

  .nav-btn i {
    font-size: 1.5rem;
  }

  .nav-btn span {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .nav-btn:active {
    transform: scale(0.95);
  }

  .nav-btn-primary {
    color: #007acc;
  }

  .nav-btn-primary i {
    font-size: 1.75rem;
  }

  /* Mobile Menu Drawer */
  .mobile-menu-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
  }

  .mobile-menu-drawer {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 80%;
    max-width: 300px;
    background: #fff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .mobile-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #e0e6ed;
    background: linear-gradient(135deg, #007acc 0%, #005fa3 100%);
  }

  .mobile-menu-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .close-btn i {
    font-size: 1.5rem;
  }

  .close-btn:active {
    background: rgba(255, 255, 255, 0.2);
  }

  .mobile-menu-items {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: transparent;
    border: none;
    color: #333;
    cursor: pointer;
    width: 100%;
    text-align: left;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .mobile-menu-item i {
    font-size: 1.25rem;
    color: #007acc;
  }

  .mobile-menu-item:active {
    background: #f0f4f8;
    transform: scale(0.98);
  }

  .logout-item {
    margin-top: 8px;
    border-top: 1px solid #e0e6ed;
    padding-top: 18px;
    color: #d32f2f;
  }

  .logout-item i {
    color: #d32f2f;
  }

  /* Slide animation for drawer */
  .slide-enter-active,
  .slide-leave-active {
    transition: opacity 0.3s ease;
  }

  .slide-enter-active .mobile-menu-drawer,
  .slide-leave-active .mobile-menu-drawer {
    transition: transform 0.3s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
  }

  .slide-enter-from .mobile-menu-drawer,
  .slide-leave-to .mobile-menu-drawer {
    transform: translateX(-100%);
  }
}
</style>
