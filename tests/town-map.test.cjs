'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../js/core.js');
const Data=require('../js/data.js');
const Town=require('../js/town.js');
function fixture() {
  const state=Core.createState();
  Core.prepare(state,()=>.99);
  return state;
}
const shown=state=>Town.population(state).flatMap(p=>p.visible.map(r=>[r.character.id,p.id]));

test('map uses exactly the existing places, IDs and a shared non-grid ground plane',()=>{
  const state=fixture(),places=Town.population(state);
  assert.deepEqual(places.map(p=>[p.id,p.name]),Data.PLACES.map(p=>[p.id,p.name]));
  assert.deepEqual(Object.keys(Town.layout).sort(),Data.PLACES.map(p=>p.id).sort());
  assert.equal(new Set(Object.values(Town.layout).map(p=>p.y)).size,6);
});

test('work wins over leisure; only available service workers advertise an encounter',()=>{
  const state=fixture(),[florist,designer,baker]=state.characters;
  assert.deepEqual(shown(state),[[florist.id,'market'],[baker.id,'park']]);
  assert.equal(Core.status(state,designer).location,'office');
  florist.life.daily.busy=true;
  assert.ok(!shown(state).some(([id])=>id===florist.id));
  const market=Town.population(state).find(p=>p.id==='market');
  assert.equal(market.present[0].character.id,florist.id); // Busy refusal remains in the location UI.
  assert.equal(market.visible.length,0);
  assert.equal(new Set(shown(state).map(([id])=>id)).size,shown(state).length);
});

test('family duties, emergencies and appointment cancellation never create ghost heads',()=>{
  const state=fixture(),c=state.characters[0];
  c.life.appointments=[{...Core.rule('花藝課',0,'park'),day:1,status:'planned'}];
  assert.deepEqual(shown(state).filter(([id])=>id===c.id),[[c.id,'park']]);
  c.life.family.duties=[Core.rule('接小孩',1,'market')];
  state.slot=1;
  assert.ok(!shown(state).some(([id])=>id===c.id));
  state.slot=0;c.life.daily.day=0;
  Core.prepare(state,()=>0);
  assert.equal(c.life.appointments[0].status,'cancelled');
  assert.equal(Core.status(state,c).location,'home');
  assert.ok(!shown(state).some(([id])=>id===c.id));
});

test('time advance, weekend and next-day work all project the current saved schedule',()=>{
  const state=fixture(),c=state.characters[1];
  state.characters=[c];c.schedule=['library','mall','cafe'];c.life.weekend=['park','market','community'];c.life.family.duties=[];
  assert.deepEqual(shown(state),[]); // Weekday office.
  Core.advance(state);
  assert.deepEqual(shown(state),[[c.id,'mall']]);
  Core.advance(state);
  assert.deepEqual(shown(state),[[c.id,'cafe']]);
  state.day=6;state.slot=0;Core.prepare(state,()=>.99);
  assert.deepEqual(shown(state),[[c.id,'park']]);
  state.day=7;state.slot=2;Core.prepare(state,()=>.99);
  assert.deepEqual(shown(state),[[c.id,'community']]);
  Core.advance(state);Core.prepare(state,()=>.99);
  assert.deepEqual(shown(state),[]);
});

test('completing an existing dialogue updates heads with exactly one time step',()=>{
  const state=fixture(),c=state.characters[2];state.characters=[c];state.location='park';
  Core.begin(state,c.id,'greet');
  assert.deepEqual(shown(state),[[c.id,'park']]);
  Core.choose(state,c.id,0);
  assert.equal(state.slot,1);
  assert.deepEqual(shown(state),[[c.id,'market']]);
  assert.equal(c.familiarity,10);
});

test('projection does not roll future events, reveal locked event details or mutate prepared progress',()=>{
  const state=fixture(),before=JSON.stringify(state);
  const population=Town.population(state);
  assert.equal(JSON.stringify(state),before);
  assert.deepEqual(Town.population(state),population);
  const c=state.characters[0],key=c.life.events.find(e=>e.id==='story7');
  assert.equal(Core.available(state,c,key),false);
  assert.equal(c.life.pending,null);
  assert.deepEqual(c.life.records,{});
});

test('all colocated characters remain available for the location UI without duplication',()=>{
  const state=fixture();
  state.characters=Array.from({length:8},(_,i)=>{
    const c=Core.normalizeCharacter({...state.characters[i%3],id:'resident-'+i});
    c.life.work.type='休假';c.life.family.duties=[];c.schedule=['community','market','park'];
    return c;
  });
  const town=Town.population(state),community=town.find(p=>p.id==='community');
  assert.equal(community.visible.length,8);
  assert.equal(community.present.length,8);
  assert.equal(town.flatMap(p=>p.visible).length,8);
  Core.advance(state);
  assert.equal(Town.population(state).find(p=>p.id==='community').visible.length,0);
  assert.equal(Town.population(state).find(p=>p.id==='market').visible.length,8);
});
