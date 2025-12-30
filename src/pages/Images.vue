<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import categoriesData from '../../categories.json'
import PageHeader from '../components/PageHeader.vue'
import QuestionDisplay from '../components/QuestionDisplay.vue'

const images = ref([])
const loading = ref(true) // Start with loading true
const error = ref(null) // Track errors
const selectedImage = ref(null)
const selectedQuestions = ref([])
const cacheExpiry = ref(null)
const selectedCategory = ref('all')

const CACHE_KEY = 'images_list_cache'
const CACHE_TTL = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

// Computed property to categorize images
const categorizedImages = computed(() => {
  const categories = {}
  const imageFilenamesToCategory = {}
  
  // Build a map of filename -> category name
  for (const [categoryName, filenames] of Object.entries(categoriesData)) {
    filenames.forEach(filename => {
      imageFilenamesToCategory[filename] = categoryName
    })
  }
  
  // Categorize images
  images.value.forEach(imageItem => {
    const category = imageFilenamesToCategory[imageItem.image] || 'other'
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(imageItem)
  })
  
  // Sort images within each category
  for (const category in categories) {
    categories[category].sort((a, b) => {
      return a.image.localeCompare(b.image, undefined, { numeric: true })
    })
  }
  
  // Return categories in order, with 'other' last
  const sortedCategories = []
  for (const [categoryName, categoryImages] of Object.entries(categories)) {
    if (categoryName !== 'other') {
      sortedCategories.push({ name: categoryName, images: categoryImages, count: categoryImages.length })
    }
  }
  
  // Add 'other' category at the end if it exists
  if (categories['other']) {
    sortedCategories.push({ name: 'other', images: categories['other'], count: categories['other'].length })
  }
  
  return sortedCategories
})

// Filtered images based on selected category
const filteredImages = computed(() => {
  if (selectedCategory.value === 'all') {
    return categorizedImages.value
  }
  return categorizedImages.value.filter(cat => cat.name === selectedCategory.value)
})

// Get total count of all images
const allImagesCount = computed(() => {
  return images.value.length
})

function selectCategory(categoryName) {
  selectedCategory.value = categoryName
}

function getCategoryDisplayName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

onMounted(async () => {
  await fetchImages()
})

async function fetchImages() {
  error.value = null
  loading.value = true
  
  try {
    // Try to get from local cache first
    const cachedData = getFromCache()
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      // Sort images by name (natural number sort)
      images.value = [...cachedData].sort((a, b) => {
        return a.image.localeCompare(b.image, undefined, { numeric: true })
      })
      updateCacheExpiry()
      loading.value = false
      return
    }

    const response = await api.getImagesList()
    // Handle case where response might be an error message or invalid
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response from server')
    }

    const fetchedImages = response.images || []
    if (!Array.isArray(fetchedImages)) {
      throw new Error('Images data is not an array')
    }

    // Sort images by name (natural number sort)
    images.value = [...fetchedImages].sort((a, b) => {
      return a.image.localeCompare(b.image, undefined, { numeric: true })
    })
    
    // Save to cache
    saveToCache(images.value)
    updateCacheExpiry()
  } catch (err) {
    console.error('Error fetching images:', err)
    error.value = 'Failed to load images. Please check your connection and try again.'
    // If cache was corrupted, clear it
    localStorage.removeItem(CACHE_KEY)
  } finally {
    loading.value = false
  }
}

function getFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached)
    if (!parsed || typeof parsed !== 'object') return null
    
    const { data, expiry } = parsed
    if (!data || !expiry) return null

    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch (e) {
    console.error('Error reading from cache:', e)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

function saveToCache(data) {
  const cacheData = {
    data: data,
    expiry: Date.now() + CACHE_TTL
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
}

function updateCacheExpiry() {
  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    const { expiry } = JSON.parse(cached)
    cacheExpiry.value = new Date(expiry).toLocaleTimeString()
  }
}

async function refreshCache() {
  localStorage.removeItem(CACHE_KEY)
  cacheExpiry.value = null
  await fetchImages()
}

function selectImage(image) {
  selectedImage.value = image.image
  // Sort questions: V (TRUE) first, then F (FALSE)
  selectedQuestions.value = [...image.questions].sort((a, b) => {
    const aIsV = a.answer.toUpperCase() === 'V' ? 0 : 1
    const bIsV = b.answer.toUpperCase() === 'V' ? 0 : 1
    return aIsV - bIsV
  })
}

function clearSelection() {
  selectedImage.value = null
  selectedQuestions.value = []
}
</script>

<template>
  <div class="images-container">
    <PageHeader title="Questions by Image" subtitle="Browse traffic signs and their related questions" />
    
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Loading signals...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="refreshCache" class="retry-btn">
        <i class="pi pi-refresh"></i> Retry
      </button>
    </div>

    <div v-else-if="!selectedImage" class="categories-container">
      <div class="list-header">
        <p v-if="cacheExpiry" class="cache-info">
          <i class="pi pi-clock"></i> Cached until {{ cacheExpiry }}
          <button @click="refreshCache" class="refresh-cache-btn" title="Refresh local cache">
            <i class="pi pi-refresh"></i>
          </button>
        </p>
      </div>
      <!-- Category Filter Navigation -->
      <div class="category-filter-nav">
        <button 
          @click="selectCategory('all')" 
          :class="['category-btn', { active: selectedCategory === 'all' }]"
        >
          All ({{ allImagesCount }})
        </button>
        <button 
          v-for="category in categorizedImages" 
          :key="category.name"
          @click="selectCategory(category.name)" 
          :class="['category-btn', { active: selectedCategory === category.name }]"
        >
          {{ getCategoryDisplayName(category.name) }} ({{ category.count }})
        </button>
      </div>

      <div v-if="images.length === 0" class="no-images">
        <i class="pi pi-info-circle"></i>
        <p>No signals found.</p>
        <button @click="refreshCache" class="retry-btn">
          <i class="pi pi-refresh"></i> Refresh
        </button>
      </div>
      
      <div v-for="category in filteredImages" :key="category.name" class="category-section">
        <h2 class="category-title">{{ getCategoryDisplayName(category.name) }}</h2>
        <div class="images-grid">
          <div v-for="(item, index) in category.images" :key="index" class="image-card" @click="selectImage(item)">
            <div class="image-wrapper">
              <img :src="`/images/${item.image}`" :alt="item.image" class="image-thumb" />
            </div>
            <div class="image-info">
              <p class="question-count">{{ item.questions.length }} question(s)</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && selectedImage" class="questions-view">
      <button @click="clearSelection" class="back-btn">
        <i class="pi pi-arrow-left"></i> Back to Images
      </button>
      
      <div class="selected-image-preview">
        <img :src="`/images/${selectedImage}`" :alt="selectedImage" class="preview-image" />
      </div>
      
      <h2>Questions for: {{ selectedImage }}</h2>
      
      <div class="questions-list">
        <div v-for="question in selectedQuestions" :key="question.id" class="question-card">
          <div class="question-header">
            <p class="question-text">
              <QuestionDisplay :text="question.text" :translations="question.translations" />
            </p>
            <span class="answer-badge" :class="{ 'answer-true': question.answer.toUpperCase() === 'V', 'answer-false': question.answer.toUpperCase() === 'F' }">
              {{ question.answer.toUpperCase() === 'V' ? 'TRUE' : 'FALSE' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.images-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #007acc;
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.loading-state, .error-state, .no-images {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  margin-bottom: 32px;
}

.loading-state i, .error-state i, .no-images i {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.loading-state i { color: #007acc; }
.error-state i { color: #d32f2f; }
.no-images i { color: #666; }

.loading-state p, .error-state p, .no-images p {
  font-size: 1.1rem;
  color: #444;
  margin: 0 0 24px 0;
}

.retry-btn {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #005fa3;
  transform: translateY(-2px);
}

.list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.cache-info {
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.refresh-cache-btn {
  background: none;
  border: none;
  color: #007acc;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.refresh-cache-btn:hover {
  background: #f0f4f8;
}

.categories-container {
  width: 100%;
}

.category-filter-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
  padding: 16px;
  background: #f7f9fc;
  border-radius: 8px;
  border: 1px solid #e0e6ed;
}

.category-btn {
  padding: 10px 16px;
  background: #fff;
  border: 2px solid #e0e6ed;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  border-color: #007acc;
  color: #007acc;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 122, 204, 0.1);
}

.category-btn.active {
  background: #007acc;
  border-color: #007acc;
  color: white;
  font-weight: 600;
}

.category-btn.active:hover {
  background: #005fa3;
  border-color: #005fa3;
  transform: translateY(-2px);
}

.category-section {
  margin-bottom: 48px;
}

.category-title {
  color: #007acc;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e6ed;
  text-transform: capitalize;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.image-card {
  background: #fff;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.image-card:hover {
  border-color: #007acc;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 122, 204, 0.15);
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-info {
  padding: 16px;
}

.image-name {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-count {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

.questions-view {
  background: #fff;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 32px;
}

.selected-image-preview {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 32px;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.back-btn {
  background: #007acc;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #005fa3;
}

.back-btn i {
  font-size: 1.1rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: #f7f9fc;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s;
}

.question-card:hover {
  background: #f0f4f8;
  border-color: #007acc;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.question-text {
  margin: 0;
  color: #222;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
}

.answer-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
  min-width: 70px;
  text-align: center;
}

.answer-true {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.answer-false {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.question-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  font-size: 0.85rem;
  color: #666;
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e6ed;
}

@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .questions-view {
    padding: 16px;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>
