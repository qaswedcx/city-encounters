/* Touch regression for the real exploration screen. Development-only Playwright. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright-core'),Core=require('../js/core.js'),Town=require('../js/town.js'),Data=require('../js/data.js');
const root=path.resolve(__dirname,'..'),store='city-encounters-v1',checks=[];
const mark=x=>{checks.push(x);console.log('PASS '+x);};
async function main(){
  const server=http.createServer(async(req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
      const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
      if(!file.startsWith(root+path.sep))throw Error('outside root');
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
      res.end(await fs.readFile(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  let browser;const errors=[],external=[];
  try {
    const url='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    const page=await context.newPage();page.setDefaultTimeout(8000);
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(url)&&!r.url().startsWith('blob:'))external.push(r.url());});
    await page.goto(url);
    const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),store);
    async function load(s){await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key:store,s});await page.reload();}
    async function heads(){return page.locator('[data-town-person]').evaluateAll(nodes=>nodes.map(n=>[n.dataset.townPerson,n.closest('.town-residents').getAttribute('aria-label')]));}
    async function matchesProjection(){
      const saved=await state(),mapWidth=await page.locator('#town-map').evaluate(n=>n.clientWidth),expected=Town.population(saved).flatMap(p=>p.visible.slice(0,Town.portraitLimit(mapWidth,p.visible.length)).map(r=>[r.character.id,p.name+'附近的人物']));
      assert.deepEqual(await heads(),expected);
      const ids=(await heads()).map(([id])=>id);assert.equal(new Set(ids).size,ids.length);
    }
    const base=Core.createState();Core.prepare(base,()=>.99);await load(base);
    assert.equal(await page.locator('#place-grid').count(),0);assert.equal(await page.getByText('今天，去哪裡走走？',{exact:true}).count(),0);
    assert.equal(await page.locator('[data-place]').count(),6);
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:844});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      for(const p of Data.PLACES){
        const button=page.locator(`[data-place="${p.id}"]`),box=await button.boundingBox();assert.ok(box.width>=44&&box.height>=44);
        await button.tap();const saved=await state();assert.equal(saved.location,p.id);assert.equal(saved.day,1);assert.equal(saved.slot,0);
        assert.equal(await button.getAttribute('aria-pressed'),'true');assert.match(await page.locator('#place-title').innerText(),new RegExp(p.name));
        assert.deepEqual(saved.characters,base.characters);
      }
      await matchesProjection();
    }
    mark('320/375/390/430 touch: six unique destinations, current location, no time cost, no overflow, targets ≥44px');

    await load(base);
    const [florist,designer,baker]=base.characters;
    for(const c of [florist,baker]){
      const img=page.locator(`[data-town-person="${c.id}"] img`);await img.scrollIntoViewIfNeeded();
      await page.waitForFunction(id=>{const i=document.querySelector(`[data-town-person="${id}"] img`);return i?.complete&&i.naturalWidth===1086;},c.id);
      assert.equal(await img.getAttribute('src'),Core.profile(c).assets['portrait-default']);
      const box=await page.locator(`[data-town-person="${c.id}"] .town-face`).boundingBox();assert.ok(box.width>=32&&box.width<=40);
    }
    assert.equal(await page.locator(`[data-town-person="${designer.id}"]`).count(),0);
    const beforePreview=await state();await page.locator(`[data-town-person="${florist.id}"]`).tap();
    assert.equal(await page.locator('#sheet-title').innerText(),florist.name);assert.match(await page.locator('#sheet-content').innerText(),/傳統市場/);
    assert.deepEqual(await state(),beforePreview);await page.locator('#town-enter').tap();
    assert.equal((await state()).location,'market');assert.equal((await state()).characters[0].life.pending,null);
    await page.locator(`[data-interact="greet"][data-id="${florist.id}"]`).tap();
    assert.match(await page.locator('.dialogue').innerText(),/工作/);const pending=await state();
    await page.locator('#btn-close').tap();await page.locator('[data-place="library"]').tap();
    assert.equal((await state()).location,'market');assert.deepEqual(await state(),pending);assert.equal(await page.locator('#overlay').isVisible(),true);
    await page.locator('[data-life-choice="0"]').tap();assert.equal((await state()).slot,1);await matchesProjection();
    mark('correct local portraits, name/location preview, service greeting, pending-talk movement guard and one-step refresh');

    await load(base);await page.locator('#btn-wait').tap();await matchesProjection();
    assert.equal((await heads()).length,3);assert.equal((await state()).slot,1);
    await fs.mkdir(path.join(root,'work'),{recursive:true});
    await page.waitForFunction(()=>document.querySelector('#toast').classList.contains('hidden'));
    for(const person of base.characters)assert.equal(await page.locator(`[data-town-person="${person.id}"] img`).getAttribute('src'),Core.profile(person).assets['portrait-default']);
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:844});await page.locator('#town-map').screenshot({path:path.join(root,'work',`town-map-${width}.png`)});
    }
    await page.locator('#btn-wait').tap();await matchesProjection();
    assert.deepEqual(await heads(),[]); // Monday evening is family time for all three.
    await page.locator('#btn-wait').tap();assert.equal((await state()).day,2);await matchesProjection();
    mark('wait refreshes work/family positions immediately, including midnight; four mobile screenshots saved');

    const crowded=Core.createState();Core.prepare(crowded,()=>.99);
    crowded.characters=Array.from({length:6},(_,i)=>{
      const c=Core.normalizeCharacter({...crowded.characters[i%3],id:'neighbor-'+i,coreId:null,name:i===0?'<鄰居 & 朋友>':'鄰居'+i});
      c.life.events=[];c.life.work.type='休假';c.life.family.duties=[];c.schedule=['community','market','park'];c.life.weekend=[...c.schedule];return c;
    });
    await page.setViewportSize({width:320,height:844});await load(crowded);assert.equal(await page.locator('[data-town-person]').count(),2);assert.equal(await page.locator('[data-town-more]').innerText(),'+4');
    assert.equal(await page.locator('.town-residents img').count(),0);assert.equal(await page.locator('.town-residents .town-face-fallback').count(),2);
    assert.equal(await page.locator('.town-residents script').count(),0);
    const faces=await page.locator('.town-residents .town-face').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right};}));
    for(let i=1;i<faces.length;i++)assert.ok(faces[i].left>=faces[i-1].right);
    const row=await page.locator('.town-residents').filter({has:page.locator('[data-town-more]')}).boundingBox(),map=await page.locator('#town-map').boundingBox();
    assert.ok(row.x>=map.x&&row.x+row.width<=map.x+map.width);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('[data-town-more]').tap();assert.equal(await page.locator('.town-preview-person').count(),6);
    assert.match(await page.locator('#sheet-content').innerText(),/<鄰居 & 朋友>/);await page.locator('#town-enter').tap();
    assert.equal(await page.locator('#encounters .npc').count(),6);
    await page.locator('#btn-wait').tap();await matchesProjection();assert.equal(await page.locator('[data-town-more="community"]').count(),0);
    await page.locator('[data-town-more="market"]').tap();await page.locator('#town-enter').tap();assert.equal(await page.locator('#encounters .npc').count(),6);
    mark('six colocated custom characters: responsive distinct heads, +N, safe fallback, all encounters and next-slot relocation');

    const locked=Core.createState();Core.prepare(locked,()=>.99);locked.characters=[locked.characters[0]];
    const c=locked.characters[0];c.life.records={life1:{status:'success',day:1},life2:{status:'success',day:1}};c.life.appointments=[{...Core.rule('活動準備',0,'community'),day:1,status:'planned'}];
    await load(locked);await page.locator('[data-town-person]').tap();assert.equal(await page.locator('[data-life-choice]').count(),0);
    assert.equal(await page.getByText(c.life.events.find(e=>e.id==='story7').title,{exact:true}).count(),0);
    await page.locator('#town-enter').tap();await page.locator('[data-interact=deep]').tap();
    assert.match(await page.locator('#sheet-title').innerText(),/日常/);assert.deepEqual((await state()).characters[0].life.records,c.life.records);
    await page.locator('[data-life-choice="0"]').tap();
    mark('portrait preview never starts or reveals a locked event; normal deep-interaction limits still apply');

    const missing=structuredClone(base);await page.route('**/assets/characters/*/portrait-default.webp',r=>r.fulfill({status:404,body:''}));await load(missing);
    await page.waitForFunction(()=>[...document.querySelectorAll('.town-residents .town-face')].every(n=>!n.querySelector('img')));
    assert.equal(await page.locator('[data-town-person]').count(),2);await page.locator('[data-town-person]').first().tap();await page.locator('#town-enter').tap();
    assert.equal(await page.locator('#encounters .npc').count(),1);await page.unroute('**/assets/characters/*/portrait-default.webp');
    mark('missing portrait falls back safely while buildings and encounters remain functional');

    // Keyboard works without hover, and the last destination can scroll above fixed navigation.
    await load(base);await page.locator('[data-place="mall"]').focus();await page.keyboard.press('Enter');assert.equal((await state()).location,'mall');
    await page.locator('[data-place="mall"]').scrollIntoViewIfNeeded();
    const bottom=await page.locator('[data-place="mall"]').boundingBox(),nav=await page.locator('.nav').boundingBox();assert.ok(bottom.y+bottom.height<nav.y);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    mark('keyboard entry, bottom-navigation clearance, no page exceptions or external runtime requests');
    await fs.writeFile(path.join(root,'work','town-map-results.json'),JSON.stringify({checks,errors,external},null,2));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
