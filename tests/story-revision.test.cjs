'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../js/core.js'),S=require('../js/story.js'),V1=require('../js/story-v1.js');
function legacy(){const s=C.createState();C.prepare(s,()=>.99);s.characters.forEach(c=>{c.life.events=c.life.events.map(e=>structuredClone(V1[c.coreId].find(v=>v.id===e.id)||e));});return s;}
function pending(s,c,e,node=0){s.location=e.location;s.slot=e.slot;c.life.pending={id:e.id,node,kind:'deep',choice:null,day:s.day,slot:s.slot,location:s.location,event:true};}
test('all metadata preserved; choice counts and graph depths vary, no formula endings',()=>{
 const counts=new Set(),depths=new Set();for(const [id,es]of Object.entries(S))for(const [i,e]of es.entries()){
  const {nodes,officialVersion,...meta}=e;const {nodes:old,...before}=V1[id][i];a.deepEqual(meta,before);counts.add(nodes[0].choices.length);depths.add(nodes.length);
  a.doesNotMatch(JSON.stringify(nodes),/尊重她的決定，結束這段交流|留待下次，先結束這段交流/);
 }a.deepEqual([...counts].sort(),[2,3,4]);a.ok(depths.size>=3);
});
test('unmodified legacy upgrades while progress and edited official/custom data survive',()=>{
 const raw=legacy(),c=raw.characters[0];c.trust=73;c.life.records.story1={status:'success',day:1,path:'respectful'};c.life.memories=[{day:1,text:'舊記憶'}];
 const custom=c.life.events.find(e=>e.id==='story2');custom.nodes[0].text='我的版本';const input=JSON.stringify(raw),loaded=C.safeState(raw),x=loaded.characters[0];
 a.equal(x.life.events.find(e=>e.id==='story1').officialVersion,2);a.deepEqual(x.life.events.find(e=>e.id==='story2'),custom);a.equal(x.trust,73);a.deepEqual(x.life.work,c.life.work);a.deepEqual(x.life.family,c.life.family);a.deepEqual(x.life.records,c.life.records);a.deepEqual(x.life.memories,c.life.memories);a.equal(JSON.stringify(raw),input);a.deepEqual(C.safeState(loaded),loaded);
});
test('every legacy pending node resumes unchanged and upgrades only after settlement, once',()=>{
 for(const coreId of Object.keys(V1))for(const old of V1[coreId])for(let node=0;node<old.nodes.length;node++){
  const s=legacy(),c=s.characters.find(c=>c.coreId===coreId);pending(s,c,old,node);c.life.pending.choice=node===2?'respectful':'support';
  const loaded=C.safeState(s),x=loaded.characters.find(x=>x.id===c.id);a.deepEqual(x.life.events.find(e=>e.id===old.id),old);
  while(x.life.pending){const d=C.dialogue(loaded,x);C.choose(loaded,x.id,d.choices.length?0:d.next!==undefined?'continue':'finish');}
  a.equal(loaded.slot,(old.slot+1)%3);a.equal(x.life.events.find(e=>e.id===old.id).officialVersion,2);
  const snapshot=JSON.stringify(loaded);a.throws(()=>C.choose(loaded,x.id,'finish'));a.equal(JSON.stringify(loaded),snapshot);a.deepEqual(C.safeState(loaded),loaded);
 }
});
test('all authored branches terminate; reloadable UI finish is not a dialogue choice',()=>{
 for(const [id,es]of Object.entries(S))for(const e of es){
  function walk(node,path){const n=e.nodes[node];if(n.next!==undefined)return walk(n.next,[...path,'continue']);if(n.choices.length)return n.choices.forEach((q,i)=>walk(q.next,[...path,i]));
   const s=C.createState(),c=s.characters.find(c=>c.coreId===id);C.prepare(s,()=>.99);pending(s,c,e);const before=c.trust;
   for(const choice of path)C.choose(s,c.id,choice);
   const loaded=C.safeState(s),x=loaded.characters.find(v=>v.id===c.id),d=C.dialogue(loaded,x);a.equal(d.choices.length,0);a.ok(d.result);a.equal(x.trust,before);a.throws(()=>C.choose(loaded,x.id,0));
   const presented=require('../js/scenes.js').ending(loaded,x);C.choose(loaded,x.id,'finish');a.equal(x.life.records[e.id].status,n.result);a.equal(x.life.records[e.id].reply,presented?.reply||n.text);a.equal(loaded.slot,(e.slot+1)%3);a.throws(()=>C.choose(loaded,x.id,'finish'));
  }walk(0,[]);
 }
});
test('terminal and continuation graphs reject invalid outcomes and cycles',()=>{
 for(const mutate of [e=>e.nodes[1].result='bogus',e=>{e.nodes[1]={text:'loop',choices:[],next:1};},e=>{e.nodes[1]={text:'missing',choices:[]};},e=>{e.nodes[1].delta={trust:100};}]){
  const s=C.createState(),e=s.characters[0].life.events.find(e=>e.id==='story1');mutate(e);a.throws(()=>C.safeState(s));
 }
});

test('taste preference changes later speech without rewriting official data',()=>{const s=C.createState(),c=s.characters[2],e=c.life.events.find(e=>e.id==='story6');C.prepare(s,()=>.99);pending(s,c,e);c.life.records.story2={status:'success',day:1,path:'respectful'};a.match(C.dialogue(s,c).text,/舊版順口/);a.match(e.nodes[0].text,/偏酸/);});

test('unwilling key event never awards a romance bonus',()=>{const s=C.createState(),c=s.characters[0];C.prepare(s,()=>.99);const e=c.life.events.find(e=>e.id==='story7');e.willing=false;pending(s,c,e);C.choose(s,c.id,0);a.match(C.dialogue(s,c).text,/不能答應/);C.choose(s,c.id,'finish');a.equal(c.life.records.story7.status,'permanent_failure');a.equal(c.closeness,0);});
