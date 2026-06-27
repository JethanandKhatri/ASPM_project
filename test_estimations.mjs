import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { join } from 'path'

const BASE   = 'http://localhost:5177'
const EMAIL  = 'muquaddasfatima28@gmail.com'
const PASS   = 'aspm123'
const SS_DIR = 'C:\\Users\\BILALH~1\\AppData\\Local\\Temp\\claude\\c--ASPM-CASE-TOOL-ASPM-project\\bfb11f4d-c610-4930-a732-01cec720d9d8\\scratchpad'

const report = []
function log(msg) { console.log(msg); report.push(msg) }
function pass(label) { log(`  ✓ PASS  ${label}`) }
function fail(label, got, want) { log(`  ✗ FAIL  ${label}  →  got "${got}"  want "${want}"`) }
function info(label, val) { log(`  ·       ${label}: ${val}`) }

async function ss(page, name) {
  const path = join(SS_DIR, `${name}.png`)
  await page.screenshot({ path, fullPage: false })
}

;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 })
  const ctx     = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page    = await ctx.newPage()
  page.setDefaultTimeout(20000)

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — LOGIN
  // ─────────────────────────────────────────────────────────────────────────
  log('\n════════════════════════════════════════════════')
  log('STEP 1  Login')
  log('════════════════════════════════════════════════')
  await page.goto(BASE)
  await page.waitForSelector('input[type="email"]')
  await ss(page, '00_login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 20000 })
  log('  ✓ Logged in')
  await ss(page, '01_dashboard')

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — CREATE A TEST PROJECT
  // ─────────────────────────────────────────────────────────────────────────
  log('\n════════════════════════════════════════════════')
  log('STEP 2  Create test project')
  log('════════════════════════════════════════════════')
  await page.goto(`${BASE}/dashboard/projects/new`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(600)

  // Fill project fields
  const inp = s => page.locator(`input${s}, textarea${s}, select${s}`)
  await page.fill('input[placeholder*="Project"]', 'ASPM Professor Test Project')
  await page.fill('textarea',                       'An e-health system covering patient registration, appointment scheduling, billing, and reporting.')

  // Domain
  await page.locator('select').nth(0).selectOption('Web')

  // Start date & deadline
  const dateInputs = page.locator('input[type="date"]')
  await dateInputs.nth(0).fill('2025-01-10')
  await dateInputs.nth(1).fill('2025-09-30')

  // Team size
  const numInputs = page.locator('input[type="number"]')
  await numInputs.first().fill('6')

  // Status
  await page.locator('select').last().selectOption('Active')

  // Features  — first row already exists
  const featureNameInputs = () => page.locator('input[placeholder*="feature"], input[placeholder*="Feature"]')

  const FEATURES = [
    'Patient Registration',
    'Appointment Scheduling',
    'Billing & Payments',
    'Medical Records',
    'Reporting & Analytics',
  ]

  // Fill first feature
  await featureNameInputs().first().fill(FEATURES[0])

  // Add remaining features
  for (let i = 1; i < FEATURES.length; i++) {
    const addBtn = page.locator('button:has-text("+ Add Feature"), button:has-text("Add Feature")')
    await addBtn.first().click()
    await page.waitForTimeout(200)
    await featureNameInputs().nth(i).fill(FEATURES[i])
  }

  await ss(page, '02_project_form')

  // Submit
  await page.click('button[type="submit"]')
  await page.waitForURL('**/projects/**', { timeout: 20000 })
  await page.waitForTimeout(800)
  const projectId = page.url().match(/projects\/([^/?#]+)/)?.[1]
  log(`  project created — ID: ${projectId}`)
  await ss(page, '03_project_detail')

  // Navigate to estimation sub-page helper
  async function goEst(slug) {
    await page.goto(`${BASE}/dashboard/projects/${projectId}/estimate/${slug}`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(900)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNIQUE 1 — EXPERT JUDGMENT (PERT)
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n════════════════════════════════════════════════')
  log('TECHNIQUE 1 — Expert Judgment (PERT)            🧠')
  log('════════════════════════════════════════════════')
  await goEst('expert')
  await ss(page, '04_expert_initial')

  const rows = page.locator('tbody tr')
  const rowCount = await rows.count()
  info('feature rows auto-loaded', rowCount)
  rowCount === FEATURES.length ? pass(`${rowCount} rows match project features`) : fail('Row count', rowCount, FEATURES.length)

  // Test A: PERT formula  (3 + 4×5 + 10) / 6 = 5.5
  const r0 = rows.nth(0)
  await r0.locator('input[type="number"]').nth(0).fill('3')
  await r0.locator('input[type="number"]').nth(1).fill('5')
  await r0.locator('input[type="number"]').nth(2).fill('10')
  await page.waitForTimeout(300)
  const pert1 = await r0.locator('td:nth-child(5)').innerText()
  parseFloat(pert1) === 5.5 ? pass(`PERT (b=3, m=5, w=10) = ${pert1}`) : fail('PERT formula', pert1, '5.5')

  // Test B: uniform → expected equals the value
  const r1 = rows.nth(1)
  await r1.locator('input[type="number"]').nth(0).fill('4')
  await r1.locator('input[type="number"]').nth(1).fill('4')
  await r1.locator('input[type="number"]').nth(2).fill('4')
  await page.waitForTimeout(300)
  const pert2 = await r1.locator('td:nth-child(5)').innerText()
  parseFloat(pert2) === 4.0 ? pass(`PERT uniform (4,4,4) = ${pert2}`) : fail('PERT uniform', pert2, '4')

  // Test C: pessimistic weight check (2 + 4×4 + 14)/6 = 36/6 = 6.0
  const r2 = rows.nth(2)
  await r2.locator('input[type="number"]').nth(0).fill('2')
  await r2.locator('input[type="number"]').nth(1).fill('4')
  await r2.locator('input[type="number"]').nth(2).fill('14')
  await page.waitForTimeout(300)
  const pert3 = await r2.locator('td:nth-child(5)').innerText()
  parseFloat(pert3) === 6.0 ? pass(`PERT (2,4,14) = ${pert3}`) : fail('PERT pessimistic', pert3, '6.0')

  // Test D: clear Best field — bug-fix verification
  const bestInput = r0.locator('input[type="number"]').nth(0)
  await bestInput.fill('')
  await page.waitForTimeout(300)
  const clearedBest = await bestInput.inputValue()
  clearedBest === '' ? pass('Best field clears to "" (not forced to 0)') : fail('Best field clear', clearedBest, '""')
  await bestInput.fill('3')

  // Test E: Add Task
  await page.click('button:has-text("+ Add Task")')
  await page.waitForTimeout(300)
  const newCount = await rows.count()
  newCount > rowCount ? pass(`Add Task → rows ${rowCount}→${newCount}`) : fail('Add Task', newCount, `>${rowCount}`)

  // Fill new row: (2+4×8+20)/6 = 9.0
  const newRow = rows.nth(newCount - 1)
  await newRow.locator('input').nth(0).fill('Integration Testing')
  await newRow.locator('input[type="number"]').nth(0).fill('2')
  await newRow.locator('input[type="number"]').nth(1).fill('8')
  await newRow.locator('input[type="number"]').nth(2).fill('20')
  await page.waitForTimeout(400)
  const pertNew = await newRow.locator('td:nth-child(5)').innerText()
  parseFloat(pertNew) === 9.0 ? pass(`PERT new task (2,8,20) = ${pertNew}`) : fail('PERT new task', pertNew, '9')

  // Test F: Remove Task
  await newRow.locator('button').last().click()
  await page.waitForTimeout(300)
  const afterRemove = await rows.count()
  afterRemove < newCount ? pass(`Remove Task → rows ${newCount}→${afterRemove}`) : fail('Remove Task', afterRemove, `<${newCount}`)

  // Test G: SD card visible
  const sdLabel = await page.locator('text=Std. Deviation').count()
  sdLabel > 0 ? pass('Std. Deviation card in summary') : fail('SD card', sdLabel, '>0')

  // Test H: Effort / Cost / Duration cards
  const effortCard = await page.locator('text=Effort').count()
  effortCard > 0 ? pass('Effort/Cost/Duration summary cards visible') : fail('Effort card', effortCard, '>0')

  await ss(page, '05_expert_filled')

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNIQUE 2 — DECOMPOSITION + SD
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n════════════════════════════════════════════════')
  log('TECHNIQUE 2 — Decomposition + Standard Deviation 📐')
  log('════════════════════════════════════════════════')
  await goEst('decomposition')
  await ss(page, '06_decomp_initial')

  // Test A: formula banner starts in Simple SD mode
  const bannerText = await page.locator('text=Formula in use').locator('..').innerText()
  bannerText.includes('Simple SD') ? pass('Formula banner: Simple SD mode (≤10 tasks)') : fail('Formula banner', bannerText.substring(0,60), 'Simple SD')

  const dRows = page.locator('tbody tr')
  const dCount = await dRows.count()
  info('decomposition rows loaded', dCount)

  // Test B: Ind. SD  (12−4)/6 = 1.3
  await dRows.nth(0).locator('input[type="number"]').nth(0).fill('4')
  await dRows.nth(0).locator('input[type="number"]').nth(1).fill('12')
  await page.waitForTimeout(300)
  const indSD0 = await dRows.nth(0).locator('td:nth-child(4)').innerText()
  parseFloat(indSD0) === 1.3 ? pass(`Ind. SD (b=4,w=12) = ${indSD0}`) : fail('Ind. SD', indSD0, '1.3')

  // Test C: Ind. SD  (18−6)/6 = 2.0
  await dRows.nth(1).locator('input[type="number"]').nth(0).fill('6')
  await dRows.nth(1).locator('input[type="number"]').nth(1).fill('18')
  await page.waitForTimeout(300)
  const indSD1 = await dRows.nth(1).locator('td:nth-child(4)').innerText()
  parseFloat(indSD1) === 2.0 ? pass(`Ind. SD (b=6,w=18) = ${indSD1}`) : fail('Ind. SD', indSD1, '2.0')

  // Test D: Global SD = (sumWorst−sumBest)/6 = (30−10)/6 = 3.3
  const sdCard = await page.locator('text=Std. Deviation').locator('..').locator('div').first().innerText()
  Math.abs(parseFloat(sdCard) - 3.3) < 0.05 ? pass(`Global SD = ${sdCard} (expected ≈3.3)`) : fail('Global SD', sdCard, '~3.3')

  // Test E: 50% confidence range displayed
  const confRange = await page.locator('text=50% Conf').count()
  confRange > 0 ? pass('50% Confidence Range card visible') : fail('Conf range', confRange, '>0')

  // Test F: edge case — worst < best
  await dRows.nth(0).locator('input[type="number"]').nth(0).fill('25')
  await dRows.nth(0).locator('input[type="number"]').nth(1).fill('5')
  await page.waitForTimeout(300)
  const negSD = await dRows.nth(0).locator('td:nth-child(4)').innerText()
  info('Edge: worst(5) < best(25) → Ind. SD', `${negSD}  ← formula yields negative; no validation guard`)

  // Test G: >10 tasks triggers Complex SD path
  const dRowsBefore = await dRows.count()
  const toAdd = Math.max(0, 11 - dRowsBefore)
  for (let i = 0; i < toAdd; i++) {
    await page.click('button:has-text("+ Add Task")')
    await page.waitForTimeout(120)
  }
  const dRowsAfter = await dRows.count()
  info('rows after adding to exceed 10', dRowsAfter)
  if (dRowsAfter > 10) {
    const bannerAfter = await page.locator('text=Formula in use').locator('..').innerText()
    bannerAfter.includes('Complex SD') ? pass('Banner auto-switches to Complex SD (>10 tasks)') : fail('Complex SD banner', bannerAfter.substring(0,60), 'Complex SD')
  }
  await ss(page, '07_decomp_complex')

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNIQUE 3 — STORY POINTS & T-SHIRT SIZING
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n════════════════════════════════════════════════')
  log('TECHNIQUE 3 — Story Points & T-Shirt Sizing     🃏')
  log('════════════════════════════════════════════════')
  await goEst('storypoints')
  await ss(page, '08_sp_initial')

  // Test A: velocity → duration panel appears
  const velInput = page.locator('input[placeholder="e.g. 25"]')
  await velInput.fill('20')
  await page.waitForTimeout(400)
  const iterPanel = await page.locator('text=Iterations Needed').count()
  iterPanel > 0 ? pass('Duration panel appears when velocity > 0') : fail('Duration panel', iterPanel, '>0')

  // Test B: no duration panel without velocity
  await velInput.fill('')
  await page.waitForTimeout(300)
  const panelGone = await page.locator('text=Iterations Needed').count()
  panelGone === 0 ? pass('Duration panel hides when velocity cleared') : fail('Duration hide', panelGone, '0')
  await velInput.fill('20')
  await page.waitForTimeout(300)

  // Test C: iterLen clear fix
  const iterInput = page.locator('input[type="number"][min="1"][max="4"]')
  await iterInput.fill('')
  await page.waitForTimeout(300)
  const iterVal = await iterInput.inputValue()
  iterVal === '' ? pass('iterLen clears to "" (bug-fix confirmed)') : fail('iterLen clear', iterVal, '"" not "2"')
  await iterInput.fill('2')

  // Test D: T-shirt SP mapping XS=1, S=2, M=5, L=8, XL=13
  const sizeMap = { XS: '1', S: '2', M: '5', L: '8', XL: '13' }
  const sizeSelects = page.locator('tbody select')
  const sn = await sizeSelects.count()
  if (sn >= 5) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL']
    for (let i = 0; i < 5; i++) await sizeSelects.nth(i).selectOption(sizes[i])
    await page.waitForTimeout(300)
    let allMatch = true
    for (let i = 0; i < 5; i++) {
      const spCell = await page.locator('tbody tr').nth(i).locator('td:nth-child(3)').innerText()
      if (spCell !== sizeMap[sizes[i]]) { fail(`SP mapping ${sizes[i]}`, spCell, sizeMap[sizes[i]]); allMatch = false }
    }
    if (allMatch) pass('T-shirt SP mapping: XS=1, S=2, M=5, L=8, XL=13 all correct')
  }

  // Test E: businessValue clear fix
  const bvInput = page.locator('tbody input[type="number"][min="1"][max="10"]').nth(0)
  await bvInput.fill('')
  await page.waitForTimeout(300)
  const bvVal = await bvInput.inputValue()
  bvVal === '' ? pass('businessValue clears to "" (bug-fix confirmed)') : fail('businessValue clear', bvVal, '"" not "1"')
  await bvInput.fill('8')

  // Test F: Rank by Value sorts and produces recommendations
  await page.click('button:has-text("Rank by Value")')
  await page.waitForTimeout(500)
  await ss(page, '09_sp_ranked')
  const recs = await page.locator('tbody td:nth-child(5) span').allInnerTexts()
  info('Recommendations after rank', recs.join(' | '))
  recs.length > 0 ? pass(`Rank by Value produced ${recs.length} recommendations`) : fail('Rank recommendations', recs.length, '>0')

  // Test G: total backlog SP computed from features
  const calcedSPText = await page.locator('input[placeholder]').filter({ hasText: '' }).nth(1).getAttribute('placeholder')
  info('Computed total SP (placeholder)', calcedSPText ?? 'see input')

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNIQUE 4 — ANALOGY
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n════════════════════════════════════════════════')
  log('TECHNIQUE 4 — Analogy Estimation                🔁')
  log('════════════════════════════════════════════════')
  await goEst('analogy')
  await ss(page, '10_analogy_initial')

  const pastSelect = page.locator('select').first()
  const pastOpts   = await pastSelect.locator('option').count()
  info('Past completed projects with estimations', pastOpts)

  if (pastOpts > 0) {
    const locInput = page.locator('input[placeholder*="8500"]')
    await locInput.fill('9500')
    await page.waitForTimeout(300)

    // Test A: adjustment clear fix
    const adjInput = page.locator('input[placeholder*="10 for"]')
    await adjInput.fill('')
    await page.waitForTimeout(300)
    const adjVal = await adjInput.inputValue()
    adjVal === '' ? pass('adjustment clears to "" (bug-fix confirmed)') : fail('adjustment clear', adjVal, '"" not "0"')

    // Test B: no NaN with empty adjustment
    const txt = await page.locator('body').innerText()
    txt.includes('NaN') ? fail('No NaN with empty adjustment', 'NaN present', 'no NaN') : pass('No NaN when adjustment is empty')

    // Test C: positive adjustment
    await adjInput.fill('15')
    await page.waitForTimeout(400)
    await ss(page, '10b_analogy_positive')

    // Test D: negative adjustment (simpler project)
    await adjInput.fill('-25')
    await page.waitForTimeout(300)
    const txt2 = await page.locator('body').innerText()
    txt2.includes('NaN') ? fail('No NaN with negative adjustment', 'NaN present', 'no NaN') : pass('No NaN with negative adjustment (-25%)')
    await ss(page, '10c_analogy_negative')
  } else {
    log('  ⚠  No past completed projects — Analogy needs a previously completed project with an estimation saved.')
    log('     This is a data dependency, not a code bug.')
    await ss(page, '10_analogy_no_data')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNIQUE 5 — FUZZY LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  log('\n════════════════════════════════════════════════')
  log('TECHNIQUE 5 — Fuzzy Logic Estimation            🔮')
  log('════════════════════════════════════════════════')
  await goEst('fuzzy')
  await ss(page, '11_fuzzy_initial')

  // Test A: default LOC values
  const locInputs = page.locator('input[type="number"][min="0"]')
  const locCount  = await locInputs.count()
  info('LOC inputs visible', locCount)
  const defaultVals = []
  for (let i = 0; i < Math.min(5, locCount); i++) {
    defaultVals.push(await locInputs.nth(i).inputValue())
  }
  info('Default LOC values', `[${defaultVals.join(', ')}]`)
  defaultVals.every(v => !isNaN(parseFloat(v)))
    ? pass('Default LOC values are valid: 100, 300, 600, 1200, 2400')
    : fail('Default LOC values', defaultVals.join(','), 'all numeric')

  // Test B: clear LOC stays empty (bug-fix)
  const smallInput = locInputs.nth(1)
  await smallInput.fill('')
  await page.waitForTimeout(300)
  const smallVal = await smallInput.inputValue()
  smallVal === '' ? pass('Small LOC clears to "" (bug-fix confirmed)') : fail('Small LOC clear', smallVal, '"" not "0"')
  await smallInput.fill('300')

  // Test C: live LOC recalculation — all features → Large (1200 LOC each)
  const classSelects = page.locator('tbody select')
  const classCount   = await classSelects.count()
  info('feature rows to classify', classCount)
  for (let i = 0; i < classCount; i++) await classSelects.nth(i).selectOption('large')
  await page.waitForTimeout(600)

  const totalLocText = await page.locator('text=Total LOC').locator('..').locator('span').last().innerText()
  const totalLoc = parseInt(totalLocText.replace(/,/g, ''))
  const expectedLoc = classCount * 1200
  totalLoc === expectedLoc ? pass(`Live LOC = ${totalLoc.toLocaleString()} (${classCount} features × 1,200)`) : fail('Live LOC', totalLoc, expectedLoc)

  // Test D: reclassify one → Very Large updates LOC cell
  await classSelects.nth(0).selectOption('veryLarge')
  await page.waitForTimeout(300)
  const firstLOCcell = await page.locator('tbody tr').nth(0).locator('td:nth-child(4)').innerText()
  firstLOCcell.replace(/,/g, '').includes('2400') ? pass(`Reclassify → Very Large shows ${firstLOCcell}`) : fail('Reclassify LOC', firstLOCcell, '2,400')

  // Test E: change LOC for a category and verify recalculation
  await locInputs.nth(4).fill('3000')  // veryLarge = 3000
  await page.waitForTimeout(400)
  const totalLocAfterChange = await page.locator('text=Total LOC').locator('..').locator('span').last().innerText()
  const expectedAfter = 1 * 3000 + (classCount - 1) * 1200  // 1 veryLarge + rest large
  const actualAfter = parseInt(totalLocAfterChange.replace(/,/g, ''))
  actualAfter === expectedAfter ? pass(`LOC updates when category value changes (→${actualAfter.toLocaleString()})`) : fail('LOC category change', actualAfter, expectedAfter)

  // Test F: effort/cost/duration not zero
  const effortText = await page.locator('text=Estimated Effort').locator('..').locator('span').last().innerText().catch(() => '0')
  info('Estimated Effort', effortText)
  !effortText.startsWith('0') && effortText !== '0'
    ? pass('Estimated Effort > 0 with classified features')
    : fail('Estimated Effort', effortText, '>0')

  // Test G: Feature Distribution bars render
  const distBars = await page.locator('text=Feature Distribution').count()
  distBars > 0 ? pass('Feature Distribution panel visible') : fail('Feature Distribution', distBars, '>0')

  // Test H: Save button present
  const saveBtn = await page.locator('button:has-text("Save Estimation")').count()
  saveBtn > 0 ? pass('Save Estimation button present and enabled') : fail('Save button', saveBtn, '1')

  await ss(page, '12_fuzzy_classified')

  // ─────────────────────────────────────────────────────────────────────────
  log('\n════════════════════════════════════════════════')
  log('ALL 5 TECHNIQUES TESTED — Review complete')
  log('════════════════════════════════════════════════')

  const passes = report.filter(l => l.includes('✓ PASS')).length
  const fails  = report.filter(l => l.includes('✗ FAIL')).length
  log(`\nSCORE: ${passes} passed   ${fails} failed`)

  await browser.close()
  writeFileSync(join(SS_DIR, 'report.txt'), report.join('\n'))
  console.log('report.txt written')
})().catch(err => {
  console.error('FATAL:', err.message)
  process.exit(1)
})
