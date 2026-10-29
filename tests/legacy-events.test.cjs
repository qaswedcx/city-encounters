'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../js/core.js'),E=require('../js/events.js');
const bad=/先聽你的想法，尊重你的決定|今天先不推進|要求對方照我的安排|我願意記住並尊重這個約定|要求對方放棄原有生活/;
function ready(){const s=C.createState();C.prepare(s,()=>.99);for(const c of s.characters){c.familiarity=100;c.trust=100;c.life.work.type='休假';c.life.family.duties=[];c.schedule=['community','community','community'];c.life.weekend=[...c.schedule];}return s;}
function finish(s,c){while(c.life.pending){const d=C.dialogue(s,c);C.choose(s,c.id,d.choices.length?0:d.next!==undefined?'continue':'finish');}}
test('core fallback never starts superseded official arcs at any time/place or relationship stage',()=>{
 const s=ready();for(const c of s.characters){
  for(const e of c.life.events)a.doesNotMatch(JSON.stringify(e.nodes),bad);
  for(const key of ['life1','life2','key','v03-intimacy','v03-choice']){
   const e=c.life.events.find(e=>e.id===key);c.life.records=Object.fromEntries(['life1','life2','key','v03-intimacy','v03-choice'].filter(id=>id!==key).map(id=>[id,{status:'success',day:1}]));for(const location of ['community','market','mall','cafe','park','library'])for(let slot=0;slot<3;slot++){s.location=location;s.slot=slot;a.equal(C.available(s,c,e),false);}
  }
  c.life.records={};s.location='community';s.slot=0;C.begin(s,c.id,'deep');a.equal(c.life.pending.event,false);c.life.pending=null;
 }
});
test('old saved official content updates exactly, records/work/relationships survive and edited events stay authored',()=>{
 const s=ready(),c=s.characters[1];c.life.events=c.life.events.map(e=>structuredClone(E.legacy.yian.find(v=>v.id===e.id)||e));
 c.life.events.find(e=>e.id==='life2').nodes[0].text='我自己寫的小誌對話';c.life.records.life1={status:'success',day:1};
 const before=structuredClone(s),t=C.safeState(s),x=t.characters[1];a.deepEqual(s,before);a.equal(x.trust,100);a.deepEqual(x.life.records,c.life.records);a.deepEqual(x.life.work,c.life.work);
 a.doesNotMatch(JSON.stringify(x.life.events.find(e=>e.id==='life1')),bad);a.equal(x.life.events.find(e=>e.id==='life2').nodes[0].text,'我自己寫的小誌對話');a.deepEqual(C.safeState(t),t);
});
test('authored dependencies keep necessary rewritten legacy scenes reachable',()=>{
 const s=ready(),c=s.characters[1];c.life.events.push(C.event('custom','自訂展覽','來看展嗎？','好，門口見。','life1'));
 a.equal(C.available(s,c,c.life.events.find(e=>e.id==='life1')),true);C.begin(s,c.id,'deep');a.equal(c.life.pending.id,'life1');a.match(C.dialogue(s,c).choices[0].label,/主標/);finish(s,c);a.equal(c.life.records.life1.status,'success');
});
test('post-romance scenes unlock only for romance, support old couples, and cannot revive after friendship',()=>{
 const s=ready(),c=s.characters[0],e=c.life.events.find(e=>e.id==='v03-together');a.equal(C.available(s,c,e),false);
 c.life.records.key={status:'success',day:1};a.equal(C.available(s,c,e),true);c.life.records['v03-choice']={status:'not_occurred',day:1};a.equal(C.available(s,c,e),false);c.life.records['v03-choice']={status:'success',day:1};a.equal(C.available(s,c,e),true);
 c.life.records.story7={status:'not_occurred',path:'pause',day:1};a.equal(C.available(s,c,e),false);c.life.records.story7={status:'success',path:'friendship',day:1};a.equal(C.available(s,c,e),false);
 c.life.records.story7.path='romance';a.equal(C.available(s,c,e),true);C.begin(s,c.id,'deep');a.equal(c.life.pending.id,'v03-together');finish(s,c);a.equal(c.life.records['v03-together'].status,'success');
});
test('non-core default legacy upgrades and pending conversations finish once with no template labels',()=>{
 for(const node of [null,0,1]){
  const s=ready(),c=C.normalizeCharacter({name:'自訂鄰居',hobby:'攝影',schedule:['community','community','community']});s.characters=[c];C.prepare(s,()=>.99);c.life.events=[E.oldEvent('key','彼此的步調','我想談談我們，也需要你尊重攝影和我的生活。','一起把界線說清楚，再向前走。',null,true)];
  if(node!==null)c.life.pending={id:'key',node,kind:'deep',choice:'support',day:1,slot:0,location:'community',event:true};
  const t=C.safeState(s),x=t.characters[0];if(node!==null){a.doesNotMatch(JSON.stringify(C.dialogue(t,x)),bad);finish(t,x);a.equal(t.slot,1);a.throws(()=>C.choose(t,x.id,'finish'));}
  a.doesNotMatch(JSON.stringify(x.life.events),bad);a.match(x.life.events[0].nodes[0].choices[0].label,/攝影/);
 }
});
test('new general factories have contextual design/flower/baking choices and terminal outcomes',()=>{
 for(const title of ['招牌草稿','花材分類','失敗的麵團','社區攝影展']){
  const e=C.event('test',title,'可以幫我看看嗎？','一起試看看。');a.equal(e.nodes[0].choices.length,2);a.doesNotMatch(JSON.stringify(e),bad);a.equal(e.nodes[1].choices.length,0);a.equal(e.nodes[2].result,'not_occurred');
 }
});

test('every old official pending node survives reload, settles once and never replays',()=>{
 for(const [coreId,events]of Object.entries(E.legacy))for(const e of events)for(let node=0;node<e.nodes.length;node++){
  const s=ready(),c=s.characters.find(c=>c.coreId===coreId);c.life.events[c.life.events.findIndex(x=>x.id===e.id)]=structuredClone(e);
  c.life.pending={id:e.id,node,kind:'deep',choice:'support',day:1,slot:0,location:'community',event:true};
  const t=C.safeState(s),x=t.characters.find(x=>x.id===c.id);a.doesNotMatch(JSON.stringify(C.dialogue(t,x).choices),bad);finish(t,x);a.equal(t.slot,1);a.throws(()=>C.choose(t,x.id,'finish'));a.deepEqual(C.safeState(t),t);
 }
});
