'use strict';
const {chromium}=require('playwright-core'),http=require('http'),fs=require('fs/promises'),path=require('path'),a=require('assert/strict'),C=require('../js/core.js');
const root=path.resolve(__dirname,'..'),key='city-encounters-v1';
(async()=>{const server=http.createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p==='/')p='/index.html';res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(p)]||'application/octet-stream');res.end(await fs.readFile(path.join(root,p)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);
 function fixture(path='support'){const s=C.createState(),c=s.characters[2];s.characters=[c];s.day=2;s.slot=2;s.location='cafe';c.familiarity=60;c.trust=40;for(let i=1;i<=5;i++)c.life.records['story'+i]={status:'success',day:1,path};C.prepare(s,()=>.99);return s;}
 const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 async function load(s){await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});await page.reload();await page.locator('[data-interact=deep]').tap();}
 async function read(){while(await page.locator('#recipe-next').count())await page.locator('#recipe-next').tap();}
 await fs.mkdir(path.join(root,'work','recipe'),{recursive:true});
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});await load(fixture());a.equal((await state()).characters[0].life.pending.id,'story6');a.equal(await page.locator('[data-life-choice]').count(),0);
  await page.locator('#recipe-next').tap();a.equal((await state()).slot,2);await page.reload();a.equal((await state()).characters[0].life.pending.sceneBeat,1);a.match(await page.locator('.recipe-line').innerText(),/偏酸/);
  await read();await page.locator('[data-life-choice="0"]').tap();await read();a.equal(await page.locator('.recipe-stage').getAttribute('data-expression'),'shy');
  await page.locator('.recipe-expression').evaluate(i=>i.decode());await page.locator('.recipe-background').evaluate(i=>i.decode());
  a.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('.recipe-sheet').screenshot({path:path.join(root,'work','recipe',`scene-${width}.png`),scale:'css',animations:'disabled'});
  await page.locator('[data-life-choice="0"]').tap();await read();a.equal(await page.locator('.recipe-stage').getAttribute('data-expression'),'smile');const before=await state();a.equal(before.characters[0].trust,40);await page.reload();a.equal(await page.locator('[data-life-choice="finish"]').count(),1);
  await page.locator('[data-life-choice="finish"]').tap();const done=await state();a.equal(done.day,3);a.equal(done.slot,0);a.equal(done.characters[0].life.records.story6.scene,'zhiyan-recipe-v1');await page.reload();a.deepEqual(await state(),done);
 }
 await load(fixture('respectful'));await page.locator('#recipe-next').tap();a.match(await page.locator('.recipe-line').innerText(),/舊版/);await page.locator('#btn-close').tap();
 const custom=fixture();custom.characters[0].life.events.find(e=>e.id==='story6').nodes[0].text='玩家自己的配方故事';await load(custom);a.equal(await page.locator('.recipe-stage').count(),0);a.match(await page.locator('.dialogue').innerText(),/玩家自己的/);await page.locator('#btn-close').tap();
 await page.route('**/recipe-expressions.webp',r=>r.fulfill({status:404,body:''}));await page.route('**/cafe-closing.webp',r=>r.fulfill({status:404,body:''}));await load(fixture());await page.waitForFunction(()=>!document.querySelector('.recipe-expression')&&!document.querySelector('.recipe-background'));a.equal(await page.locator('.recipe-fallback').count(),1);await page.evaluate(()=>{const b=document.querySelector('#recipe-next');b.click();b.click();b.click();});await read();await page.locator('[data-life-choice="1"]').tap();await read();await page.locator('[data-life-choice="finish"]').tap();a.equal((await state()).characters[0].life.records.story6.path,'respectful');
 a.deepEqual(errors,[]);console.log('PASS native encounter entry; four mobile widths; taste memory; shy/smile beats; reload; single time/reward; edited-event isolation; missing-art fallback');
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
