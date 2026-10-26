'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../js/core.js');
const Data=require('../js/data.js');
function fixture(){
  const state=Core.createState(), c=state.characters[1];
  state.characters=[c];c.schedule=['park','park','park'];
  c.life.family.duties=[];c.life.work={type:'固定班',location:'office',days:[1,3,5],slots:[0,2],brief:false};
  Core.prepare(state,()=>.99);return {state,c};
}
test('all work types obey selected weekdays and slots; leave preserves inactive selections',()=>{
  const {state,c}=fixture();
  for(const type of ['固定班','輪班','自由接案']){
    c.life.work.type=type;
    assert.equal(Core.statusAt(state,c,1,0).location,'office');
    assert.equal(Core.statusAt(state,c,2,0).location,'park');
    assert.equal(Core.statusAt(state,c,1,1).location,'park');
    assert.equal(Core.statusAt(state,c,3,2).label,'工作中');
  }
  c.life.work.type='休假';assert.equal(Core.statusAt(state,c,1,0).location,'park');
  assert.deepEqual(c.life.work.days,[1,3,5]);
});
test('office/home remain private; public work permits only enabled brief interaction',()=>{
  const {state,c}=fixture();c.life.work.brief=true;
  for(const location of ['office','home']){c.life.work.location=location;assert.equal(Core.status(state,c).busy,true);state.location='park';assert.throws(()=>Core.begin(state,c.id,'chat'));}
  for(const p of Data.PLACES){c.life.work.location=p.id;const r=Core.status(state,c);assert.equal(r.location,p.id);assert.equal(r.busy,false);assert.equal(r.brief,true);}
  c.life.work.brief=false;assert.equal(Core.status(state,c).busy,true);
});
test('same resolver gives current position and pure weekly projections with priorities',()=>{
  const {state,c}=fixture();c.life.family.duties=[Core.rule('接送',0,'home',[3])];
  c.life.appointments=[{...Core.rule('請假參加活動',0,'library'),day:5,status:'planned'}];
  c.life.daily.changes=[Core.rule('臨時加班',0,'office')];
  const before=JSON.stringify(state);const week=Core.weekSchedule(state,c);
  assert.equal(week.length,7);assert.deepEqual(week[0].slots[0],Core.status(state,c));
  assert.equal(week[0].slots[0].priority,1);assert.equal(week[2].slots[0].priority,3);
  assert.equal(week[4].slots[0].priority,2);assert.equal(week[1].slots[0].priority,5);
  assert.equal(JSON.stringify(state),before);
});
test('weekly dates align on later weeks and never reroll or cancel future events',()=>{
  const {state,c}=fixture();state.day=10;Core.prepare(state,()=>.99);
  const original=JSON.stringify(state);const week=Core.weekSchedule(state,c);
  assert.deepEqual(week.map(d=>d.day),[8,9,10,11,12,13,14]);
  assert.equal(JSON.stringify(state),original);
});
test('v1/v2 upgrade keeps original progress; suggestions never overwrite custom work',()=>{
  for(const version of [1,2]){
    const old={version,day:9,slot:1,location:'cafe',characters:[{...Data.DEFAULTS[1],familiarity:77,trust:65}],logs:[{day:8,slot:0,message:'舊日誌'}]};
    const raw=JSON.stringify(old),up=Core.safeState(old),c=up.characters[0];
    assert.equal(c.life.work.type,'休假');assert.equal(c.familiarity,77);assert.equal(c.trust,65);
    assert.equal(up.day,9);assert.deepEqual(up.logs,old.logs);assert.equal(JSON.stringify(old),raw);
    const before=JSON.stringify(c);assert.equal(Core.suggestedWork(c).type,'自由接案');assert.equal(JSON.stringify(c),before);
  }
  const {state,c}=fixture();c.life.work.type='輪班';c.life.memories=[{day:1,text:'保留記憶'}];c.life.workReviewed=true;
  const restored=Core.safeState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored,state);
});
test('unreviewed v0.2 vacation stays untouched even when a suggestion exists',()=>{
  const {state,c}=fixture();c.life.work.type='休假';delete c.life.workReviewed;
  const raw=JSON.stringify(c.life.work);const loaded=Core.safeState(state);
  assert.equal(JSON.stringify(loaded.characters[0].life.work),raw);
  assert.equal(loaded.characters[0].life.workReviewed,undefined);
  const bad=JSON.parse(JSON.stringify(loaded));bad.characters[0].life.workReviewed='yes';assert.throws(()=>Core.safeState(bad));
});
