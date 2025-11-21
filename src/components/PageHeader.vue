<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="page-header">
    <div class="page-header-content">
      <h1 class="page-title">{{ title }}</h1>
      <!-- <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p> -->
    </div>
  </div>
</template>

<style scoped>
.page-header {
  position: sticky;
  top: 80px; /* Below the app-header */
  z-index: 900;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  background: linear-gradient(135deg, #007acc 0%, #005fa3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
  color: #666;
}

@media (max-width: 768px) {
  .page-header {
    top: 0; /* Stick to top since app-header is hidden on mobile */
    padding: 1rem;
    margin: 0 0 1rem 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }
}
</style>
