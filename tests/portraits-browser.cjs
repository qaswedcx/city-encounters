/* Actual local assets, failure chain and mobile layout; no external image services. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright-core'),Core=require('../js/core.js');
const root=path.resolve(__dirname,'..'),store='city-encounters-v1',checks=[];
const mark=x=>{checks.push(x);console.log('PASS '+x);};
async function main(){
 const server=http.createServer(async(req,res)=>{try{const name=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!name.startsWith(root+path.sep)&&name!==root)throw Error();const file=name===root?path.join(root,'index.html'):name;res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4174,'127.0.0.1',resolve);});
 let browser;const errors=[],external=[];
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox'],headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();page.setDefaultTimeout(8000);
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4174')&&!r.url().startsWith('blob:'))external.push(r.url());});
  const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),store);
  async function load(fixture){await page.goto('http://127.0.0.1:4174');if(await page.locator('#overlay').isVisible())await page.locator('#btn-close').tap();await page.locator('[data-screen=diary]').tap();page.once('dialog',d=>d.accept());await page.locator('#import-file').setInputFiles({name:'legacy-save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.waitForFunction(()=>document.querySelector('#import-file').value==='');}
  async function loaded(selector,id){const fig=page.locator(selector);await fig.scrollIntoViewIfNeeded();await fig.locator('img').waitFor();await page.waitForFunction(sel=>{const e=document.querySelector(sel+' img');return e?.complete&&e.naturalWidth===1086;},selector);assert.match(await fig.locator('img').getAttribute('src'),new RegExp(`/characters/${id}/portrait-default.webp$`));assert.equal(await fig.locator('.art-placeholder').isVisible(),false);return fig;}
  const fixture=Core.createState();fixture.version=3;fixture.characters.forEach(c=>{c.familiarity=73;c.trust=64;c.closeness=31;c.life.work.type='休假';c.life.family.duties=[];c.schedule=['community','community','community'];c.life.weekend=[...c.schedule];c.life.daily={day:1,changes:[],busy:false};c.life.records['v03-choice']={status:'success',day:1};});
  fixture.logs=[{day:1,slot:0,message:'保留原本的遊玩進度'}];
  await load(fixture);
  const baseline=await state();assert.equal(baseline.version,4);
  for(const width of [320,390,430]){
   await page.setViewportSize({width,height:844});
   for(const screen of ['people','map']){
    await page.locator(`[data-screen=${screen}]`).tap();
    for(const c of baseline.characters){await loaded(`#screen-${screen} .art-${c.coreId}`,c.coreId);}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
  }
  assert.deepEqual(await state(),baseline);await page.reload();assert.deepEqual(await state(),baseline);
  await page.locator('[data-screen=people]').tap();for(const c of baseline.characters)await loaded(`#screen-people .art-${c.coreId}`,c.coreId);
  await fs.mkdir(path.join(root,'work'),{recursive:true});await page.screenshot({path:path.join(root,'work','official-portraits-430.png'),fullPage:true});
  mark('three actual portraits match character IDs on dossiers and encounters at 320/390/430; legacy progress and reload unchanged');
  // Ordinary dialogue for each person. Merely loading images must not alter the pending exchange.
  for(const original of baseline.characters){
   const s=structuredClone(baseline);s.characters=[structuredClone(original)];const c=s.characters[0];await load(s);await page.locator('[data-screen=map]').tap();await page.locator('[data-interact=greet]').tap();await loaded('#sheet-content .character-art',c.coreId);const pending=await state();await page.reload();await loaded('#sheet-content .character-art',c.coreId);assert.deepEqual(await state(),pending);await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,1);
  }
  mark('all three ordinary dialogue portraits, pending-talk refresh and exactly one time advance');
  for(const original of baseline.characters){
   const s=structuredClone(baseline);s.characters=[structuredClone(original)];const c=s.characters[0];c.life.work={type:'輪班',days:[1],slots:[0],location:'community',brief:true};c.life.daily.busy=false;await load(s);await page.locator('[data-screen=map]').tap();await loaded('#encounters .character-art',c.coreId);await page.locator('[data-interact=greet]').tap();await loaded('#sheet-content .character-art',c.coreId);await page.locator('#btn-close').tap();
   for(const variant of ['portrait-date','expression-smile','scene-encounter']){
    await page.locator('#encounters .character-art img').evaluate((img,src)=>{img.src=src;},Core.profile(c).assets[variant]);await loaded('#encounters .character-art',c.coreId);
   }
   for(const eventId of ['v03-choice','v03-together']){
    c.life.work.type='休假';c.life.records={life1:{status:'success',day:1},life2:{status:'success',day:1},'v03-intimacy':{status:'success',day:1}};if(eventId==='v03-together')c.life.records['v03-choice']={status:'success',day:1};
    c.life.pending=null;await load(s);await page.locator('[data-screen=map]').tap();await page.locator('[data-interact=deep]').tap();assert.equal((await state()).characters[0].life.pending.id,eventId);await loaded('#sheet-content .scene-art.portrait-fallback',c.coreId);await page.locator('#btn-close').tap();
   }
  }
  mark('work, date, expression, encounter-scene, key and romance variants fall back to the same official default');
  // Both a missing variant and a broken default: finite chain; other people still render.
  await page.route('**/assets/characters/ruoqing/portrait-default.webp',r=>r.fulfill({status:200,contentType:'image/webp',body:'not an image'}));
  await load(baseline);await page.locator('[data-screen=map]').tap();await page.waitForFunction(()=>!document.querySelector('#encounters .art-ruoqing img'));assert.equal(await page.locator('#encounters .art-ruoqing .art-placeholder').isVisible(),true);await loaded('#encounters .art-yian','yian');await loaded('#encounters .art-zhiyan','zhiyan');assert.deepEqual(await state(),baseline);await page.locator(`[data-interact=greet][data-id="${baseline.characters[0].id}"]`).tap();await page.waitForFunction(()=>!document.querySelector('#sheet-content .art-ruoqing img'));await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,1);
  await page.unroute('**/assets/characters/ruoqing/portrait-default.webp');
  await page.route('**/assets/characters/ruoqing/portrait-default.webp',r=>r.fulfill({status:404,body:''}));await load(baseline);await page.locator('[data-screen=people]').tap();await page.locator('#screen-people .art-ruoqing').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('#screen-people .art-ruoqing img'));assert.equal(await page.locator('#screen-people .art-ruoqing .art-placeholder').isVisible(),true);assert.deepEqual(await state(),baseline);
  mark('corrupt and missing standard portraits retain safe fallback, preserve progress and allow dialogue completion');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);mark('no page exceptions or external requests');
  await fs.writeFile(path.join(root,'work','portraits-browser-results.json'),JSON.stringify({checks,errors,external},null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
