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
    await page.locator('[data-place="market"]').waitFor();
    assert.equal((await state()).characters.length, 3);
    assert.equal(await page.locator('[data-place]').count(), 6);
    await page.locator('[data-place="market"]').tap();
    assert.match(await page.locator('#encounters').innerText(), /林若晴/);
    mark('初始三位成年人物、六地點與早上市場行程');

    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      for (const screen of ['map', 'people', 'diary']) { await nav(screen); await noOverflow(`${width}px ${screen}`); }
      await nav('people');
      await page.locator('#btn-add').tap();
      await noOverflow(`${width}px editor`);
      await page.locator('#btn-close').tap();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    mark('320、390、430 px 直式三分頁與人物表單無橫向溢出');

    await page.locator('#btn-add').tap();
    const originalName = '測試 <新人物>';
    await fillCharacter(originalName, 17);
    await page.locator('#character-form button[type="submit"]').tap();
    assert.equal((await state()).characters.length, 3);
    assert.equal(await page.locator('#character-form').count(), 1);
    await page.locator('[name="age"]').fill('18');
    await page.locator('#character-form button[type="submit"]').tap();
    assert.equal((await state()).characters.length, 4);
    const custom = (await state()).characters.find(c => c.name === originalName);
    assert.ok(custom);
    assert.equal(custom.age, 18);
    assert.equal(custom.marital, '離婚');
    assert.deepEqual(custom.schedule, ['community', 'mall', 'park']);
    assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
    mark('手動新增驗證成年年齡、欄位與三段行程，文字正確轉義');

    await page.locator(`[data-edit="${custom.id}"]`).tap();
    await page.locator('[name="name"]').fill('測試人物已編輯');
    await page.locator('[name="job"]').fill('測試圖書館員');
    await page.locator('#character-form button[type="submit"]').tap();
    const edited = (await state()).characters.find(c => c.id === custom.id);
    assert.equal(edited.name, '測試人物已編輯');
    assert.equal(edited.job, '測試圖書館員');
    assert.equal(edited.familiarity, custom.familiarity);
    mark('人物編輯保留 ID 與關係數值');

    await page.locator('#btn-random').tap();
    assert.equal((await state()).characters.length, 5);
    const random = (await state()).characters.at(-1);
    assert.ok(random && Number.isInteger(random.age) && random.age >= 18);
    assert.equal(random.schedule.length, 3);
    await page.locator(`[data-edit="${random.id}"]`).tap();
    await page.locator('[name="name"]').fill('隨機後修改');
    await page.locator('#character-form button[type="submit"]').tap();
    assert.equal((await state()).characters.find(c => c.id === random.id).name, '隨機後修改');
    page.once('dialog', dialog => dialog.accept());
    await page.locator(`[data-delete="${random.id}"]`).tap();
    assert.equal((await state()).characters.length, 4);
    mark('隨機生成成年人物、生成後編輯與刪除');

    await nav('map');
    const places = ['community', 'market', 'mall', 'cafe', 'park', 'library'];
    for (let slot = 0; slot < 3; slot++) {
      for (const location of places) {
        await page.locator(`[data-place="${location}"]`).tap();
        const current = await state();
        assert.equal(current.slot, slot);
        const expected = current.characters.filter(c => c.schedule[slot] === location).map(c => c.id).sort();
        const actual = await page.locator('#encounters [data-interact="greet"]').evaluateAll(nodes => nodes.map(n => n.dataset.id).sort());
        assert.deepEqual(actual, expected, `slot ${slot}, ${location}`);
      }
      await page.locator('#btn-wait').tap();
    }
    assert.equal((await state()).day, 2);
    assert.equal((await state()).slot, 0);
    mark('六地點 × 早午晚依行程顯示人物，晚上前進隔天早上');

    await page.locator('[data-place="community"]').tap();
    const beforeTalk = await state();
    await page.locator(`[data-interact="greet"][data-id="${custom.id}"]`).tap();
    if ((await state()).slot === beforeTalk.slot) {
      const confirmChoice = page.locator('[data-approach="respectful"], [data-choice="respectful"], #confirm-interaction');
      if (await confirmChoice.count()) await confirmChoice.first().tap();
    }
    const afterTalk = await state();
    assert.equal(afterTalk.slot, 1);
    assert.equal(afterTalk.day, beforeTalk.day);
    assert.ok(afterTalk.characters.find(c => c.id === custom.id).familiarity > beforeTalk.characters.find(c => c.id === custom.id).familiarity);
    assert.ok(afterTalk.logs.length > beforeTalk.logs.length);
    await page.locator('#btn-close').tap();
    await page.reload();
    assert.deepEqual(await state(), afterTalk);
    mark('觸控互動更新關係與日誌、僅推進一時段，重新整理保留進度');

    await page.locator('[data-place="mall"]').tap();
    const beforeCancel = await state();
    await page.locator(`[data-interact="deep"][data-id="${custom.id}"]`).tap();
    await page.locator('#cancel-talk').tap();
    assert.deepEqual(await state(), beforeCancel);
    await page.locator(`[data-interact="deep"][data-id="${custom.id}"]`).tap();
    await page.locator('[data-approach="respectful"]').tap();
    assert.equal((await state()).slot, 2);
    assert.ok((await state()).characters.find(c => c.id === custom.id).trust < beforeCancel.characters.find(c => c.id === custom.id).trust);
    assert.match(await page.locator('.dialogue').innerText(), /還不太熟/);
    await page.locator('#dialogue-done').tap();
    await page.locator('[data-place="cafe"]').tap();
    const beforeIntrusive = await state();
    const outgoing = beforeIntrusive.characters.find(c => c.name === '陳芷妍');
    await page.locator(`[data-interact="deep"][data-id="${outgoing.id}"]`).tap();
    await page.locator('[data-approach="intrusive"]').tap();
    assert.ok((await state()).characters.find(c => c.id === outgoing.id).trust < outgoing.trust);
    assert.equal((await state()).day, 3);
    assert.equal((await state()).slot, 0);
    await page.locator('#dialogue-done').tap();
    await page.locator('[data-place="park"]').tap();
    const beforeChat = await state();
    await page.locator(`[data-interact="chat"][data-id="${outgoing.id}"]`).tap();
    assert.equal((await state()).slot, 1);
    assert.ok((await state()).characters.find(c => c.id === outgoing.id).trust > beforeChat.characters.find(c => c.id === outgoing.id).trust);
    await page.locator('#dialogue-done').tap();
    mark('深入交流可取消且不耗時，過早與追問會扣分，聊天可修復關係');

    const beforeBackup = await state();
    await nav('diary');
    const downloadEvent = page.waitForEvent('download');
    await page.locator('#btn-export').tap();
    const download = await downloadEvent;
    const exportPath = path.join(root, 'work', 'browser-export.json');
    await download.saveAs(exportPath);
    const backup = JSON.parse(await fs.readFile(exportPath, 'utf8'));
    assert.equal(backup.day, beforeBackup.day);
    assert.deepEqual(backup.characters, beforeBackup.characters);
    await page.locator('#backup-done').tap();
    await nav('map');
    await page.locator('#btn-wait').tap();
    page.once('dialog', dialog => dialog.accept());
    await importFile(backup);
    await page.waitForFunction(({ key, slot }) => JSON.parse(localStorage.getItem(key)).slot === slot, { key: store, slot: backup.slot });
    assert.equal((await state()).slot, backup.slot);
    assert.deepEqual((await state()).characters, backup.characters);
    await page.reload();
    assert.deepEqual((await state()).characters, backup.characters);
    mark('真實下載 JSON，匯入還原人物、時間與關係並可重新整理');

    const beforeInvalid = await state();
    await importFile({ ...backup, characters: [null] });
    await page.locator('#toast').filter({ hasText: /匯入失敗/ }).waitFor({ state: 'visible' });
    assert.deepEqual(await state(), beforeInvalid);
    await importFile('{broken');
    await page.locator('#toast').filter({ hasText: /匯入失敗/ }).waitFor({ state: 'visible' });
    assert.deepEqual(await state(), beforeInvalid);
    mark('錯誤結構與損壞 JSON 不覆寫目前進度');

    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#btn-reset').tap();
    assert.deepEqual(await state(), beforeInvalid);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#btn-reset').tap();
    const fresh = await state();
    assert.equal(fresh.day, 1);
    assert.equal(fresh.slot, 0);
    assert.equal(fresh.characters.length, 3);
    assert.ok(!fresh.characters.some(c => c.id === custom.id));
    mark('開始新遊戲取消保留進度，確認後重建預設世界');

    await nav('map');
    await page.locator('[data-place="market"]').tap();
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.screenshot({ path: path.join(root, 'work', 'iphone-390.png'), fullPage: true });
    assert.deepEqual(errors, [], 'unexpected browser errors');
    assert.deepEqual(externalRequests, [], 'runtime external network requests');
    mark('無 JavaScript 錯誤及外部執行期網路請求');

    const failureContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await failureContext.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('Test quota failure', 'QuotaExceededError'); }; });
    const failurePage = await failureContext.newPage();
    await failurePage.goto('http://127.0.0.1:4173');
    await failurePage.locator('[data-place="market"]').tap();
    assert.match(await failurePage.locator('body').innerText(), /儲存失敗|無法儲存|尚未儲存/);
    assert.match(await failurePage.locator('#encounters').innerText(), /林若晴/);
    await failureContext.close();
    mark('localStorage 寫入失敗有可見提示，仍可探索');

    const corruptContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await corruptContext.addInitScript(key => {
      if (!sessionStorage.getItem('seeded-corrupt-save')) {
        localStorage.setItem(key, '{broken original save');
        sessionStorage.setItem('seeded-corrupt-save', 'yes');
      }
    }, store);
    const corruptPage = await corruptContext.newPage();
    await corruptPage.goto('http://127.0.0.1:4173');
    assert.match(await corruptPage.locator('#storage-warning').innerText(), /原存檔無法讀取/);
    await corruptPage.locator('[data-place="market"]').tap();
    assert.equal(await corruptPage.evaluate(key => localStorage.getItem(key), store), '{broken original save');
    await corruptPage.locator('[data-screen="diary"]').tap();
    corruptPage.once('dialog', dialog => dialog.accept());
    await corruptPage.locator('#btn-reset').tap();
    assert.equal((await corruptPage.evaluate(key => JSON.parse(localStorage.getItem(key)), store)).version, 2);
    assert.equal(await corruptPage.locator('#storage-warning').isVisible(), false);
    await corruptContext.close();
    mark('損壞的本機存檔保留原始資料，確認新遊戲才解除保護');

    const readFailureContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, acceptDownloads: true });
    const originalSave = JSON.stringify(backup);
    await readFailureContext.addInitScript(({ key, originalSave }) => {
      const nativeGet = Storage.prototype.getItem;
      const nativeSet = Storage.prototype.setItem;
      nativeSet.call(localStorage, key, originalSave);
      window.readFailureWrites = 0;
      window.readOriginalSave = () => nativeGet.call(localStorage, key);
      Storage.prototype.getItem = function () { throw new DOMException('Test storage read failure', 'SecurityError'); };
      Storage.prototype.setItem = function (...args) {
        if (this === localStorage) window.readFailureWrites += 1;
        return nativeSet.apply(this, args);
      };
    }, { key: store, originalSave });
    const readFailurePage = await readFailureContext.newPage();
    await readFailurePage.goto('http://127.0.0.1:4173');
    assert.equal(await readFailurePage.evaluate(() => window.readFailureWrites), 0);
    assert.match(await readFailurePage.locator('#storage-warning').innerText(), /無法讀取/);
    assert.match(await readFailurePage.locator('#save-status').innerText(), /尚未儲存/);
    await readFailurePage.locator('[data-place="market"]').tap();
    await readFailurePage.locator('#btn-wait').tap();
    assert.equal(await readFailurePage.evaluate(() => window.readFailureWrites), 0);
    assert.equal(await readFailurePage.evaluate(() => window.readOriginalSave()), originalSave);
    assert.match(await readFailurePage.locator('#storage-warning').innerText(), /無法讀取/);
    assert.match(await readFailurePage.locator('#save-status').innerText(), /尚未儲存/);
    await readFailurePage.locator('[data-screen="diary"]').tap();
    await readFailurePage.locator('#btn-export').tap();
    const temporarySave = JSON.parse(await readFailurePage.locator('#backup-text').inputValue());
    assert.equal(temporarySave.day, 1);
    assert.equal(temporarySave.slot, 1);
    assert.equal(temporarySave.characters.length, 3);
    assert.equal(await readFailurePage.evaluate(() => window.readFailureWrites), 0);
    await readFailurePage.locator('#backup-done').tap();
    readFailurePage.once('dialog', dialog => dialog.accept());
    await readFailurePage.locator('#btn-reset').tap();
    assert.ok(await readFailurePage.evaluate(() => window.readFailureWrites) > 0);
    const replacementSave = JSON.parse(await readFailurePage.evaluate(() => window.readOriginalSave()));
    assert.equal(replacementSave.day, 1);
    assert.equal(replacementSave.slot, 0);
    assert.equal(replacementSave.location, 'community');
    assert.equal(await readFailurePage.locator('#storage-warning').isVisible(), false);
    assert.match(await readFailurePage.locator('#save-status').innerText(), /已自動儲存/);
    await readFailureContext.close();
    mark('本機讀取例外時完全禁止自動寫入，可匯出暫存進度，確認新遊戲才恢復寫入');

    console.log(`\n${checks.length} 組瀏覽器檢查通過（Chromium 手機觸控模擬；非實體 iPhone Safari）。`);
    await fs.writeFile(path.join(root, 'work', 'browser-results.json'), JSON.stringify({ browser: 'Chromium touch emulation', realIPhoneSafari: false, checks, errors, externalRequests }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
