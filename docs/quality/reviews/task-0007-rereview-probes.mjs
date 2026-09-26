// Independent finding-focused probes. No application source or tests are modified.
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../../', import.meta.url))
const require = createRequire(root + 'package.json')
const ts = require('typescript')
const { chromium } = require('playwright')
const code = ts.transpileModule(readFileSync(root + 'src/alarms.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
const d = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
const catalog = JSON.parse(readFileSync(root + 'src/cityCatalog.json', 'utf8'))
function probe(d, catalog) {
  let checks = 0
  const assert = (condition, message) => { checks++; if (!condition) throw new Error(message) }
  const equal = (a, b, message) => assert(JSON.stringify(a) === JSON.stringify(b), message)
  const names = ['America/New_York','Europe/London','Asia/Tokyo','Asia/Kathmandu','Australia/Adelaide','Pacific/Apia','Pacific/Auckland','Pacific/Pago_Pago','Europe/Warsaw','Africa/Cairo','America/Los_Angeles','America/Sao_Paulo']
  const cities = names.map(zone => catalog.find(c => c.timeZone === zone))
  assert(cities.every(Boolean), 'all measured cities bundled')
  const zones = new Map(cities.map(c => [c.geonameId, c.timeZone]))
  const alarms = cities.map(c => ({cityId:c.geonameId, recurrence:'daily',time:'08:00'}))
  const original = Intl.DateTimeFormat.prototype.formatToParts
  let calls = 0
  Intl.DateTimeFormat.prototype.formatToParts = function(...args) { calls++; return original.apply(this,args) }
  const work = []
  function measure(label, e, a, z, p, c) {
    calls = 0
    const before = performance.now()
    const result = e.evaluate(a,z,new Date(p),new Date(c))
    const count = calls
    const ms = +(performance.now()-before).toFixed(3)
    // Oracle runs AFTER capturing native work; it cannot populate the evaluator's private cache.
    equal(result, d.evaluateAlarms(a,z,new Date(p),new Date(c)), label+' stateless parity')
    work.push({label,calls:count,ms,due:result.due.map(x=>({cityId:x.alarm.cityId,instant:x.instant}))})
    return count
  }
  const p='2026-09-26T11:59:59Z', c='2026-09-26T12:00:00Z'
  try {
    for (const [i,n] of [1,4,12].entries()) {
      const a=alarms.slice(0,n), e=d.createAlarmEvaluator()
      assert(measure(`${n} cold`,e,a,zones,p,c)===[5762,31691,100835][i], 'cold exhaustive count')
      assert(measure(`${n} warm`,e,a.map(x=>({...x})),zones,p,c)===0,'warm object-independent reuse')
      measure(`${n} adjacent`,e,a,zones,c,'2026-09-26T12:00:01Z')
      assert(measure(`${n} established adjacent`,e,a,zones,'2026-09-26T12:00:01Z','2026-09-26T12:00:02Z')===0,'adjacent reuse')
      assert(measure(`${n} rollover`,e,a,zones,'2026-09-27T11:59:59Z','2026-09-27T12:00:00Z')===n*2881,'one new date per alarm')
      assert(measure(`${n} rollover warm`,e,a,zones,'2026-09-27T11:59:59Z','2026-09-27T12:00:00Z')===0,'new date established')
      const edit=a.map((x,i)=>i===0?{...x,time:'08:01'}:x)
      assert(measure(`${n} time edit`,e,edit,zones,p,c)>0,'edit new key')
      assert(measure(`${n} time edit warm`,e,edit,zones,p,c)===0,'edit established')
      const z=new Map(zones); z.set(a[0].cityId,'Europe/Paris')
      assert(measure(`${n} zone edit`,e,a,z,p,c)>0,'zone new key')
      assert(measure(`${n} zone edit warm`,e,a,z,p,c)===0,'zone established')
      const delayed=d.createAlarmEvaluator()
      measure(`${n} 30-day cold`,delayed,a,zones,'2026-08-27T12:00:00Z',c)
      assert(measure(`${n} 30-day warm`,delayed,a,zones,'2026-08-27T12:00:00Z',c)===0,'delayed reuse')
      measure(`${n} resume adjacent`,delayed,a,zones,c,'2026-09-26T12:00:01Z')
      assert(measure(`${n} resume established`,delayed,a,zones,'2026-09-26T12:00:01Z','2026-09-26T12:00:02Z')===0,'resume established')
    }
    // Observe every Map insertion while exercising the public API, without exposing/changing cache contents.
    const NativeMap=globalThis.Map, observed=[]
    globalThis.Map=class extends NativeMap {
      set(k,v) { const result=super.set(k,v); if(typeof k==='string' && k.startsWith('["')) observed.push(this.size); return result }
    }
    let maxSize
    try {
      const e=d.createAlarmEvaluator(), z=new NativeMap([[1,'UTC']])
      for(let i=0;i<45;i++) measure('FIFO fill '+i,e,[{cityId:1,recurrence:'daily',time:`08:${String(i).padStart(2,'0')}`}],z,p,c)
      maxSize=Math.max(...observed)
      assert(maxSize===128,'cache exact maximum 128 including every insertion')
      const a=[{cityId:1,recurrence:'daily',time:'08:00'}]
      assert(measure('FIFO evicted recomputation',e,a,z,p,c)===8643,'oldest three keys evicted')
      assert(measure('FIFO recomputed warm',e,a,z,p,c)===0,'eviction output stable and recached')
      assert(measure('independent instance',d.createAlarmEvaluator(),a,z,p,c)===8643,'private instance state')
      const other=[{...a[0],cityId:2}]
      assert(measure('identical semantics other city',e,other,new NativeMap([[2,'UTC']]),p,c)===0,'city not identity')
    } finally { globalThis.Map=NativeMap }
    const scenarios=[
      ['gap','America/New_York','02:30','2026-03-08T05:00:00Z','2026-03-09T03:00:00Z',[]],
      ['overlap first','America/New_York','01:30','2026-11-01T05:00:00Z','2026-11-01T07:00:00Z',['2026-11-01T05:30:00.000Z']],
      ['overlap second','America/New_York','01:30','2026-11-01T05:30:00Z','2026-11-01T06:30:00Z',[]],
      ['inclusive','UTC','12:00',p,c,['2026-09-26T12:00:00.000Z']],
      ['exclusive','UTC','12:00',c,'2026-09-26T12:01:00Z',[]],
    ]
    for(const [label,zone,time,start,end,expected] of scenarios) {
      const a=[{cityId:1,recurrence:'daily',time}],z=new Map([[1,zone]]),e=d.createAlarmEvaluator()
      measure(label+' cold',e,a,z,start,end)
      equal(e.evaluate(a,z,new Date(start),new Date(end)).due.map(x=>x.instant),expected,label+' independent expected')
      assert(measure(label+' warm',e,a,z,start,end)===0,label+' cached even undefined gap')
    }
    const endpoints=[]
    const nativeFields=(zone,instant)=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone,calendar:'gregory',numberingSystem:'latn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',era:'short'}).formatToParts(new Date(instant)).map(x=>[x.type,x.value]))
    for (const [zone,day,time,instant,now,reason] of [
      ['America/New_York','9999-12-31','23:59','+010000-01-01T04:59:00.000Z','2026-01-01T00:00:00Z','range'],
      ['Europe/Warsaw','0001-01-01','00:00','0000-12-31T22:36:00.000Z','0000-12-30T00:00:00Z','range'],
      ['UTC','0001-01-01','00:00','0001-01-01T00:00:00.000Z','0000-12-31T23:59:00Z',null],
      ['UTC','9999-12-31','23:59','9999-12-31T23:59:00.000Z','9999-12-31T23:58:00Z',null],
    ]) {
      const fields=nativeFields(zone,instant)
      equal(`${fields.year.padStart(4,'0')}-${fields.month}-${fields.day} ${fields.hour}:${fields.minute}:${fields.second} ${fields.era}`,`${day} ${time}:00 AD`,'actual native match separate from domain')
      const candidates=d.resolveCivilMinute(zone,day,time)
      assert(candidates.includes(instant),'resolver retains real endpoint')
      const configured=d.configureOnce(1,zone,day,time,new Date(now))
      equal(configured,reason?{ok:false,reason}:{ok:true,alarm:{cityId:1,recurrence:'once',instant}},'endpoint classification')
      equal(d.configureOnce(1,zone,day,time,new Date(instant)),{ok:false,reason:'past'},'endpoint equality is past')
      equal(d.isCanonicalInstant(instant),!reason,'representation independent from match')
      endpoints.push({zone,day,time,instant,fields,candidates,configured})
    }
    equal(d.configureOnce(1,'America/New_York','2026-03-08','02:30',new Date('2026-01-01T00:00Z')),{ok:false,reason:'nonexistent'},'real gap')
    for(const [now,selected] of [['2026-11-01T05:00Z','2026-11-01T05:30:00.000Z'],['2026-11-01T05:30Z','2026-11-01T06:30:00.000Z']]) {
      equal(d.configureOnce(1,'America/New_York','2026-11-01','01:30',new Date(now)),{ok:true,alarm:{cityId:1,recurrence:'once',instant:selected}},'strict future overlap')
    }
    for(const s of ['+010000-01-01T04:59:00.000Z','0000-12-31T22:36:00.000Z','2026-01-01T01:00:00.000+01:00','2026-01-01T00:00:01.000Z','2026-01-01T00:00:00Z']) assert(!d.isCanonicalInstant(s),'V3 syntax unchanged')
    const mixed=[{cityId:2,recurrence:'once',instant:'2026-09-26T11:00:00.000Z'},{cityId:1,recurrence:'daily',time:'08:00'}]
    const mixedZones=new Map([[1,'UTC']]), mixedEvaluator=d.createAlarmEvaluator()
    const mixedResult=mixedEvaluator.evaluate(mixed,mixedZones,new Date('2026-08-01T00:00Z'),new Date(c))
    equal(mixedResult.due.map(x=>[x.alarm.cityId,x.instant]),[[2,'2026-09-26T11:00:00.000Z'],[1,'2026-09-26T08:00:00.000Z']],'mixed stable order/latest once per alarm')
    equal(mixedResult.nextAlarms,[mixed[1]],'once consumption/daily retention')
    for(const [start,end] of [['bad',c],[c,p]]) {
      let rejected=false
      try { mixedEvaluator.evaluate([],mixedZones,new Date(start),new Date(end)) } catch(e) { rejected=e instanceof RangeError }
      assert(rejected,'invalid/reversed rejection')
    }
    equal(d.configureOnce(1,'UTC','2026-02-30','08:00',new Date(c)),{ok:false,reason:'invalid'},'malformed civil input')
    // Controlled Intl overlap fixture isolates selection order across the representation boundary.
    // This is NOT evidence of an actual IANA overlap at the year endpoint.
    const countingFormatter=Intl.DateTimeFormat.prototype.formatToParts
    const syntheticCandidates=['0000-12-31T23:00:00.000Z','0001-01-01T00:00:00.000Z','0001-01-01T01:00:00.000Z']
    try {
      Intl.DateTimeFormat.prototype.formatToParts=function(value) {
        const iso=new Date(value).toISOString()
        return Object.entries({year:'1',month:'01',day:'01',hour:'00',minute:'00',second:'00',era:syntheticCandidates.includes(iso)?'AD':'BC'}).map(([type,value])=>({type,value}))
      }
      equal(d.resolveCivilMinute('UTC','0001-01-01','00:00'),syntheticCandidates,'mixed synthetic resolver candidates')
      for(const [now,instant] of [['0000-12-31T22:00:00Z',syntheticCandidates[1]],[syntheticCandidates[1],syntheticCandidates[2]]]) {
        equal(d.configureOnce(1,'UTC','0001-01-01','00:00',new Date(now)),{ok:true,alarm:{cityId:1,recurrence:'once',instant}},'earliest representable strictly future mixed candidate')
      }
      equal(d.configureOnce(1,'UTC','0001-01-01','00:00',new Date(syntheticCandidates[2])),{ok:false,reason:'past'},'all mixed candidates passed')
    } finally { Intl.DateTimeFormat.prototype.formatToParts=countingFormatter }
    return {checks,maxCacheSize:maxSize,work,endpoints,syntheticSelectionChecks:4}
  } finally { Intl.DateTimeFormat.prototype.formatToParts=original }
}
const node={runtime:'Node',versions:process.versions,...probe(d,catalog)}
const browser=await chromium.launch({headless:true})
let browserResult
try {
 const page=await browser.newPage()
 browserResult=await page.evaluate(async ({code,catalog,probeText})=>{
  const d=await import(URL.createObjectURL(new Blob([code],{type:'text/javascript'})))
  return {runtime:navigator.userAgent,...(0,eval)(`(${probeText})`)(d,catalog)}
 },{code,catalog,probeText:probe.toString()})
} finally { await browser.close() }
const domainUrl='data:text/javascript;base64,'+Buffer.from(code).toString('base64')
const configCode=ts.transpileModule(readFileSync(root+'src/config.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace("from './alarms'", 'from '+JSON.stringify(domainUrl))
const config=await import('data:text/javascript;base64,'+Buffer.from(configCode).toString('base64'))
const rejectedInstants=['+010000-01-01T04:59:00.000Z','0000-12-31T22:36:00.000Z','2026-01-01T01:00:00.000+01:00','2026-01-01T00:00:01.000Z','2026-01-01T00:00:00Z']
let persistenceChecks=0
for(const instant of rejectedInstants) {
 const value={...config.defaultConfig(),selectedCityIds:[1],alarms:[{cityId:1,recurrence:'once',instant}]}
 let writes=0
 if(config.parseConfig(JSON.stringify(value),new Set([1])).status!=='invalid') throw new Error('persisted range syntax accepted')
 if(config.saveConfig({setItem(){writes++}},value,new Set([1])) || writes) throw new Error('invalid persisted once written')
 persistenceChecks+=2
}
node.persistence={checks:persistenceChecks,rejectedInstants}
const results=[node,browserResult]
writeFileSync(root+'docs/quality/reviews/task-0007-rereview-results.json',JSON.stringify(results,null,2)+'\n')
for(const r of results) console.log(JSON.stringify({runtime:r.runtime,checks:r.checks,maxCacheSize:r.maxCacheSize,work:r.work.filter(x=>!x.label.startsWith('FIFO fill')),endpoints:r.endpoints},null,2))
