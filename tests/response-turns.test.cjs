'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../js/core'),S=require('../js/story'),V2=require('../js/story-v2'),Scene=require('../js/scenes'),review=require('./fixtures/terminal-review.json');
const key=(id,e,i)=>id+'.'+e.id+':'+i;
function fixture(id,e,node=0){const s=C.createState(),c=s.characters.find(c=>c.coreId===id);s.characters=[c];s.slot=e.slot;s.location=e.location;c.trust=50;c.closeness=20;C.prepare(s,()=>.99);c.life.pending={id:e.id,node,event:true,kind:'deep',choice:null,day:1,slot:s.slot,location:s.location};return {s,c};}
test('all 21 terminal texts and performed endings match the manually reviewed natural closures',()=>{
 const seen=[];for(const [id,es]of Object.entries(S))for(const e of es)for(const [i,n]of e.nodes.entries()){
  const {s,c}=fixture(id,e,i);if(n.result){const k=key(id,e,i),r=review[k];a.ok(r,'review required for '+k);a.ok(['closed','deferred','rhetorical'].includes(r.kind));a.equal(n.awaitingReply,undefined);a.equal(n.text,r.text);a.equal(Scene.ending(s,c).reply,r.performed);seen.push(k);}
  if(n.awaitingReply){a.equal(n.result,undefined);a.equal(n.delta,undefined);a.ok(n.choices.length>=2);a.equal(Scene.ending(s,c),null);const before=JSON.stringify(s);a.throws(()=>C.choose(s,c.id,'finish'));a.equal(JSON.stringify(s),before);a.ok(Scene.get(s,c,100).line.includes(n.text)||id==='zhiyan'&&e.id==='story6');}
 }a.deepEqual(seen.sort(),Object.keys(review).sort());a.equal(seen.length,77);
});
test('15 requested replies preserve all original branches, outcomes and relationship effects',()=>{
 let replies=0;for(const [id,es]of Object.entries(S))for(const [index,e]of es.entries()){
  const old=V2[id][index],{nodes,officialVersion,...meta}=e,{nodes:before,officialVersion:version,...oldMeta}=old;a.deepEqual(meta,oldMeta);a.equal(officialVersion,3);
  before.forEach((n,i)=>{const now=nodes[i];if(!n.result){a.deepEqual(now.choices,n.choices);a.equal(now.next,n.next);return;}if(now.awaitingReply){replies++;for(const q of now.choices){a.equal(q.effect,undefined,'followup must not replace route memory');const end=nodes[q.next];a.equal(end.result,n.result);a.deepEqual(end.delta,n.delta);a.equal(end.choices.length,0);}}else{a.equal(now.result,n.result);a.deepEqual(now.delta,n.delta);}});
 }a.equal(replies,15);
});
test('every complete V3 path settles original relationship effects and time once, after the final response',()=>{
 let paths=0;for(const [id,es]of Object.entries(S))for(const e of es){function walk(i,choices){const n=e.nodes[i];if(n.next!==undefined)return walk(n.next,[...choices,'continue']);if(n.choices.length)return n.choices.forEach((q,j)=>walk(q.next,[...choices,j]));const {s,c}=fixture(id,e);for(const q of choices){C.choose(s,c.id,q);a.equal(c.trust,50);a.equal(c.closeness,20);a.equal(s.day,1);a.equal(s.slot,e.slot);}const loaded=C.safeState(s),x=loaded.characters[0];C.choose(loaded,x.id,'finish');const change=n.result.includes('failure')?-10:n.result==='success'?5:0;a.equal(x.trust,50+change+(n.delta?.trust||0));a.equal(x.closeness,20+(n.delta?.closeness||0));a.equal(loaded.slot,(e.slot+1)%3);a.equal(loaded.day,e.slot===2?2:1);const before=JSON.stringify(loaded);a.throws(()=>C.choose(loaded,x.id,'finish'));a.equal(JSON.stringify(loaded),before);a.deepEqual(C.safeState(loaded),loaded);paths++;}walk(0,[]);}a.equal(paths,77);
});
test('every V2 saved pending node migrates immediately with stable indices, route and correct beat handling',()=>{
 let total=0;for(const [id,es]of Object.entries(V2))for(const old of es)for(let i=0;i<old.nodes.length;i++)for(const beat of [0,1,2]){
  const {s,c}=fixture(id,old,i);c.life.events[c.life.events.findIndex(e=>e.id===old.id)]=structuredClone(old);c.life.pending.sceneBeat=beat;c.life.pending.choice='romance';c.life.pending.trace=['先前已選的台詞'];c.life.records.story1={status:'success',day:1,path:'respectful',reply:'保留歷史回應'};const before=JSON.stringify(s),loaded=C.safeState(s),x=loaded.characters[0],now=x.life.events.find(e=>e.id===old.id);a.equal(JSON.stringify(s),before);a.equal(now.officialVersion,3);a.deepEqual(now,S[id].find(e=>e.id===old.id));a.equal(x.life.pending.node,i);a.equal(x.life.pending.choice,'romance');a.deepEqual(x.life.pending.trace,['先前已選的台詞']);a.deepEqual(x.life.records,c.life.records);a.deepEqual(x.life.family,c.life.family);a.deepEqual(x.life.work,c.life.work);a.equal(x.trust,50);a.equal(x.closeness,20);a.equal(loaded.slot,s.slot);a.equal(loaded.day,s.day);
  const same=JSON.stringify(old.nodes[i])===JSON.stringify(now.nodes[i]);a.equal(x.life.pending.sceneBeat,same?beat:undefined);a.ok(Scene.active(x));if(now.nodes[i].awaitingReply)a.throws(()=>C.choose(loaded,x.id,'finish'));a.deepEqual(C.safeState(loaded),loaded);total++;
 }a.equal(total,276);
});
test('completed V2 records stay complete; no migration reward, replay or loss of custom content',()=>{
 for(const [id,es]of Object.entries(V2)){const {s,c}=fixture(id,es[0]);c.life.pending=null;c.life.events=c.life.events.map(e=>structuredClone(es.find(v=>v.id===e.id)||e));for(const e of es)c.life.records[e.id]={status:'success',day:1,path:'romance',scene:'old-scene',reply:'已完成的舊回應',choices:['舊選擇']};const saved=C.safeState(s),x=saved.characters[0];a.deepEqual(x.life.records,c.life.records);a.equal(x.trust,50);a.equal(x.closeness,20);for(const e of x.life.events.filter(e=>e.id.startsWith('story')))a.equal(C.available(saved,x,e),false);
 for(const modify of [e=>e.nodes[1].text+='玩家修訂',e=>e.minimum=99,e=>e.location='park',e=>e.authorNote='作者自訂']){const {s,c}=fixture(id,es[0],1),edited=structuredClone(es[0]);modify(edited);c.life.events[c.life.events.findIndex(e=>e.id===edited.id)]=edited;const t=C.safeState(s);a.deepEqual(t.characters[0].life.events.find(e=>e.id===edited.id),edited);a.equal(Scene.get(t,t.characters[0]),null);}}
});
test('awaiting replies and old pending bounds cannot be bypassed by malformed imports',()=>{
 const invalid=fixture('yian',V2.yian[0],V2.yian[0].nodes.length);invalid.c.life.events[invalid.c.life.events.findIndex(e=>e.id==='story1')]=structuredClone(V2.yian[0]);a.throws(()=>C.safeState(invalid.s),/舊版對話節點不存在/);
 for(const mutate of [n=>{n.choices=[];n.result='success';},n=>{n.choices=[];n.next=1;},n=>{n.awaitingReply='yes';}]){const {s,c}=fixture('yian',S.yian[0]);mutate(c.life.events.find(e=>e.id==='story1').nodes[1]);a.throws(()=>C.safeState(s));}
});
