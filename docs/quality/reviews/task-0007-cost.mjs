import { readFileSync } from 'node:fs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const require = createRequire(root + 'package.json')
const ts = require('typescript')
const { chromium } = require('playwright')
const code = ts.transpileModule(readFileSync(root + 'src/alarms.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
const domain = await import(pathToFileURL(root + 'src/alarms.ts'))
const catalog = JSON.parse(readFileSync(root + 'src/cityCatalog.json', 'utf8'))
const run = (d, catalog) => {
  const zoneNames = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Asia/Kathmandu',
    'Australia/Adelaide',
    'Pacific/Apia',
    'Pacific/Auckland',
    'Pacific/Pago_Pago',
    'Europe/Warsaw',
    'Africa/Cairo',
    'America/Los_Angeles',
    'America/Sao_Paulo',
  ]
  const cities = zoneNames.map((zone) => catalog.find((city) => city.timeZone === zone))
  if (cities.some((city) => !city)) throw new Error('Unbundled benchmark zone')
  const zones = new Map(cities.map((city) => [city.geonameId, city.timeZone]))
  const alarms = cities.map((city) => ({
    cityId: city.geonameId,
    recurrence: 'daily',
    time: '08:00',
  }))
  const original = Intl.DateTimeFormat.prototype.formatToParts
  let calls = 0
  Intl.DateTimeFormat.prototype.formatToParts = function (...args) {
    calls++
    return original.apply(this, args)
  }
  const results = []
  const end = new Date('2026-09-26T12:00:00Z')
  for (const count of [1, 4, 12]) {
    for (const seconds of [1, 60, 3600, 86400 * 30, 86400 * 365]) {
      const start = new Date(end.getTime() - seconds * 1000)
      const samples = []
      const counts = []
      for (let i = 0; i < 3; i++) {
        calls = 0
        const before = performance.now()
        const result = d.evaluateAlarms(alarms.slice(0, count), zones, start, end)
        samples.push(Number((performance.now() - before).toFixed(2)))
        counts.push(calls)
        if (result.due.length > count) throw new Error('unexpected burst')
      }
      results.push({ count, intervalSeconds: seconds, ms: samples, formatToParts: counts })
    }
  }
  Intl.DateTimeFormat.prototype.formatToParts = original
  return results
}
const nodeReport = { runtime: 'Node', versions: process.versions, results: run(domain, catalog) }
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const output = await page.evaluate(
    async ({ code, runText, catalog }) => {
      const d = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })))
      const run = (0, eval)(`(${runText})`)
      return { runtime: navigator.userAgent, results: run(d, catalog) }
    },
    { code, runText: run.toString(), catalog },
  )
  console.log(JSON.stringify([nodeReport, output], null, 2))
} finally {
  await browser.close()
}
