<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import catalog from './cityCatalog.json'
import { loadConfig, saveConfig, defaultConfig, type ConfigV3 } from './config'
import ClockPresenter from './ClockPresenter.vue'
import AlarmEditor from './AlarmEditor.vue'
import type { Alarm } from './alarms'

const catalogById = new Map(catalog.map((city) => [city.geonameId, city]))
const catalogIds = new Set(catalogById.keys())
const currentInstant = ref(new Date())
const config = ref<ConfigV3>(defaultConfig())
const search = ref('')
const pickerOpen = ref(false)
const activeIndex = ref(-1)
const cityInput = ref<HTMLInputElement>()
const storageStatus = ref<'ok' | 'invalid' | 'unsupported' | 'unavailable' | 'write-failed'>('ok')
let storage: Storage | undefined
let ticker: ReturnType<typeof setInterval> | undefined

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
      ([city.name, city.asciiName].some((value) => value.toLowerCase().startsWith(query)) ||
        city.countryCode.toLowerCase().includes(query)),
  )
})
const activeCity = computed(() => availableCities.value[activeIndex.value])
watch(availableCities, () => {
  activeIndex.value = -1
})

function closePicker() {
  pickerOpen.value = false
  activeIndex.value = -1
}

async function handlePickerKey(event: KeyboardEvent) {
  if (event.isComposing) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closePicker()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    pickerOpen.value = true
    const count = availableCities.value.length
    if (!count) return
    activeIndex.value =
      activeIndex.value < 0
        ? event.key === 'ArrowDown'
          ? 0
          : count - 1
        : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
    await nextTick()
    document
      .getElementById(`city-option-${activeCity.value?.geonameId}`)
      ?.scrollIntoView({ block: 'nearest' })
  } else if (event.key === 'Enter' && pickerOpen.value) {
    event.preventDefault()
    if (activeCity.value) addCity(activeCity.value.geonameId)
  }
}

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

function addCity(id: number) {
  if (catalogIds.has(id) && !config.value.selectedCityIds.includes(id)) {
    config.value = { ...config.value, selectedCityIds: [...config.value.selectedCityIds, id] }
    persist()
  }
  search.value = ''
  closePicker()
  cityInput.value?.focus()
}

function removeCity(id: number) {
  config.value = {
    ...config.value,
    selectedCityIds: config.value.selectedCityIds.filter((selectedId) => selectedId !== id),
    alarms: config.value.alarms.filter((alarm) => alarm.cityId !== id),
  }
  persist()
}

function saveAlarm(alarm: Alarm) {
  if (!config.value.selectedCityIds.includes(alarm.cityId)) return
  const index = config.value.alarms.findIndex((existing) => existing.cityId === alarm.cityId)
  const alarms = [...config.value.alarms]
  if (index < 0) alarms.push(alarm)
  else alarms[index] = alarm
  config.value = { ...config.value, alarms }
  persist()
}

function removeAlarm(cityId: number) {
  config.value = {
    ...config.value,
    alarms: config.value.alarms.filter((alarm) => alarm.cityId !== cityId),
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
        <ClockPresenter
          class="clock-time"
          test-id="local-time"
          :instant="currentInstant"
          :presentation-mode="config.presentationMode"
          :time-format="config.timeFormat"
        />
        <fieldset class="clock-settings">
          <legend>Clock settings (all clocks)</legend>
          <label for="presentation-mode">Presentation</label>
          <select id="presentation-mode" v-model="config.presentationMode" @change="persist">
            <option value="digital">Digital</option>
            <option value="analog">Analog</option>
          </select>
          <label for="time-format">Digital time format</label>
          <select id="time-format" v-model="config.timeFormat" @change="persist">
            <option value="24h">24-hour</option>
            <option value="12h">12-hour</option>
          </select>
        </fieldset>
      </section>

      <section class="world-section" aria-labelledby="world-title">
        <h2 id="world-title">World clocks</h2>
        <p v-if="warning" class="storage-warning" role="status">{{ warning }}</p>
        <div class="picker">
          <label id="city-label" for="city-search">Add a city</label>
          <div class="city-combobox">
            <input
              id="city-search"
              ref="cityInput"
              v-model="search"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="city-results"
              :aria-expanded="pickerOpen"
              :aria-activedescendant="
                pickerOpen && activeCity ? `city-option-${activeCity.geonameId}` : undefined
              "
              aria-describedby="city-result-count"
              autocomplete="off"
              placeholder="City or country code"
              @focus="pickerOpen = true"
              @input="pickerOpen = true"
              @click="pickerOpen = true"
              @blur="closePicker"
              @keydown="handlePickerKey"
            />
            <ul
              v-show="pickerOpen"
              id="city-results"
              class="city-results"
              role="listbox"
              aria-labelledby="city-label"
            >
              <li
                v-for="(city, index) in availableCities"
                :id="`city-option-${city.geonameId}`"
                :key="city.geonameId"
                role="option"
                :aria-selected="index === activeIndex"
                @mousedown.prevent
                @click="addCity(city.geonameId)"
              >
                {{ city.name }} ({{ city.countryCode }})
              </li>
            </ul>
          </div>
          <p id="city-result-count" class="picker-count" aria-live="polite">
            {{
              availableCities.length
                ? `${availableCities.length} cities available`
                : 'No matching cities. Try another city or country code.'
            }}
          </p>
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
              <ClockPresenter
                class="world-time"
                :test-id="`city-time-${city.geonameId}`"
                :instant="currentInstant"
                :time-zone="city.timeZone"
                :presentation-mode="config.presentationMode"
                :time-format="config.timeFormat"
              />
            </div>
            <AlarmEditor
              :city-id="city.geonameId"
              :city-name="city.name"
              :time-zone="city.timeZone"
              :alarm="config.alarms.find((alarm) => alarm.cityId === city.geonameId)"
              @save="saveAlarm"
              @remove="removeAlarm(city.geonameId)"
            />
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
