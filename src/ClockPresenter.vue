<script setup lang="ts">
import { computed } from 'vue'

import type { PresentationMode } from './config'
import { analogHands, formatTime, type TimeFormat } from './time'

const props = defineProps<{
  instant: Date
  timeZone?: string
  presentationMode: PresentationMode
  timeFormat: TimeFormat
  testId: string
}>()
const text = computed(() => formatTime(props.instant, props.timeZone, props.timeFormat))
const hands = computed(() => analogHands(props.instant, props.timeZone))
</script>

<template>
  <time v-if="presentationMode === 'digital'" :data-testid="testId">{{ text }}</time>
  <div v-else class="analog-clock">
    <svg class="clock-face" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="clock-rim" cx="50" cy="50" r="47" />
      <line
        v-for="mark in 12"
        :key="mark"
        class="clock-mark"
        x1="50"
        y1="7"
        x2="50"
        y2="12"
        :transform="`rotate(${mark * 30} 50 50)`"
      />
      <line
        class="hour-hand"
        x1="50"
        y1="50"
        x2="50"
        y2="27"
        :transform="`rotate(${hands.hour} 50 50)`"
      />
      <line
        class="minute-hand"
        x1="50"
        y1="50"
        x2="50"
        y2="17"
        :transform="`rotate(${hands.minute} 50 50)`"
      />
      <line
        class="second-hand"
        x1="50"
        y1="55"
        x2="50"
        y2="12"
        :transform="`rotate(${hands.second} 50 50)`"
      />
      <circle class="clock-hub" cx="50" cy="50" r="2" />
    </svg>
    <time class="analog-time-text" :data-testid="testId">{{ text }}</time>
  </div>
</template>
