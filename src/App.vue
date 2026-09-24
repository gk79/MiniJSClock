<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { formatTime } from './time'

const localTime = ref(formatTime(new Date()))
let ticker: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  ticker = setInterval(() => {
    localTime.value = formatTime(new Date())
  }, 1000)
})

onUnmounted(() => {
  if (ticker !== undefined) clearInterval(ticker)
})
</script>

<template>
  <main class="app-shell" aria-labelledby="app-title">
    <section class="status-panel" aria-labelledby="local-clock-title">
      <p class="eyebrow">Local-first world clock</p>
      <h1 id="app-title">MiniJSClock</h1>
      <h2 id="local-clock-title" class="clock-label">Your local time</h2>
      <time class="clock-time" data-testid="local-time">{{ localTime }}</time>
    </section>
  </main>
</template>
