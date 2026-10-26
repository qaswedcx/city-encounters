/* Development-only browser checks. Requires playwright-core and a local Chromium.
 * Run: CHROMIUM_PATH=/usr/bin/chromium node tests/browser-smoke.cjs
 * Uses no packages in the playable game and closes its HTTP server/browser.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright-core');

const root = path.resolve(__dirname, '..');
const store = 'city-encounters-v1';
const checks = [];
const errors = [];
const externalRequests = [];
const mark = message => { checks.push(message); console.log(`PASS ${message}`); };
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

async function main() {
  await fs.mkdir(path.join(root, 'work'), { recursive: true });
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
      const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const body = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4173, '127.0.0.1', resolve); });
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('favicon')) errors.push(message.text()); });
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('blob:')) externalRequests.push(request.url()); });
    const state = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
    const nav = screen => page.locator(`[data-screen="${screen}"]`).tap();
    const noOverflow = async label => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${label}: horizontal overflow`);
    };
    const fillCharacter = async (name, age) => {
      await page.locator('[name="name"]').fill(name);
      await page.locator('[name="age"]').fill(String(age));
      await page.locator('[name="marital"]').selectOption({ label: '離婚' });
      await page.locator('[name="trait"]').fill('理性沉穩');
      await page.locator('[name="job"]').fill('測試設計師');
      await page.locator('[name="hobby"]').fill('閱讀與散步');
      await page.locator('[name="bio"]').fill('這是一位成年虛構人物。<script>window.injected=true</script>');
      await page.locator('[name="s0"]').selectOption('community');
      await page.locator('[name="s1"]').selectOption('mall');
      await page.locator('[name="s2"]').selectOption('park');
    };
    const importFile = async data => {
      await nav('diary');
      await page.locator('#import-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)) });
      await page.waitForFunction(() => document.querySelector('#import-file').value === '');
    };
    await page.goto('http://127.0.0.1:4173');
    assert.equal((await state()).characters.length,3);
    assert.equal(await page.locator('[data-place]').count(),6);
    for(const width of [320,390,430]){await page.setViewportSize({width,height:844});for(const screen of ['map','people','diary']){await nav(screen);await noOverflow(width+screen);}await nav('people');await page.locator('#btn-add').tap();await noOverflow('editor');await page.locator('#btn-close').tap();}
    mark('three widths, all screens and editor have no overflow');
    await page.locator('#btn-add').tap();await fillCharacter('自訂測試',18);await page.locator('#character-form button[type="submit"]').tap();assert.equal((await state()).characters.length,4);assert.equal(await page.evaluate(()=>Boolean(window.injected)),false);mark('create adult custom character, HTML escaped');
    const custom=(await state()).characters.at(-1);
    await page.locator(`[data-edit="${custom.id}"]`).tap();await page.locator('[name="name"]').fill('已編輯');await page.locator('#character-form button[type="submit"]').tap();assert.equal((await state()).characters.at(-1).name,'已編輯');
    await page.locator('#btn-random').tap();assert.equal((await state()).characters.length,5);const random=(await state()).characters.at(-1);page.once('dialog',d=>d.accept());await page.locator(`[data-delete="${random.id}"]`).tap();assert.equal((await state()).characters.length,4);mark('edit, random and delete');
    // Import a deterministic fixture through the real file UI, not in-memory UI mutation.
    const Core=require('../js/core.js');let fixture=Core.createState();fixture.characters=[Core.normalizeCharacter({...fixture.characters[1],schedule:['community','community','community']})];const c=fixture.characters[0];c.life.work.type='休假';c.life.family.duties=[];Core.prepare(fixture,()=>.9);
    page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact="chat"]').tap();await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,0);await page.reload();await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,1);assert.ok((await state()).characters[0].life.memories.length);mark('multi-round reload resumes, consumes once and remembers');
    const beforeBackup=await state();await nav('diary');const downloadEvent=page.waitForEvent('download');await page.locator('#btn-export').tap();const download=await downloadEvent;const exportPath=path.join(root,'work','browser-export.json');await download.saveAs(exportPath);const backup=JSON.parse(await fs.readFile(exportPath,'utf8'));await page.locator('#backup-done').tap();await nav('map');await page.locator('#btn-wait').tap();page.once('dialog',d=>d.accept());await importFile(backup);assert.deepEqual(await state(),beforeBackup);await page.reload();assert.deepEqual(await state(),beforeBackup);mark('actual JSON download and import round trip');
    const beforeInvalid=await state();await importFile({...backup,characters:[null]});assert.deepEqual(await state(),beforeInvalid);await importFile('{broken');assert.deepEqual(await state(),beforeInvalid);mark('invalid imports cannot overwrite progress');
    for(const [first,second,result] of [[0,0,'success'],[1,null,'not_occurred'],[2,null,'temporary_failure'],[2,null,'permanent_failure']]){fixture=Core.createState();fixture.characters=[Core.normalizeCharacter({...fixture.characters[1],schedule:['community','community','community'],familiarity:70,trust:60})];const person=fixture.characters[0];if(result==='permanent_failure')person.life.events[2].retry=false;person.life.work.type='休假';person.life.family.duties=[];person.life.records={life1:{status:'success',day:1},life2:{status:'success',day:1}};Core.prepare(fixture,()=>.9);page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact="deep"]').tap();await page.locator(`[data-life-choice="${first}"]`).tap();if(second!==null)await page.locator(`[data-life-choice="${second}"]`).tap();assert.equal((await state()).characters[0].life.records.key.status,result);await page.reload();assert.equal((await state()).characters[0].life.records.key.status,result);}
    mark('key success below 100, not occurred and temporary failure through touch UI');
    const corruptContext=await browser.newContext();await corruptContext.addInitScript(()=>localStorage.setItem('city-encounters-v1','{broken original'));const corrupt=await corruptContext.newPage();await corrupt.goto('http://127.0.0.1:4173');await corrupt.locator('[data-place="market"]').click();assert.equal(await corrupt.evaluate(()=>localStorage.getItem('city-encounters-v1')),'{broken original');await corruptContext.close();mark('corrupt local save remains protected during exploration');
    assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);mark('no page errors or external requests');
    await fs.writeFile(path.join(root,'work','browser-results.json'),JSON.stringify({checks,errors,realIPhoneSafari:false},null,2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

