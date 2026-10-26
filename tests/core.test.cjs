'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Data = require('../js/data.js');
const Core = require('../js/core.js');

const clone = value => JSON.parse(JSON.stringify(value));
function scene(overrides = {}) {
  const state = Core.createState();
  state.characters = [Core.normalizeCharacter({...state.characters[0], schedule:['community','community','community'], ...overrides})];
  state.characters.forEach(c=>{c.life.work.type='休假';c.life.family.duties=[];c.life.weekend=[...c.schedule];c.life.daily={day:state.day,changes:[],busy:false};});
  return state;
}
// Isolate v0.1 interaction regressions from v0.2 random life events.
const meet = (state, kind, approach) => { Core.prepare(state,()=>.99); return Core.interact(state, state.characters[0].id, kind, approach); };

test('預設三位成年角色、不同性格婚姻，建立新遊戲不共用物件', () => {
  const a = Core.createState(), b = Core.createState();
  assert.equal(a.characters.length, 3);
  assert.equal(new Set(a.characters.map(c => c.marital)).size, 3);
  assert.equal(new Set(a.characters.map(c => c.trait)).size, 3);
  assert.ok(a.characters.every(c => Number.isInteger(c.age) && c.age >= 18));
  a.characters[0].schedule[0] = 'park';
  a.characters[0].trust = 99;
  assert.equal(b.characters[0].schedule[0], 'market');
  assert.equal(Data.DEFAULTS[0].trust, 4);
  assert.notEqual(a.characters[0].id, b.characters[0].id);
});

test('三時段逐日循環；各人物出現位置與行程一致', () => {
  const state = Core.createState();
  state.characters.forEach(c=>{c.life.work.type='休假';c.life.family.duties=[];c.life.weekend=[...c.schedule];});
  assert.equal(Data.PLACES.length, 6);
  for (let tick = 0; tick < 9; tick += 1) {
    assert.equal(state.day, Math.floor(tick / 3) + 1);
    assert.equal(state.slot, tick % 3);
    const c = state.characters[tick % 3];
    const correct = c.schedule[state.slot];
    state.location = Data.PLACES.find(p => p.id !== correct).id;
    Core.prepare(state,()=>.99);
    const before = clone(state);
    assert.throws(() => Core.interact(state, c.id, 'greet'), /不在/);
    assert.deepEqual(state, before, '在錯誤地點互動不可推進或改變關係');
    state.location = correct;
    Core.interact(state, c.id, 'greet');
  }
  assert.deepEqual([state.day, state.slot], [4, 0]);
});

test('互動只推進一次；回傳原時間與實際數值差、日誌和歷史', () => {
  const state = scene({trait:'開朗健談'});
  state.slot = 2;
  const c = state.characters[0], previous = clone(c);
  const result = meet(state, 'greet');
  assert.deepEqual([state.day, state.slot], [2, 0]);
  assert.deepEqual([result.day, result.slot], [1, 2]);
  for (const key of ['familiarity','trust','closeness']) assert.equal(result.changes[key], c[key] - previous[key]);
  assert.equal(c.history[0].kind, 'greet');
  assert.equal(state.logs.at(-1).message, result.line);
  assert.deepEqual([state.logs.at(-1).day, state.logs.at(-1).slot], [1, 2]);
});

test('陌生時太早深入會降低信任，仍消耗時段；尊重界線能逐步修復', () => {
  const state = scene({familiarity:6, trust:10, closeness:3});
  const c = state.characters[0];
  const rejected = meet(state, 'deep');
  assert.equal(rejected.outcome, 'rejected');
  assert.ok(rejected.changes.trust < 0);
  assert.equal(state.slot, 1);
  const repair = meet(state, 'greet');
  assert.equal(repair.outcome, 'repair');
  assert.ok(repair.changes.trust > 0);
  assert.match(repair.line, /上次/);
  assert.equal(c.history.length, 2);
});

test('慢熟、理性與外向的人對陌生閒聊有不同反應', () => {
  const results = ['溫柔慢熟','理性沉穩','開朗健談'].map(trait => meet(scene({trait, familiarity:3, trust:5}), 'chat'));
  assert.equal(new Set(results.map(r => r.line)).size, 3);
  assert.ok(results[0].changes.trust < 0);
  assert.ok(results[1].changes.trust > results[2].changes.trust);
  assert.match(results[1].line, /工作|工作者/);
});

test('自訂性格也有可玩的預設回應', () => {
  const result = meet(scene({trait:'喜歡研究城市聲音', familiarity:30, trust:20}), 'chat');
  assert.ok(result.changes.familiarity > 0);
  assert.match(result.line, /咖啡與插花/);
});

test('反覆只打招呼會改變反應並降低信任', () => {
  const state = scene({trait:'開朗健談', trust:10});
  const first = meet(state, 'greet');
  const second = meet(state, 'greet');
  const third = meet(state, 'greet');
  assert.notEqual(first.line, second.line);
  assert.equal(third.outcome, 'repeated');
  assert.ok(third.changes.trust < 0);
  assert.deepEqual([state.day, state.slot], [2, 0]);
});

test('追問私事會受挫，即使已經熟悉也需尊重人物界線', () => {
  const state = scene({familiarity:80, trust:80, closeness:50});
  const result = meet(state, 'deep', 'intrusive');
  assert.equal(result.outcome, 'boundary');
  assert.ok(result.changes.trust < 0 && result.changes.closeness < 0);
  assert.match(result.line, /尊重/);
});

test('符合條件的深入交流增加親密，密集深入會疲倦', () => {
  const state = scene({familiarity:30, trust:25});
  const first = meet(state, 'deep');
  const second = meet(state, 'deep');
  assert.equal(first.outcome, 'deep');
  assert.ok(first.changes.closeness > 0);
  assert.equal(second.outcome, 'rejected');
  assert.ok(second.changes.trust < 0);
});

test('已婚、單身、離婚設定反映在深入交流中', () => {
  const lines = ['已婚','單身','離婚'].map(marital => meet(scene({marital, familiarity:30, trust:25}), 'deep').line);
  assert.match(lines[0], /家人/);
  assert.match(lines[1], /定義關係/);
  assert.match(lines[2], /重新安排生活/);
});

test('高關係解鎖背景故事一次，備份還原後仍保留劇情紀錄', () => {
  const state = scene({familiarity:55, trust:50, closeness:20, bio:'正在籌辦社區的第一場花藝課。'});
  const result = meet(state, 'deep');
  assert.equal(result.outcome, 'story');
  assert.equal(result.milestone, '心事的一頁');
  assert.match(result.line, /第一場花藝課/);
  const restored = Core.safeState(clone(state));
  assert.equal(restored.characters[0].storySeen, true);
  Core.advance(restored);
  Core.advance(restored);
  assert.equal(meet(restored, 'deep').outcome, 'deep');
});

test('長時間遊玩維持數值 0–100、歷史 20、日誌 100 的限制', () => {
  const state = scene({trait:'開朗健談', familiarity:99, trust:99, closeness:99});
  for (let i = 0; i < 160; i += 1) {
    const result = meet(state, i % 3 === 0 ? 'greet' : i % 3 === 1 ? 'chat' : 'deep', i % 10 === 0 ? 'intrusive' : 'respectful');
    const c = state.characters[0];
    for (const key of ['familiarity','trust','closeness']) assert.ok(Number.isInteger(c[key]) && c[key] >= 0 && c[key] <= 100);
    assert.ok(Object.values(result.changes).every(Number.isFinite));
  }
  assert.equal(state.characters[0].history.length, 20);
  assert.equal(state.logs.length, 100);
  assert.deepEqual(Core.safeState(clone(state)), state);
});

test('邊界數值的回傳變化是實際差值', () => {
  const state = scene({trait:'開朗健談', familiarity:99, trust:100});
  const result = meet(state, 'greet');
  assert.deepEqual(result.changes, {familiarity:1, trust:0, closeness:0});
});

test('v1 舊存檔可升級，人物與進度保留且不修改輸入', () => {
  const old = Core.createState();
  old.version = 1; old.day = 17; old.slot = 2; old.location = 'cafe';
  old.characters.forEach(c => { delete c.history; delete c.storySeen; });
  const snapshot = clone(old);
  const upgraded = Core.safeState(old);
  assert.equal(upgraded.version, 3);
  assert.equal(upgraded.day, 17);
  assert.equal(upgraded.location, 'cafe');
  assert.deepEqual(upgraded.characters.map(c => c.name), old.characters.map(c => c.name));
  assert.ok(upgraded.characters.every(c => c.history.length === 0 && c.storySeen === false));
  assert.deepEqual(old, snapshot);
  upgraded.characters[0].schedule[0] = 'mall';
  assert.equal(old.characters[0].schedule[0], 'market');
});

test('空人物存檔有效；重複人物 ID 修復為唯一值', () => {
  const state = Core.createState();
  state.characters[1].id = state.characters[0].id;
  const restored = Core.safeState(state);
  assert.equal(new Set(restored.characters.map(c => c.id)).size, 3);
  assert.equal(Core.safeState({...state, characters:[]}).characters.length, 0);
});

test('拒絕損壞、未成年、非整數年齡及無效行程的備份', () => {
  const mutations = [
    x => { x.version = 999; },
    x => { delete x.version; },
    x => { x.day = 0; },
    x => { x.day = 1.5; },
    x => { x.slot = 3; },
    x => { x.location = 'unknown'; },
    x => { x.characters = [null]; },
    x => { x.characters = [{}]; },
    x => { x.characters[0].age = 17; },
    x => { x.characters[0].age = 18.5; },
    x => { x.characters[0].age = '32'; },
    x => { x.characters[0].schedule[1] = 'unknown'; },
    x => { x.characters[0].schedule = ['community']; },
    x => { x.characters[0].trust = 'oops'; },
    x => { x.characters[0].bio = {}; },
    x => { x.characters[0].history = [null]; },
    x => { x.characters[0].history = [{day:1,slot:0,kind:'greet',outcome:'invented'}]; },
    x => { x.logs = [null]; },
    x => { x.characters = Array.from({length:201}, () => x.characters[0]); }
  ];
  for (const mutate of mutations) {
    const bad = Core.createState(); mutate(bad);
    const snapshot = clone(bad);
    assert.throws(() => Core.safeState(bad));
    assert.deepEqual(bad, snapshot);
  }
  for (const bad of [null, [], 'hello', 5, {}]) assert.throws(() => Core.safeState(bad));
});

test('無效互動類型、手法與人物 ID 不改變進度', () => {
  const state = scene();
  const before = clone(state);
  assert.throws(() => meet(state, 'unknown'));
  assert.throws(() => meet(state, 'chat', 'unknown'));
  assert.throws(() => Core.interact(state, 'missing', 'greet'));
  assert.deepEqual(state, before);
});

test('隨機人物成年、行程完整，涵蓋婚姻狀態並可修改', () => {
  const originalRandom = Math.random;
  const generated = [];
  try {
    for (const value of [0, 0.5, 0.99]) {
      Math.random = () => value;
      generated.push(Core.randomCharacter(generated));
    }
  } finally { Math.random = originalRandom; }
  assert.equal(new Set(generated.map(c => c.marital)).size, 3);
  assert.equal(new Set(generated.map(c => c.name)).size, 3);
  assert.ok(generated.every(c => Number.isInteger(c.age) && c.age >= 18 && c.schedule.length === 3 && c.schedule.every(id => Data.PLACES.some(p => p.id === id))));
  const edited = Core.normalizeCharacter({...generated[0], name:'修改後的人物', age:28, schedule:['library','market','park']});
  assert.equal(edited.id, generated[0].id);
  assert.equal(edited.name, '修改後的人物');
  assert.deepEqual(edited.schedule, ['library','market','park']);
});

test('編輯人物保留已累積關係、互動與解鎖紀錄', () => {
  const state = scene({familiarity:55, trust:50, closeness:20});
  meet(state, 'deep');
  const original = clone(state.characters[0]);
  const edited = Core.normalizeCharacter({...original, trait:'獨立務實', job:'攝影師'});
  assert.equal(edited.trust, original.trust);
  assert.deepEqual(edited.history, original.history);
  assert.equal(edited.storySeen, true);
});

