<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import categoriesData from '../../categories.json'

const images = ref([])
const loading = ref(false)
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
  // Try to get from local cache first
  const cachedData = getFromCache()
  if (cachedData) {
    // Sort images by name (natural number sort)
    images.value = cachedData.sort((a, b) => {
      return a.image.localeCompare(b.image, undefined, { numeric: true })
    })
    updateCacheExpiry()
    return
  }

  loading.value = true
  try {
    const response = await api.getImagesList()
    const fetchedImages = response.images || []
    // Sort images by name (natural number sort)
    images.value = fetchedImages.sort((a, b) => {
      return a.image.localeCompare(b.image, undefined, { numeric: true })
    })
    // Save to cache
    saveToCache(images.value)
    updateCacheExpiry()
  } catch (error) {
    console.error('Error fetching images:', error)
  } finally {
    loading.value = false
  }
}

function getFromCache() {
  const cached = localStorage.getItem(CACHE_KEY)
  if (!cached) return null

  const { data, expiry } = JSON.parse(cached)
  if (Date.now() > expiry) {
    localStorage.removeItem(CACHE_KEY)
    return null
  }

  return data
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
    <div class="header-section">
      <h1>Questions by Image</h1>
    </div>
    
    <div v-if="loading" class="loading">
      <p>Loading images...</p>
    </div>

    <div v-if="!loading && !selectedImage" class="categories-container">
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
        <p>No images found</p>
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
            <p class="question-text">{{ question.text }}</p>
            <span class="answer-badge" :class="{ 'answer-true': question.answer.toUpperCase() === 'V', 'answer-false': question.answer.toUpperCase() === 'F' }">
              {{ question.answer.toUpperCase() === 'V' ? 'TRUE' : 'FALSE' }}
            </span>
          </div>
          <div class="question-details">
            <span v-if="question.parent_number" class="detail-item">Parent: {{ question.parent_number }}</span>
            <span v-if="question.question_number" class="detail-item">Question #: {{ question.question_number }}</span>
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

h1 {
  text-align: center;
  color: #007acc;
  margin-bottom: 24px;
  font-size: 2rem;
}

.header-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
}

h2 {
  color: #007acc;
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.loading {
  text-align: center;
  padding: 48px 24px;
  color: #666;
}

.no-images {
  text-align: center;
  padding: 48px 24px;
  color: #999;
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
  background: #f5f5f5;
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
  background: #f5f5f5;
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
