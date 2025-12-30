<script setup>
import { ref, computed } from 'vue'
import Popover from 'primevue/popover'

const props = defineProps({
  text: String,
  translations: Array
})

const selectedTranslation = ref(null)
const op = ref()

const processedText = computed(() => {
  if (!props.translations || props.translations.length === 0) return [{ text: props.text }]

  // Sort by length descending to match longest phrases first (avoids partial matches)
  const sortedTrans = [...props.translations].sort((a, b) => b.text_it.length - a.text_it.length)
  
  // Build an array of segments: { text: string, translation?: object }
  let segments = [{ text: props.text }]

  for (const trans of sortedTrans) {
    const phrase = trans.text_it
    if (!phrase) continue

    const newSegments = []
    for (const segment of segments) {
      if (segment.translation) {
        newSegments.push(segment)
        continue
      }

      let remainingText = segment.text
      let lowerText = remainingText.toLowerCase()
      let lowerPhrase = phrase.toLowerCase()
      let index = lowerText.indexOf(lowerPhrase)

      while (index !== -1) {
        if (index > 0) {
          newSegments.push({ text: remainingText.substring(0, index) })
        }
        newSegments.push({ 
          text: remainingText.substring(index, index + phrase.length),
          translation: trans
        })
        remainingText = remainingText.substring(index + phrase.length)
        lowerText = remainingText.toLowerCase()
        index = lowerText.indexOf(lowerPhrase)
      }

      if (remainingText) {
        newSegments.push({ text: remainingText })
      }
    }
    segments = newSegments
  }

  return segments
})

const showTranslation = (event, translation) => {
  selectedTranslation.value = translation
  op.value.toggle(event)
}
</script>

<template>
  <div class="question-display">
    <template v-for="(segment, idx) in processedText" :key="idx">
      <span v-if="segment.translation" 
            class="translation-phrase" 
            @click="showTranslation($event, segment.translation)">
        {{ segment.text }}
      </span>
      <span v-else>{{ segment.text }}</span>
    </template>

    <Popover ref="op" class="translation-popover">
      <div v-if="selectedTranslation" class="translation-popup">
        <div class="translation-item">
          <span class="label">English:</span>
          <p class="value">{{ selectedTranslation.text_en }}</p>
        </div>
        <div class="translation-item">
          <span class="label">Persian / فارسی:</span>
          <p class="value farsi text-farsi">{{ selectedTranslation.text_fa }}</p>
        </div>
      </div>
    </Popover>
  </div>
</template>

<style scoped>
.question-display {
  display: inline;
}

.translation-phrase {
  border-bottom: 2px dashed var(--primary-500);
  cursor: pointer;
  background-color: rgba(99, 102, 241, 0.05); /* Using primary 500 color value roughly */
  transition: all 0.2s;
  padding: 0 2px;
  border-radius: 4px;
  margin: 0 1px;
  display: inline-block;
}

.translation-phrase:hover {
  background-color: rgba(99, 102, 241, 0.15);
  border-bottom-style: solid;
}

.translation-popup {
  padding: 0.75rem;
  max-width: 280px;
  min-width: 180px;
}

.translation-item {
  margin-bottom: 0.85rem;
}

.translation-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 700;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.value {
  margin: 0;
  font-size: 1rem;
  color: var(--text-main);
  line-height: 1.4;
}

.farsi {
  font-size: 1.15rem;
  margin-top: 0.25rem;
}

/* Ensure the popover looks good */
:deep(.p-popover-content) {
  padding: 0 !important;
}
</style>
