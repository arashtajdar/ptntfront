<script setup>
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'

const router = useRouter()

const pages = [
  {
    title: 'Flashcard',
    description: 'Practice with flashcards to test your knowledge',
    path: '/flashcard',
    icon: '🎴',
    color: '#4CAF50'
  },
  {
    title: 'Flashcards List',
    description: 'Browse and manage all your flashcards',
    path: '/flashcards',
    icon: '📚',
    color: '#2196F3'
  },
  {
    title: 'Quiz',
    description: 'Take quizzes to test your understanding',
    path: '/quiz',
    icon: '📝',
    color: '#FF9800'
  },
  {
    title: 'Signs',
    description: 'Browse traffic signs and their questions',
    path: '/signs',
    icon: '🚦',
    color: '#F44336'
  },
  {
    title: 'Questions Responded',
    description: 'View your quiz history and responses',
    path: '/questions-responded',
    icon: '✅',
    color: '#9C27B0'
  },
  {
    title: 'Flashcards Responded',
    description: 'Review your flashcard practice history',
    path: '/flashcards-responded',
    icon: '📊',
    color: '#00BCD4'
  },
  {
    title: 'Profile',
    description: 'Manage your account and settings',
    path: '/profile',
    icon: '👤',
    color: '#607D8B'
  }
]

function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="home-container">
    <PageHeader title="Welcome to PTNT" subtitle="Choose a section to get started" />

    <div class="cards-grid">
      <div 
        v-for="page in pages" 
        :key="page.path" 
        class="page-card"
        @click="navigateTo(page.path)"
        :style="{ '--card-color': page.color }"
      >
        <div class="card-icon">{{ page.icon }}</div>
        <h2 class="card-title">{{ page.title }}</h2>
        <p class="card-description">{{ page.description }}</p>
        <div class="card-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.page-card {
  background: #fff;
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--card-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.page-card:hover::before {
  transform: scaleX(1);
}

.page-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--card-color);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.page-card:hover .card-icon {
  transform: scale(1.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.card-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.card-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 1.5rem;
  color: var(--card-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.page-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .home-container {
    padding: 24px 16px;
  }

  h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-card {
    padding: 24px 20px;
  }

  .card-icon {
    font-size: 2.5rem;
  }

  .card-title {
    font-size: 1.25rem;
  }
}
</style>
