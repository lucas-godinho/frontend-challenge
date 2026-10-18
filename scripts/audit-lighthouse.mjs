import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { platform, release, cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const option = (name, fallback) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback
const profiles = option('profile', 'all') === 'all' ? ['mobile', 'desktop'] : [option('profile')]
const pages = { home: '/', detail: '/nft/orbital-01' }
const pageNames = option('page', 'all') === 'all' ? Object.keys(pages) : [option('page')]
const runs = Number(option('runs', '3'))
if (profiles.some((profile) => !['mobile', 'desktop'].includes(profile))
  || pageNames.some((page) => !(page in pages)) || !Number.isInteger(runs) || runs < 1) {
  throw new Error('Use --profile=mobile|desktop|all --page=home|detail|all --runs=3')
}

async function freePort() {
  const server = createServer()
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise((resolve) => server.close(resolve))
  return port
}

const previewPort = await freePort()
const baseURL = `http://127.0.0.1:${previewPort}`
const preview = spawn(process.execPath, [join(dirname(require.resolve('vite/package.json')), 'bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'], { cwd: root, stdio: 'pipe', windowsHide: true })
let previewError = ''
preview.stderr.on('data', (chunk) => { previewError += chunk })
preview.on('error', (error) => { previewError += error.message })
const outputDir = fileURLToPath(new URL(`../artifacts/lighthouse/validated/${new Date().toISOString().replaceAll(':', '-')}/`, import.meta.url))
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const measurements = []
try {
  for (let attempt = 0; ; attempt++) {
    if (preview.exitCode !== null || attempt > 100) throw new Error(`Preview unavailable: ${previewError}`)
    try { if ((await fetch(baseURL)).ok) break } catch { /* Wait for the owned preview server. */ }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  await mkdir(outputDir, { recursive: true })
  for (const profile of profiles) {
    const config = require(`../lighthouserc${profile === 'mobile' ? '.mobile' : ''}.cjs`)
    const settings = { ...config.ci.collect.settings }
    delete settings.chromeFlags
    delete settings.preset
    for (const name of pageNames) {
      for (let run = 1; run <= runs; run++) {
        const port = await freePort()
        const browser = await chromium.launch({
          executablePath: process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
          headless: true,
          args: [`--remote-debugging-port=${port}`, '--disable-extensions'],
        })
        try {
          const result = await lighthouse(`${baseURL}${pages[name]}`, {
            ...settings, port, logLevel: 'error', output: ['html', 'json'],
            screenEmulation: profile === 'mobile'
              ? { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false }
              : { mobile: false, width: 1440, height: 1000, deviceScaleFactor: 1, disabled: false },
          }, profile === 'desktop' ? desktopConfig : undefined)
          if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message ?? 'No Lighthouse result')
          const { lhr } = result
          const prefix = `${outputDir}/${name}-${profile}-${run}`
          await writeFile(`${prefix}.html`, result.report[0])
          await writeFile(`${prefix}.json`, result.report[1])
          const measurement = {
            page: name, profile, run, lighthouseVersion: lhr.lighthouseVersion,
            fetchTime: lhr.fetchTime, userAgent: lhr.userAgent, environment: lhr.environment,
            scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)])),
            metrics: Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map((id) => [id, lhr.audits[id].numericValue])),
          }
          measurements.push(measurement)
          console.log(`${name} ${profile} ${run}/${runs}: ${JSON.stringify(measurement.scores)} LCP=${Math.round(measurement.metrics['largest-contentful-paint'])} TBT=${Math.round(measurement.metrics['total-blocking-time'])}`)
        } finally {
          // Playwright owns Chrome and closes it through CDP, avoiding the
          // chrome-launcher/taskkill hang observed on this Windows host.
          await browser.close()
        }
      }
    }
  }
  const medians = profiles.flatMap((profile) => pageNames.map((page) => {
    const group = measurements.filter((item) => item.profile === profile && item.page === page)
    return {
      page, profile, runs: group.length,
      scores: Object.fromEntries(Object.keys(group[0].scores).map((id) => [id, median(group.map((item) => item.scores[id]))])),
      metrics: Object.fromEntries(Object.keys(group[0].metrics).map((id) => [id, median(group.map((item) => item.metrics[id]))])),
    }
  }))
  const targets = { performance: 95, accessibility: 95, 'best-practices': 95, seo: 90 }
  const passes = runs >= 3 && medians.every((item) => Object.entries(targets).every(([id, target]) => item.scores[id] >= target))
  await writeFile(`${outputDir}/summary.json`, JSON.stringify({ generatedAt: new Date().toISOString(), host: { platform: platform(), release: release(), cpu: cpus()[0]?.model, node: process.version }, targets, passes, medians, measurements }, null, 2))
  console.log(`Reports: ${outputDir}`)
  console.table(medians.map(({ page, profile, scores }) => ({ page, profile, ...scores })))
  if (!passes) process.exitCode = 1
} finally {
  preview.kill()
}
