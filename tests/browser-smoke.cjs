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
    page.on('console', message => { if (message.type() === 'error' && !message.text().includes('favicon') && !message.location().url.includes('/assets/characters/')) errors.push(message.text()); });
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('blob:')) externalRequests.push(request.url()); });
    const state = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
    const nav = async screen => {await page.locator(`[data-screen="${screen}"]`).tap();if(screen==='people')while(await page.locator('details:not([open]) > summary').filter({hasText:'生活行程與人物管理'}).count())await page.locator('details:not([open]) > summary').filter({hasText:'生活行程與人物管理'}).first().tap();};
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
    await nav('people');
    assert.equal(await page.locator('.core-character').count(),3);
    assert.equal(await page.locator('.character-tagline').count(),3);
    assert.equal(await page.locator('.profile-section').filter({hasText:'內在性格'}).first().innerText(),'內在性格 · 尚未解鎖');
    for(const card of await page.locator('.character-art').all())await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelectorAll('.core-character .art-loaded').length===3);
    for(const id of ['ruoqing','yian','zhiyan']){
      const img=page.locator(`.art-${id} img`);
      assert.match(await img.getAttribute('src'),new RegExp(`/characters/${id}/portrait-default.webp$`));
      assert.deepEqual(await img.evaluate(e=>[e.naturalWidth,e.naturalHeight]),[1086,1448]);
      assert.equal(await page.locator(`.art-${id} .art-placeholder`).isVisible(),false);
    }
    await page.screenshot({path:path.join(root,'work','v03-dossier.png'),fullPage:true});
    mark('three core dossiers, progressive disclosure and corresponding official portraits');
    await page.locator('#btn-add').tap();await fillCharacter('自訂測試',56);assert.equal(await page.locator('[name=age]').evaluate(e=>e.validity.rangeOverflow),true);await page.locator('[name=age]').fill('55');await page.locator('#character-form button[type="submit"]').tap();assert.equal((await state()).characters.length,4);assert.equal(await page.evaluate(()=>Boolean(window.injected)),false);mark('create adult custom character, HTML escaped');
    const custom=(await state()).characters.at(-1);
    await page.locator(`[data-edit="${custom.id}"]`).tap();await page.locator('[name="name"]').fill('已編輯');await page.locator('#character-form button[type="submit"]').tap();assert.equal((await state()).characters.at(-1).name,'已編輯');
    await page.locator('#btn-random').tap();assert.equal((await state()).characters.length,5);const random=(await state()).characters.at(-1);page.once('dialog',d=>d.accept());await page.locator(`[data-delete="${random.id}"]`).tap();assert.equal((await state()).characters.length,4);mark('edit, random and delete');
    // Import a deterministic fixture through the real file UI, not in-memory UI mutation.
    const Core=require('../js/core.js');let fixture=Core.createState();fixture.characters=[Core.normalizeCharacter({...fixture.characters[1],schedule:['community','community','community']})];const c=fixture.characters[0];c.life.work.type='休假';c.life.family.duties=[];Core.prepare(fixture,()=>.9);
    page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact="chat"]').tap();await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,0);await page.reload();await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,1);assert.ok((await state()).characters[0].life.memories.length);mark('multi-round reload resumes, consumes once and remembers');
    const beforeBackup=await state();await nav('diary');const downloadEvent=page.waitForEvent('download');await page.locator('#btn-export').tap();const download=await downloadEvent;const exportPath=path.join(root,'work','browser-export.json');await download.saveAs(exportPath);const backup=JSON.parse(await fs.readFile(exportPath,'utf8'));await page.locator('#backup-done').tap();await nav('map');await page.locator('#btn-wait').tap();page.once('dialog',d=>d.accept());await importFile(backup);assert.deepEqual(await state(),beforeBackup);await page.reload();assert.deepEqual(await state(),beforeBackup);mark('actual JSON download and import round trip');
    const beforeInvalid=await state();await importFile({...backup,characters:[null]});assert.deepEqual(await state(),beforeInvalid);await importFile('{broken');assert.deepEqual(await state(),beforeInvalid);mark('invalid imports cannot overwrite progress');
    for(const [first,second,result] of [[0,0,'success'],[1,null,'not_occurred'],[2,null,'temporary_failure'],[2,null,'permanent_failure']]){fixture=Core.createState();fixture.characters=[Core.normalizeCharacter({...fixture.characters[1],schedule:['community','community','community'],familiarity:70,trust:60})];const person=fixture.characters[0];person.coreId=null;if(result==='permanent_failure')person.life.events[2].retry=false;person.life.work.type='休假';person.life.family.duties=[];person.life.records={life1:{status:'success',day:1},life2:{status:'success',day:1}};Core.prepare(fixture,()=>.9);page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact="deep"]').tap();await page.locator(`[data-life-choice="${first}"]`).tap();if(await page.locator('[data-life-choice="finish"]').count())await page.locator('[data-life-choice="finish"]').tap();assert.equal((await state()).characters[0].life.records.key.status,result);await page.reload();assert.equal((await state()).characters[0].life.records.key.status,result);}
    mark('key success below 100, not occurred and temporary failure through touch UI');
    // v0.2.1 visual work editor and schedule: all work changes use native controls.
    fixture=Core.createState();fixture.characters=[Core.normalizeCharacter({...fixture.characters[1],name:'排班測試',schedule:['park','park','park'],familiarity:77,trust:65})];
    const worker=fixture.characters[0];worker.life.events=[];worker.life.family.duties=[Core.rule('陪伴家人',1,'home',[1])];worker.life.memories=[{day:1,text:'重要舊記憶'}];worker.life.work={type:'固定班',location:'office',days:[1,3,5],slots:[0,2],brief:false};Core.prepare(fixture,()=>.99);
    page.once('dialog',d=>d.accept());await importFile(fixture);await nav('people');
    assert.match(await page.locator('.effective-schedule').innerText(),/工作中/);assert.match(await page.locator('.effective-schedule').innerText(),/辦公室/);
    const beforeWeek=await state();await page.locator('[data-weekly]').tap();
    assert.equal(await page.locator('.week-day').count(),7);assert.match(await page.locator('#sheet-content').innerText(),/優先順序/);
    for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow('weekly '+width);}
    assert.deepEqual(await state(),beforeWeek);await page.locator('#btn-close').tap();
    await page.locator('[data-edit]').tap();assert.equal(await page.locator('[name="life-work"]').count(),0);
    assert.equal(await page.locator('[name="work-type"]').inputValue(),'固定班');
    for(const type of ['輪班','自由接案','休假','固定班'])await page.locator('[name="work-type"]').selectOption(type);
    await page.locator('[name="work-location"]').selectOption('cafe');
    for(const el of await page.locator('[name="work-days"]').all()){
      const desired=[1,2,6].includes(Number(await el.inputValue()));if(await el.isChecked()!==desired)await el.locator('..').tap();
    }
    for(const el of await page.locator('[name="work-slots"]').all()){
      const desired=Number(await el.inputValue())===0;if(await el.isChecked()!==desired)await el.locator('..').tap();
    }
    // Missing active work days must report a form error without saving.
    for(const el of await page.locator('[name="work-days"]').all())if(await el.isChecked())await el.locator('..').tap();
    await page.locator('#character-form button[type="submit"]').tap();assert.match(await page.locator('#form-error').innerText(),/至少勾選/);assert.deepEqual(await state(),beforeWeek);
    for(const d of [1,2,6])await page.locator(`[name="work-days"][value="${d}"]`).locator('..').tap();
    await page.locator('[name="work-brief"]').locator('..').tap();
    assert.deepEqual(await state(),beforeWeek,'work edits stay draft until saved');
    await page.locator('#character-form button[type="submit"]').tap();
    let savedWorker=(await state()).characters[0];
    assert.deepEqual(savedWorker.life.work,{type:'固定班',location:'cafe',days:[1,2,6],slots:[0],brief:true});
    assert.equal(savedWorker.familiarity,77);assert.equal(savedWorker.trust,65);assert.deepEqual(savedWorker.life.memories,worker.life.memories);
    await page.reload();assert.deepEqual((await state()).characters[0],savedWorker);
    await nav('map');for(const location of ['park','market','mall','library','community']){await page.locator(`[data-place="${location}"]`).tap();assert.equal(await page.locator('[data-interact="greet"]').count(),0);}
    await page.locator('[data-place="cafe"]').tap();assert.equal(await page.locator('[data-interact="greet"]').count(),1);
    await page.locator('[data-interact="greet"]').tap();assert.match(await page.locator('.dialogue').innerText(),/工作/);assert.equal(await page.locator('[data-life-choice]').count(),1);await page.locator('[data-life-choice="0"]').tap();
    assert.equal((await state()).slot,1);assert.equal(await page.locator('[data-interact="greet"]').count(),0);
    await nav('people');assert.match(await page.locator('.effective-schedule .current').innerText(),/家庭時間/);
    mark('visual work controls, actual current/weekly schedule, service interaction and family override');
    // Work and reviewed marker survive a real export/import cycle too.
    const workBackupState=await state();await nav('diary');const workDownloadEvent=page.waitForEvent('download');await page.locator('#btn-export').tap();const workDownload=await workDownloadEvent;const workPath=path.join(root,'work','work-schedule-export.json');await workDownload.saveAs(workPath);await page.locator('#backup-done').tap();await nav('map');await page.locator('#btn-wait').tap();page.once('dialog',d=>d.accept());await importFile(JSON.parse(await fs.readFile(workPath,'utf8')));assert.deepEqual(await state(),workBackupState);mark('visual work settings round trip through actual JSON download/import');
    // A v1 upgrade stays on vacation until the player explicitly saves a draft.
    const legacy={version:1,day:1,slot:0,location:'community',characters:[{...require('../js/data.js').DEFAULTS[1],familiarity:80}],logs:[]};
    page.once('dialog',d=>d.accept());await importFile(legacy);await nav('people');await page.locator('[data-edit]').tap();assert.equal(await page.locator('#work-review').count(),1);
    const beforeSuggestion=await state();await page.locator('#suggest-work').tap();assert.equal(await page.locator('[name="work-type"]').inputValue(),'自由接案');await page.locator('#cancel-editor').tap();assert.deepEqual(await state(),beforeSuggestion);
    await page.locator('[data-edit]').tap();await page.locator('#keep-vacation').tap();await page.locator('#character-form button[type="submit"]').tap();assert.equal((await state()).characters[0].life.work.type,'休假');
    await page.locator('[data-edit]').tap();assert.equal(await page.locator('#work-review').count(),0);await page.locator('#suggest-work').tap();await page.locator('#character-form button[type="submit"]').tap();await page.reload();assert.equal((await state()).characters[0].life.work.type,'自由接案');assert.equal((await state()).characters[0].familiarity,80);
    mark('legacy vacation review: cancel suggestion, explicitly retain vacation, opt in and reload');
    // v0.2.2 no-JSON family and event authoring, preserving an existing event result.
    fixture=Core.createState();fixture.characters=[fixture.characters[0]];const authorPerson=fixture.characters[0];authorPerson.life.work.type='休假';authorPerson.life.family.duties=[];authorPerson.life.memories=[{day:1,text:'舊共同經歷'}];authorPerson.life.records.life1={status:'success',day:1};Core.prepare(fixture,()=>.99);
    page.once('dialog',d=>d.accept());await importFile(fixture);await nav('people');await page.locator('[data-edit]').tap();
    assert.equal(await page.locator('textarea[name^="life-"]').count(),0);
    await page.locator('[data-editor-child-count]').fill('2');await page.locator('[data-editor-child-count]').blur();
    await page.locator('[data-editor-field="family.children.0"]').fill('6');await page.locator('[data-editor-field="family.children.1"]').fill('12');
    await page.locator('[data-editor-action="add-duty"]').tap();
    await page.locator('[data-editor-field="family.duties.0.label"]').fill('接送小孩');await page.locator('[data-editor-field="family.duties.0.slot"]').selectOption('1');await page.locator('[data-editor-field="family.duties.0.location"]').selectOption('home');
    await page.locator('[data-editor-field="weekend.0"]').selectOption('library');
    await page.locator('[data-editor-action="add-appointment"]').tap();await page.locator('[data-editor-field="appointments.0.label"]').fill('家庭聚餐');
    await page.locator('#life-editor > .visual-editor > details > summary').tap();
    await page.locator('[data-editor-action="add-event"]').tap();
    assert.equal(await page.locator('[data-editor-action="remove-event"][data-index="0"]').isDisabled(),true);
    const ei=authorPerson.life.events.length;
    await page.locator(`[data-editor-field="events.${ei}.title"]`).fill('一起整理花材');
    await page.locator(`[data-editor-field="events.${ei}.previous"]`).selectOption('life1');
    await page.locator(`[data-editor-field="events.${ei}.minimum"]`).fill('60');await page.locator(`[data-editor-field="events.${ei}.trust"]`).fill('45');
    await page.locator(`[data-editor-field="events.${ei}.location"]`).selectOption('market');await page.locator(`[data-editor-field="events.${ei}.slot"]`).selectOption('0');
    await page.locator(`[data-editor-field="events.${ei}.nodes.0.text"]`).fill('你願意一起把花材分類，再談談我們嗎？');
    await page.locator(`[data-editor-action="add-node"][data-event="${ei}"]`).tap();
    const mode=`events.${ei}.nodes.0.choices.0`;
    await page.locator(`[data-editor-mode="${mode}"]`).selectOption('next');
    await page.locator(`[data-editor-field="${mode}.label"]`).fill('先把花材按長短分好，再坐下聊');
    await page.locator(`[data-editor-action="add-choice"][data-event="${ei}"][data-node="0"]`).tap();
    await page.locator(`[data-editor-field="events.${ei}.nodes.0.choices.1.label"]`).fill('今天先做完手上的事，不談關係');
    await page.locator(`[data-editor-field="events.${ei}.nodes.1.text"]`).fill('我願意和你認真發展，也會保留家庭生活。');
    await page.locator(`[data-editor-field="events.${ei}.nodes.1.result"]`).selectOption('success');
    for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow('expanded author '+width);}
    await page.locator('#character-form button[type="submit"]').tap();
    const authored=(await state()).characters[0];assert.deepEqual(authored.life.family.children,[6,12]);assert.equal(authored.life.family.duties[0].label,'接送小孩');assert.equal(authored.life.weekend[0],'library');assert.equal(authored.life.appointments[0].label,'家庭聚餐');assert.equal(authored.life.events[ei].nodes[0].choices[0].next,1);assert.equal(authored.life.events[ei].nodes[1].result,'success');assert.deepEqual(authored.life.records,authorPerson.life.records);assert.deepEqual(authored.life.memories,authorPerson.life.memories);assert.equal(authored.familiarity,authorPerson.familiarity);
    await page.reload();assert.deepEqual((await state()).characters[0],authored);
    mark('zero-code children, family, weekend, appointments, event nodes and outcomes survive reload without clearing records');
    // A custom-only fixture prevents additive core-story migration from taking priority.
    const authoredState=await state();authoredState.slot=0;authoredState.location='market';authoredState.characters[0].coreId=null;authoredState.characters[0].familiarity=65;authoredState.characters[0].trust=50;authoredState.characters[0].life.events=[authored.life.events[0],authored.life.events[ei]];
    page.once('dialog',d=>d.accept());await importFile(authoredState);await nav('map');await page.locator('[data-interact="deep"]').tap();assert.match(await page.locator('#sheet-title').innerText(),/事件/);await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,0);assert.equal(await page.locator('[data-life-choice]').count(),1);await page.locator('[data-life-choice="finish"]').tap();assert.equal((await state()).slot,1);assert.equal((await state()).characters[0].life.records[authored.life.events[ei].id].status,'success');assert.equal((await state()).characters[0].marital,authored.marital);assert.deepEqual((await state()).characters[0].life.family.children,[6,12]);mark('visually authored event runs through its nodes, advances once and preserves family/marriage after breakthrough');

    // Isolate the v0.3 route; the newer story route has its own town-story tests.
    for(let i=0;i<3;i++)for(const [choice,label] of [[0,'戀愛成功'],[1,'友情維持'],[2,'錯過／失敗']]){
      fixture=Core.createState();fixture.characters=[fixture.characters[i]];const person=fixture.characters[0];person.life.events=person.life.events.map(e=>{const old=require('../js/legacy-events-v1.js')[person.coreId].find(x=>x.id===e.id);return old?{...structuredClone(old),title:'玩家自訂：'+old.title}:e;});fixture.location='community';person.life.work.type='休假';person.life.family.duties=[];person.schedule=['community','community','community'];person.life.weekend=[...person.schedule];person.familiarity=70;person.trust=65;person.life.records={life1:{status:'success',day:1},life2:{status:'success',day:1},'v03-intimacy':{status:'success',day:1},story1:{status:'permanent_failure',day:1}};Core.prepare(fixture,()=>.99);
      page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact=deep]').tap();assert.equal(await page.locator('.scene-art').count(),1);await page.locator(`[data-life-choice="${choice}"]`).tap();await page.reload();await nav('people');assert.match(await page.locator('.people-card').innerText(),new RegExp(label));assert.equal(Core.routeStage((await state()).characters[0]),label);
      for(const width of [320,390,430]){await page.setViewportSize({width,height:844});await noOverflow('route dossier '+width);}
    }
    mark('all three core routes: romance, friendship and failure persist through touch choices and reload');

    // A normal greeting cannot offer two synonymous ways to settle the same exchange.
    fixture=Core.createState();fixture.characters=[fixture.characters[1]];fixture.characters[0].life.work.type='休假';fixture.characters[0].life.family.duties=[];fixture.characters[0].schedule=['community','community','community'];Core.prepare(fixture,()=>.99);page.once('dialog',d=>d.accept());await importFile(fixture);await nav('map');await page.locator('[data-interact="greet"]').tap();assert.equal(await page.locator('[data-life-choice]').count(),1);await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).characters[0].life.conversations.at(-1).outcome,'completed');mark('ordinary greeting has one finish and separate conversation outcome');
    const corruptContext=await browser.newContext();await corruptContext.addInitScript(()=>localStorage.setItem('city-encounters-v1','{broken original'));const corrupt=await corruptContext.newPage();await corrupt.goto('http://127.0.0.1:4173');await corrupt.locator('[data-place="market"]').click();assert.equal(await corrupt.evaluate(()=>localStorage.getItem('city-encounters-v1')),'{broken original');await corruptContext.close();mark('corrupt local save remains protected during exploration');
    assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);mark('no page errors or external requests');
    await fs.writeFile(path.join(root,'work','browser-results.json'),JSON.stringify({checks,errors,realIPhoneSafari:false},null,2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

