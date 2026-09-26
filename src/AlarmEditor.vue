<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

import { civilInputAt, configureOnce, isDailyTime, type Alarm } from './alarms'

const props = defineProps<{ cityId: number; cityName: string; timeZone: string; alarm?: Alarm }>()
const emit = defineEmits<{ save: [alarm: Alarm]; remove: [] }>()
const editing = ref(false)
const recurrence = ref<'once' | 'daily'>('once')
const day = ref('')
const time = ref('')
const error = ref('')
const toggle = ref<HTMLButtonElement>()
const recurrenceInput = ref<HTMLSelectElement>()
const prefix = computed(() => `alarm-${props.cityId}`)
const summary = computed(() => {
  if (!props.alarm) return ''
  if (props.alarm.recurrence === 'daily') return `Daily at ${props.alarm.time} · ${props.timeZone}`
  const civil = civilInputAt(new Date(props.alarm.instant), props.timeZone)
  return `One-time ${civil.day} at ${civil.time} · ${props.timeZone} (${props.alarm.instant.slice(11, 16)} UTC)`
})

async function beginEdit() {
  const civil = civilInputAt(
    props.alarm?.recurrence === 'once' ? new Date(props.alarm.instant) : new Date(),
    props.timeZone,
  )
  recurrence.value = props.alarm?.recurrence ?? 'once'
  day.value = civil.day
  time.value = props.alarm?.recurrence === 'daily' ? props.alarm.time : civil.time
  error.value = ''
  editing.value = true
  await nextTick()
  recurrenceInput.value?.focus()
}

async function close() {
  editing.value = false
  error.value = ''
  await nextTick()
  toggle.value?.focus()
}

function save() {
  if (recurrence.value === 'daily') {
    if (!isDailyTime(time.value)) {
      error.value = 'Enter a valid local time in HH:mm.'
      return
    }
    emit('save', { cityId: props.cityId, recurrence: 'daily', time: time.value })
  } else {
    const result = configureOnce(props.cityId, props.timeZone, day.value, time.value, new Date())
    if (!result.ok) {
      error.value = {
        invalid: 'Enter a valid local date and time.',
        nonexistent:
          'This local time does not exist because the clocks move forward. Choose another time.',
        past: 'This local time is already in the past. Choose a future date and time.',
      }[result.reason]
      return
    }
    emit('save', result.alarm)
  }
  void close()
}

function remove() {
  emit('remove')
  void close()
}
</script>

<template>
  <section class="alarm-editor" :aria-label="`Alarm for ${cityName}`">
    <p v-if="alarm" class="alarm-summary">{{ summary }}</p>
    <div class="alarm-actions">
      <button
        ref="toggle"
        type="button"
        class="alarm-toggle"
        :aria-expanded="editing"
        :aria-controls="editing ? `${prefix}-form` : undefined"
        @click="beginEdit"
      >
        {{ alarm ? 'Edit alarm' : 'Set alarm' }}
      </button>
      <button v-if="alarm" type="button" class="alarm-remove" @click="remove">Remove alarm</button>
    </div>
    <form v-if="editing" :id="`${prefix}-form`" novalidate @submit.prevent="save">
      <fieldset>
        <legend>{{ cityName }} alarm</legend>
        <p :id="`${prefix}-hint`" class="alarm-hint">
          Local date and time in {{ timeZone }} (HH:mm).
        </p>
        <label :for="`alarm-recurrence-${cityId}`">Recurrence</label>
        <select
          :id="`alarm-recurrence-${cityId}`"
          ref="recurrenceInput"
          v-model="recurrence"
          @change="error = ''"
        >
          <option value="once">One-time</option>
          <option value="daily">Daily</option>
        </select>
        <template v-if="recurrence === 'once'">
          <label :for="`alarm-date-${cityId}`">Local date</label>
          <input
            :id="`alarm-date-${cityId}`"
            v-model="day"
            type="date"
            min="0001-01-01"
            max="9999-12-31"
            required
            :aria-invalid="Boolean(error)"
            :aria-describedby="`${prefix}-hint${error ? ` ${prefix}-error` : ''}`"
            @input="error = ''"
          />
        </template>
        <label :for="`alarm-time-${cityId}`">Local time</label>
        <input
          :id="`alarm-time-${cityId}`"
          v-model="time"
          type="time"
          step="60"
          required
          :aria-invalid="Boolean(error)"
          :aria-describedby="`${prefix}-hint${error ? ` ${prefix}-error` : ''}`"
          @input="error = ''"
        />
        <p v-if="error" :id="`${prefix}-error`" role="alert" class="alarm-error">{{ error }}</p>
        <div class="alarm-actions">
          <button type="submit">Save</button>
          <button type="button" @click="close">Cancel</button>
        </div>
      </fieldset>
    </form>
  </section>
</template>
