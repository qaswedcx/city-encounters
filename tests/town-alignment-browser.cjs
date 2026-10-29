/* Real exploration geometry and screenshots, also runnable with BROWSER=webkit.
 * TOWN_BASELINE_DIR=work/alignment-before captures main without asserting its bugs away.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require('playwright-core'),Core=require('../js/core.js'),Town=require('../js/town.js');
const root=path.resolve(__dirname,'..'),baseline=process.env.TOWN_BASELINE_DIR;
const source=baseline?path.resolve(root,baseline):root,mode=baseline?'before':'after';
const engine=process.env.BROWSER||'chromium',widths=[320,375,390,430];
const resizeWidths=[320,340,360,375,390,402,414,426,427,430];
const output=path.join(root,'work','alignment',engine),checks=[];
const mark=message=>{checks.push(message);console.log('PASS '+message);};
// Independent roof/ground landmarks read from the unchanged town-map.svg.
const landmarks={community:[94,126],market:[70,397],mall:[465,872],cafe:[138,752],park:[421,501],library:[465,232]};
function fixture(count=4){
  const s=Core.createState();Core.prepare(s,()=>.99);const originals=s.characters;
  s.characters=Object.keys(landmarks).flatMap((place,j)=>Array.from({length:count},(_,i)=>{
    const c=Core.normalizeCharacter({...originals[i%3],id:`map-${j}-${i}`});
    c.life.work.type='休假';c.life.family.duties=[];c.schedule=[place,place,place];c.life.weekend=[...c.schedule];return c;
  }));return s;
}
async function geometry(page){return page.evaluate(()=>{
  const box=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const frame=box(document.querySelector('.town-plane')||document.querySelector('#town-map'));
  const image=box(document.querySelector('.town-ground'));
  const places=[...document.querySelectorAll('[data-place]')].map(n=>({id:n.dataset.place,rect:box(n),label:box(n.querySelector('.town-site-label'))}));
  const rows=[...document.querySelectorAll('.town-residents')].filter(n=>n.children.length).map(n=>({id:n.getAttribute('aria-label'),rect:box(n),first:box(n.querySelector('[data-town-person]')),portraits:n.querySelectorAll('[data-town-person]').length,more:n.querySelector('[data-town-more]')?.textContent}));
  const rects=[...places.flatMap(p=>[{id:p.id,type:'building',...p.rect},{id:p.id,type:'label',...p.label}]),...rows.map(r=>({id:r.id,type:'heads',...r.rect}))];
  const collisions=[];
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j];if(a.type!=='heads'&&b.type!=='heads')continue;
    const dx=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x),dy=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
    if(dx>.2&&dy>.2)collisions.push([a.id,b.id,dx,dy]);
  }
  return {frame,image,places,rows,collisions,overflow:document.documentElement.scrollWidth>innerWidth};
});}
function validate(data){
  const {frame,image}=data,scale=frame.width/600;
  const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<.1,`${label}: ${actual} vs ${expected}`);
  near(frame.height,frame.width*1040/600,'uniform viewBox scale');
  for(const key of ['x','y','width','height'])near(image[key],frame[key],'background '+key);
  for(const p of data.places){
    const pin=Town.layout[p.id];
    near(p.rect.x,frame.x+pin.x*scale,p.id+' hit x');near(p.rect.y,frame.y+pin.y*scale,p.id+' hit y');
    near(p.rect.width,pin.width*scale,p.id+' hit width');near(p.rect.height,pin.height*scale,p.id+' hit height');
    near(p.label.x+p.label.width/2,frame.x+pin.labelX*scale,p.id+' label anchor x');
    near(p.label.y+p.label.height,frame.y+pin.labelY*scale,p.id+' label anchor y');
    assert.ok(p.rect.width>=44&&p.rect.height>=44);
    assert.ok(p.label.x>=frame.x-.1&&p.label.x+p.label.width<=frame.x+frame.width+.1,p.id+' label bounds');
  }
  for(const row of data.rows){
    const id=data.places.find(p=>row.id===({community:'社區',market:'傳統市場',mall:'百貨公司',cafe:'咖啡廳',park:'公園',library:'圖書館'})[p.id]+'附近的人物').id;
    const pin=Town.layout[id],r=row.rect;
    near(pin.align==='start'?r.x:r.x+r.width,frame.x+pin.peopleX*scale,id+' fixed resident edge');
    near(r.y,frame.y+pin.peopleY*scale,id+' fixed resident y');
    near(pin.align==='start'?row.first.x:row.first.x+row.first.width,frame.x+pin.peopleX*scale,id+' first portrait fixed edge');
    assert.ok(r.x>=frame.x-.1&&r.y>=frame.y-.1&&r.x+r.width<=frame.x+frame.width+.1&&r.y+r.height<=frame.y+frame.height+.1,id+' resident bounds');
  }
  assert.deepEqual(data.collisions,[],'heads must not cover labels, buildings or other head rows');
  assert.equal(data.overflow,false,'no horizontal overflow');
}
async function main(){
  await fs.mkdir(output,{recursive:true});const requests=[],failures=[],errors=[];
  const server=http.createServer(async(req,res)=>{
    try{
      const u=new URL(req.url,'http://localhost');
      if(u.pathname.endsWith('/favicon.ico')){res.writeHead(204).end();return;}
      if(!u.pathname.startsWith('/city-encounters/')){res.writeHead(404).end();return;}
      const rel=u.pathname.slice('/city-encounters/'.length)||'index.html',file=path.resolve(source,rel);
      if(!file.startsWith(source+path.sep))throw Error('outside root');
      // Emulate a stale unversioned CSS/JS cache. Versioned requests must bypass it.
      const stale=!baseline&&!u.search&&['styles.css','js/town.js','js/app.js'].includes(rel);
      const bytes=stale?Buffer.from(rel.endsWith('.css')?'.town-map{height:2000px}':'throw new Error("stale unversioned map script")'):await fs.readFile(file);
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(bytes);
    }catch{res.writeHead(404).end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  let browser;
  try{
    const launch=engine==='webkit'?{}:{executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']};
    browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...launch});
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
    const page=await context.newPage();page.setDefaultTimeout(8000);
    const url='http://127.0.0.1:'+server.address().port+'/city-encounters/';
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)failures.push([r.status(),r.url()]);});
    await page.goto(url);async function load(s){await page.evaluate(s=>localStorage.setItem('city-encounters-v1',JSON.stringify(s)),s);await page.reload();}
    async function decodedPortraits(){await page.locator('.town-residents img').evaluateAll(nodes=>Promise.all(nodes.map(i=>i.decode())));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
    await load(fixture());const measurements=[];
    for(const width of widths){
      await load(fixture());
      await page.setViewportSize({width,height:844});
      if(!baseline)await page.waitForFunction(()=>document.querySelector('#town-map').dataset.portraitLimit===String(CityTown.portraitLimit(document.querySelector('#town-map').clientWidth,4)));
      await page.locator('.town-ground').evaluate(i=>i.decode());
      await page.waitForFunction(()=>[...document.querySelectorAll('.town-residents img')].every(i=>i.complete&&i.naturalWidth===1086));
      await decodedPortraits();
      const data=await geometry(page);measurements.push({width,...data});if(!baseline)validate(data);
      await page.locator('#town-map').screenshot({scale:'css',path:path.join(output,`${mode}-${width}.png`),style:'.nav,.toast{visibility:hidden!important}'});
      await page.evaluate(()=>scrollTo(0,0));await page.screenshot({scale:'css',path:path.join(output,`${mode}-${width}-viewport.png`)});
      if(!baseline){
        for(const [id,[x,y]] of Object.entries(landmarks)){
          const frame=await page.locator('.town-plane').boundingBox();
          await page.evaluate(y=>scrollTo(0,scrollY+y-innerHeight/2),frame.y+y*frame.width/600);
          const now=await page.locator('.town-plane').boundingBox(),px=now.x+x*now.width/600,py=now.y+y*now.width/600;
          assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('[data-place]')?.dataset.place,{x:px,y:py}),id,id+' SVG landmark has matching hit target');
          await page.touchscreen.tap(px,py);
          const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('city-encounters-v1')));
          assert.equal(saved.location,id);assert.equal(saved.day,1);assert.equal(saved.slot,0);
          const label=page.locator(`[data-place="${id}"] .town-site-label`);await label.scrollIntoViewIfNeeded();
          const box=await label.boundingBox(),nav=await page.locator('.nav').boundingBox();assert.ok(box.y+box.height<nav.y);
          await label.tap();assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('city-encounters-v1')))).location,id);
        }
        validate(await geometry(page));
      }
    }
    await fs.writeFile(path.join(output,`${mode}-geometry.json`),JSON.stringify(measurements,null,2));
    const normal=Core.createState();Core.prepare(normal,()=>.99);normal.slot=1;
    await page.setViewportSize({width:390,height:844});await load(normal);
    await page.waitForFunction(()=>[...document.querySelectorAll('.town-residents img')].every(i=>i.complete&&i.naturalWidth===1086));
    await decodedPortraits();assert.equal(await page.locator('.town-residents img').count(),3);
    await page.locator('#town-map').screenshot({scale:'css',path:path.join(output,`${mode}-game-390.png`),style:'.nav,.toast{visibility:hidden!important}'});
    await page.evaluate(()=>scrollTo(0,0));await page.screenshot({scale:'css',path:path.join(output,`${mode}-game-390-viewport.png`)});
    if(baseline){
      await page.setViewportSize({width:390,height:844});await load(fixture(3));
      await page.waitForFunction(()=>[...document.querySelectorAll('.town-residents img')].every(i=>i.complete&&i.naturalWidth===1086));
      await decodedPortraits();
      await page.locator('.town-residents').first().screenshot({scale:'css',path:path.join(output,'before-portraits.png')});
      console.log('CAPTURED baseline at 320/375/390/430:',measurements.map(m=>({width:m.width,collisions:m.collisions.length})));return;}
    mark('320/375/390/430: one uniform viewBox, fixed anchors, no head/label/building collisions, six SVG landmarks and label taps');

    for(const count of [0,1,2,3,8]){
      await load(fixture(count));
      for(const width of resizeWidths){await page.setViewportSize({width,height:844});await page.waitForFunction(()=>document.querySelector('#town-map').dataset.portraitLimit===String(CityTown.portraitLimit(document.querySelector('#town-map').clientWidth,4)));validate(await geometry(page));}
    }
    mark('live resize with 0/1/2/3/8 residents per site: stable row edges, bounded 44px targets and +N capacity');
    await page.setViewportSize({width:390,height:844});await load(fixture(3));
    await decodedPortraits();
    await page.locator('.town-residents').first().screenshot({scale:'css',path:path.join(output,'after-portraits.png')});
    assert.equal(await page.locator('.town-residents img').evaluateAll(nodes=>nodes.every(i=>getComputedStyle(i).transform==='none')),true);
    await page.locator('[data-town-person]').first().tap();assert.equal(await page.locator('.town-preview-person').count(),1);await page.locator('#town-enter').tap();
    assert.equal(await page.locator('#encounters .npc').count(),3);
    mark('all three unchanged portraits use proportional top crops; portrait preview enters the existing encounter panel');

    let release,finish;const gate=new Promise(resolve=>release=resolve),handled=new Promise(resolve=>finish=resolve);
    await page.route('**/assets/town-map.svg?*',async route=>{await gate;await route.fulfill({contentType:'image/svg+xml',body:await fs.readFile(path.join(root,'assets/town-map.svg'))});finish();});
    await page.reload({waitUntil:'domcontentloaded'});
    const loading=await geometry(page);validate(loading);release();await handled;await page.unroute('**/assets/town-map.svg?*');await page.locator('.town-ground').evaluate(i=>i.decode());validate(await geometry(page));
    const noAspect=await page.addStyleTag({content:'.town-map{aspect-ratio:auto!important}'});validate(await geometry(page));await noAspect.evaluate(n=>n.remove());
    mark('delayed SVG loading and disabled aspect-ratio cannot change plane dimensions or move overlays');

    await page.route('**/assets/town-map.svg?*',r=>r.fulfill({status:404,body:''}));await page.reload();
    assert.equal(await page.locator('.town-art-status').isVisible(),true);
    const failedFrame=await page.locator('.town-plane').boundingBox();assert.ok(Math.abs(failedFrame.height/failedFrame.width-1040/600)<.001);
    await page.locator('[data-place="mall"]').tap();assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('city-encounters-v1')))).location,'mall');
    await page.unroute('**/assets/town-map.svg?*');
    await page.route('**/assets/characters/*/portrait-default.webp',r=>r.fulfill({status:200,contentType:'image/webp',body:'broken'}));await page.reload();
    await page.waitForFunction(()=>!document.querySelector('.town-residents img'));validate(await geometry(page));
    assert.ok(await page.locator('.town-face-fallback').count()>0);await page.unroute('**/assets/characters/*/portrait-default.webp');
    mark('missing ground map and corrupt portraits retain stable geometry, readable fallbacks and working movement');
    const normalFailures=failures.filter(([,url])=>!url.includes('/assets/town-map.svg'));
    assert.deepEqual(normalFailures,[]);assert.deepEqual(errors,[]);
    assert.ok(requests.some(u=>u.includes('styles.css?v=20261029-alignment')));
    assert.ok(requests.some(u=>u.includes('js/town.js?v=20261029-alignment')));
    assert.ok(requests.some(u=>u.includes('js/app.js?v=story2')));
    assert.ok(requests.every(u=>u.startsWith(url)||u===new URL('/favicon.ico',url).href));
    mark('GitHub Pages subpath and release keys bypass stale unversioned files; no unexpected resource errors or external requests');
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({engine,checks,widths,failures,errors},null,2));
  }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
