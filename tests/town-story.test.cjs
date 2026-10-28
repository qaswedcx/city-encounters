'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../js/core.js');
const Story=require('../js/story.js');

test('21 authored events obey existing graph limits and six place IDs',()=>{
 const ids=new Set(Core.createState().characters.flatMap(c=>c.life.events.filter(e=>e.id.startsWith('story')).map(e=>e.location)));
 assert.deepEqual(Object.fromEntries(Object.entries(Story).map(([id,events])=>[id,events.length])),{ruoqing:7,yian:7,zhiyan:7});
 assert.deepEqual([...ids].sort(),['cafe','community','library','mall','market','park']);
 for(const events of Object.values(Story))events.forEach((e,i)=>{
   assert.equal(e.previous,i?'story'+i:null);
   assert.equal(e.nodes[0].choices.length,3);
   assert.ok(e.minimum<100&&e.trust<100);
 });
 const s=Core.createState();
 s.characters.forEach(c=>assert.doesNotThrow(()=>Core.validate(c.life)));
});

test('all 21 event scenes are reachable with existing weekday/weekend priority',()=>{
 const s=Core.createState();
 for(const c of s.characters)for(const e of c.life.events.filter(e=>e.id.startsWith('story'))){
   const days=Array.from({length:21},(_,i)=>i+1);
   assert.ok(days.some(day=>{const r=Core.statusAt(s,c,day,e.slot);return r.location===e.location&&!r.busy&&!r.brief;}),c.name+' '+e.id);
 }
});

for(const [index,ending] of ['戀愛成功','友情維持','暫緩'].entries())test('seven-event flow: '+ending,()=>{
 const s=Core.createState(),c=s.characters[index];
 c.familiarity=95;c.trust=90;
 for(let n=1;n<=7;n++){
  const e=c.life.events.find(x=>x.id==='story'+n);
  let selected=false;
  for(let day=s.day;day<130&&!selected;day++){
   for(let slot=day===s.day?s.slot:0;slot<3&&!selected;slot++){
    const status=Core.statusAt(s,c,day,slot);
    if(slot!==e.slot||status.location!==e.location||status.busy||status.brief)continue;
    s.day=day;s.slot=slot;s.location=e.location;Core.prepare(s,()=>.99);
    if(!Core.available(s,c,e))continue;
    Core.begin(s,c.id,'deep');
    assert.equal(c.life.pending.id,e.id);
    Core.choose(s,c.id,n===7?index:0);
    Core.choose(s,c.id,0);
    selected=true;
   }
  }
  assert.ok(selected,c.name+' '+e.id);
 }
 assert.equal(Object.keys(c.life.records).filter(k=>k.startsWith('story')).length,7);
 if(index<2)assert.equal(Core.routeStage(c),ending);
 else {assert.equal(c.life.records.story7.status,'not_occurred');assert.ok(Core.available(s,c,c.life.events.find(e=>e.id==='story7'))===false);}
});
