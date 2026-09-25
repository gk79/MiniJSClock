<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import catalog from './cityCatalog.json'
import { loadConfig, saveConfig, type ConfigV1 } from './config'
import { formatTime } from './time'

const catalogById = new Map(catalog.map((city) => [city.geonameId, city]))
const catalogIds = new Set(catalogById.keys())
const currentInstant = ref(new Date())
const config = ref<ConfigV1>({ version: 1, selectedCityIds: [] })
const search = ref('')
const selectedOption = ref('')
const storageStatus = ref<'ok' | 'invalid' | 'unsupported' | 'unavailable' | 'write-failed'>('ok')
let storage: Storage | undefined
let ticker: ReturnType<typeof setInterval> | undefined

const localTime = computed(() => formatTime(currentInstant.value))
const selectedCities = computed(() =>
  config.value.selectedCityIds.flatMap((id) => {
    const city = catalogById.get(id)
    return city ? [city] : []
  }),
)
const availableCities = computed(() => {
  const query = search.value.trim().toLowerCase()
  const selected = new Set(config.value.selectedCityIds)
  return catalog.filter(
    (city) =>
      !selected.has(city.geonameId) &&
      [city.name, city.asciiName, city.countryCode].some((value) =>
        value.toLowerCase().includes(query),
      ),
  )
})
const warning = computed(() => {
  switch (storageStatus.value) {
    case 'invalid':
      return 'Saved clocks were invalid. Your selection was reset.'
    case 'unsupported':
      return 'Saved clocks use an unsupported version. Changes in this tab will not overwrite them.'
    case 'unavailable':
      return 'Browser storage is unavailable. Changes may not survive a reload.'
    case 'write-failed':
      return 'Clocks changed, but saving failed. Changes may not survive a reload.'
    default:
      return ''
  }
})

function persist() {
  if (storageStatus.value === 'unsupported') return
  if (!storage) {
    storageStatus.value = 'unavailable'
  } else {
    storageStatus.value = saveConfig(storage, config.value, catalogIds) ? 'ok' : 'write-failed'
  }
}

function addCity(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value)
  if (catalogIds.has(id) && !config.value.selectedCityIds.includes(id)) {
    config.value = { version: 1, selectedCityIds: [...config.value.selectedCityIds, id] }
    persist()
  }
  selectedOption.value = ''
}

function removeCity(id: number) {
  config.value = {
    version: 1,
    selectedCityIds: config.value.selectedCityIds.filter((selectedId) => selectedId !== id),
  }
  persist()
}

onMounted(() => {
  try {
    storage = window.localStorage
    const loaded = loadConfig(storage, catalogIds)
    config.value = loaded.config
    storageStatus.value = loaded.status
  } catch {
    storageStatus.value = 'unavailable'
  }
  ticker = setInterval(() => {
    currentInstant.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (ticker !== undefined) clearInterval(ticker)
})
</script>

<template>
  <main class="app-shell" aria-labelledby="app-title">
    <div class="dashboard">
      <section class="status-panel" aria-labelledby="local-clock-title">
        <p class="eyebrow">Local-first world clock</p>
        <h1 id="app-title">MiniJSClock</h1>
        <h2 id="local-clock-title" class="clock-label">Your local time</h2>
        <time class="clock-time" data-testid="local-time">{{ localTime }}</time>
      </section>

      <section class="world-section" aria-labelledby="world-title">
        <h2 id="world-title">World clocks</h2>
        <p v-if="warning" class="storage-warning" role="status">{{ warning }}</p>
        <div class="picker">
          <label for="city-search">Search cities</label>
          <input
            id="city-search"
            v-model="search"
            type="search"
            autocomplete="off"
            placeholder="City or country code"
          />
          <label for="city-select">Add a city</label>
          <select id="city-select" v-model="selectedOption" @change="addCity">
            <option value="">Choose a city</option>
            <option v-for="city in availableCities" :key="city.geonameId" :value="city.geonameId">
              {{ city.name }} ({{ city.countryCode }})
            </option>
          </select>
          <p class="picker-count">{{ availableCities.length }} cities available</p>
        </div>

        <p v-if="selectedCities.length === 0" class="empty-state">
          Add a city to compare its time with yours.
        </p>
        <ul v-else class="clock-list">
          <li
            v-for="city in selectedCities"
            :key="city.geonameId"
            class="world-card"
            :data-city-id="city.geonameId"
          >
            <div>
              <h3>
                {{ city.name }} <span class="country-code">{{ city.countryCode }}</span>
              </h3>
              <p class="zone-label">{{ city.timeZone }}</p>
              <time class="world-time" :data-testid="`city-time-${city.geonameId}`">{{
                formatTime(currentInstant, city.timeZone)
              }}</time>
            </div>
            <button
              type="button"
              :aria-label="`Remove ${city.name}`"
              @click="removeCity(city.geonameId)"
            >
              Remove
            </button>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
