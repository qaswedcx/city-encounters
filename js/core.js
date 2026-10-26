/* 純規則核心；不存取 DOM 或 localStorage，可於瀏覽器及 Node 執行。 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.CityCore = factory(root.CityData);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Data) {
  'use strict';
  const VERSION = 3;
  const MARITAL = ['已婚', '單身', '離婚'];
  const KINDS = ['greet', 'chat', 'deep'];
  const OUTCOMES = ['warm', 'quiet', 'repeated', 'rejected', 'boundary', 'repair', 'deep', 'story'];
  const STAT_KEYS = ['familiarity', 'trust', 'closeness'];
  const placeIds = new Set(Data.PLACES.map(p => p.id));
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const uid = () => typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : 'npc-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  const clamp = value => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const text = (value, fallback, max) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
  const pick = values => values[Math.floor(Math.random() * values.length)];

  function normalizeCharacter(value) {
    const x = isObject(value) ? value : {};
    return {
      id: text(x.id, uid(), 80),
      name: text(x.name, '未命名', 40),
      age: Math.max(18, Math.min(99, Math.round(Number(x.age) || 30))),
      marital: MARITAL.includes(x.marital) ? x.marital : '單身',
      trait: text(x.trait, '溫柔慢熟', 50),
      job: text(x.job, '自由工作者', 50),
      hobby: text(x.hobby, '散步', 70),
      bio: typeof x.bio === 'string' ? x.bio.slice(0, 500) : '',
      emoji: Data.EMOJIS.includes(x.emoji) ? x.emoji : Data.EMOJIS[0],
      schedule: [0, 1, 2].map(i => Array.isArray(x.schedule) && placeIds.has(x.schedule[i]) ? x.schedule[i] : 'community'),
      familiarity: clamp(x.familiarity), trust: clamp(x.trust), closeness: clamp(x.closeness),
      history: Array.isArray(x.history) ? x.history.slice(-20).map(h => ({...h})) : [],
      storySeen: x.storySeen === true
    };
  }

  function createState() {
    return {version:VERSION, day:1, slot:0, location:'community',
      characters:Data.DEFAULTS.map(normalizeCharacter),
      logs:[{day:1, slot:0, message:'新的生活從這座城市開始。'}]};
  }

  function assert(condition, message) { if (!condition) throw new Error(message); }
  function validTime(x) { return Number.isSafeInteger(x.day) && x.day >= 1 && [0, 1, 2].includes(x.slot); }
  function validText(x, key, max, allowEmpty = false) {
    return typeof x[key] === 'string' && x[key].length <= max && (allowEmpty || Boolean(x[key].trim()));
  }
  function validateHistory(h) {
    assert(isObject(h) && validTime(h) && KINDS.includes(h.kind) && OUTCOMES.includes(h.outcome)
      && (h.approach === undefined || ['respectful', 'intrusive'].includes(h.approach)), '人物互動紀錄格式不正確');
    return {day:h.day, slot:h.slot, kind:h.kind, approach:h.approach || 'respectful', outcome:h.outcome};
  }

  // 匯入先完整驗證，再建立獨立物件，失敗時不接觸原有進度。
  function safeState(input) {
    assert(isObject(input) && [1, 2, VERSION].includes(input.version), '不支援的存檔版本');
    assert(validTime(input) && placeIds.has(input.location), '存檔時間或地點不正確');
    assert(Array.isArray(input.characters) && input.characters.length <= 200, '存檔人物格式不正確或超過 200 位');
    assert(Array.isArray(input.logs), '存檔日誌格式不正確');
    const seen = new Set();
    const characters = input.characters.map(c => {
      assert(isObject(c), '存檔包含無效人物');
      assert(validText(c, 'name', 40) && validText(c, 'trait', 50) && validText(c, 'job', 50)
        && validText(c, 'hobby', 70) && validText(c, 'bio', 500, true), '人物必要欄位不完整');
      assert(Number.isInteger(c.age) && c.age >= 18 && c.age <= 99, '人物年齡必須為 18–99 歲整數');
      assert(MARITAL.includes(c.marital), '人物婚姻狀態不正確');
      assert(Array.isArray(c.schedule) && c.schedule.length === 3 && c.schedule.every(p => placeIds.has(p)), '人物行程必須包含三個有效地點');
      assert(STAT_KEYS.every(k => typeof c[k] === 'number' && Number.isFinite(c[k])), '人物關係數值不正確');
      assert(c.history === undefined || Array.isArray(c.history), '人物互動紀錄格式不正確');
      assert(c.storySeen === undefined || typeof c.storySeen === 'boolean', '人物劇情紀錄格式不正確');
      const normalized = normalizeCharacter(c);
      normalized.history = (c.history || []).slice(-20).map(validateHistory);
      while (seen.has(normalized.id)) normalized.id = uid();
      seen.add(normalized.id);
      return normalized;
    });
    const logs = input.logs.slice(-100).map(l => {
      assert(isObject(l) && validTime(l) && validText(l, 'message', 2000, true), '存檔日誌格式不正確');
      return {day:l.day, slot:l.slot, message:l.message};
    });
    return {version:VERSION, day:input.day, slot:input.slot, location:input.location, characters, logs};
  }

  function randomCharacter(existingCharacters = []) {
    const used = new Set(existingCharacters.map(c => c.name));
    const available = Data.NAMES.filter(n => !used.has(n));
    let name = available.length ? pick(available) : pick(Data.NAMES);
    if (!available.length) {
      let suffix = 2;
      while (used.has(name + ' ' + suffix)) suffix += 1;
      name += ' ' + suffix;
    }
    const trait = pick(Data.TRAITS), job = pick(Data.JOBS), hobby = pick(Data.HOBBIES);
    return normalizeCharacter({name, age:18 + Math.floor(Math.random() * 53), marital:pick(MARITAL),
      trait, job, hobby, emoji:pick(Data.EMOJIS),
      bio:`${name}是一位${job}，個性${trait}，平常喜歡${hobby}。最近開始參與社區活動，希望找到合適的生活節奏。`,
      schedule:[pick(Data.PLACES).id, pick(Data.PLACES).id, pick(Data.PLACES).id]});
  }

  function record(state, message, day = state.day, slot = state.slot) {
    state.logs.push({day, slot, message:String(message).slice(0, 2000)});
    state.logs = state.logs.slice(-100);
  }

  function advance(state) {
    assert(validTime(state), '遊戲時間不正確');
    assert(state.slot !== 2 || state.day < Number.MAX_SAFE_INTEGER, '遊戲天數已達上限');
    if (state.slot === 2) { state.slot = 0; state.day += 1; }
    else state.slot += 1;
  }

  function personality(c) {
    if (/慢熟|敏感|內向|細膩/.test(c.trait)) return 'reserved';
    if (/理性|務實|獨立|沉穩/.test(c.trait)) return 'pragmatic';
    if (/開朗|活潑|健談|外向|幽默/.test(c.trait)) return 'outgoing';
    return 'balanced';
  }

  function interact(state, id, kind, approach = 'respectful') {
    assert(KINDS.includes(kind) && ['respectful', 'intrusive'].includes(approach), '無效的互動方式');
    assert(validTime(state) && (state.slot !== 2 || state.day < Number.MAX_SAFE_INTEGER), '遊戲時間不正確');
    const c = state.characters.find(x => x.id === id);
    assert(c && c.schedule[state.slot] === state.location, '人物目前不在這個地點');
    const day = state.day, slot = state.slot;
    const where = Data.PLACES.find(p => p.id === state.location).name;
    const style = personality(c);
    const history = Array.isArray(c.history) ? c.history : [];
    const last = history[history.length - 1];
    const repairing = last && ['boundary', 'rejected'].includes(last.outcome);
    const repeatedGreeting = kind === 'greet' && history.length >= 2 && history.slice(-2).every(h => h.kind === 'greet');
    const repeatedDeep = kind === 'deep' && last && last.kind === 'deep' && last.day === day;
    const before = Object.fromEntries(STAT_KEYS.map(k => [k, c[k]]));
    let delta, line, outcome, milestone;

    if (approach === 'intrusive') {
      delta = {familiarity:1, trust:style === 'reserved' ? -10 : -7, closeness:-5};
      outcome = 'boundary';
      line = `你在${where}追問${c.name}不想談的私事。${style === 'outgoing' ? '原本熱絡的語氣安靜下來' : '對方往後退了一點'}：「這個話題我想保留給自己，請尊重我的選擇。」`;
    } else if (kind === 'greet') {
      if (repeatedGreeting) {
        delta = {familiarity:1, trust:-2, closeness:0}; outcome = 'repeated';
        line = `${c.name}記得你們最近總是只打招呼：「下次有空，也可以聊點別的。」短暫的寒暄顯得有些拘謹。`;
      } else if (repairing) {
        delta = {familiarity:3, trust:3, closeness:0}; outcome = 'repair';
        line = `你向${c.name}簡單問好，也為上次太急著追問道歉。對方點點頭：「謝謝你願意留一點空間。我們慢慢來。」`;
      } else {
        delta = {familiarity:style === 'outgoing' ? 7 : 6, trust:style === 'reserved' ? 1 : 2, closeness:0}; outcome = 'warm';
        const greeting = style === 'reserved' ? '輕輕點頭，記住了你的名字'
          : style === 'pragmatic' ? `簡短分享今天的${c.job}工作安排`
          : style === 'outgoing' ? '熱情揮手，順便分享街坊的一件小趣事' : '停下腳步，親切地回應';
        line = `你在${where}向${c.name}打招呼。${c.name}${greeting}。`;
        if (last && last.kind === 'greet') line += '這次對方已認得你，笑容多了一點熟悉。';
      }
    } else if (kind === 'chat') {
      if (style === 'reserved' && c.familiarity < 12 && !repairing) {
        delta = {familiarity:3, trust:-1, closeness:0}; outcome = 'quiet';
        line = `你聊起${c.hobby}，${c.name}卻還有些拘謹：「我比較慢熟，先讓我認識你一點，好嗎？」下次先簡單問好會更自在。`;
      } else if (repairing) {
        delta = {familiarity:4, trust:4, closeness:0}; outcome = 'repair';
        line = `你沒有再追問私事，改聊${c.hobby}。${c.name}察覺你記住了上次的界線，放鬆地分享了一點生活近況。`;
      } else {
        delta = {familiarity:5, trust:style === 'pragmatic' ? 6 : 5, closeness:c.trust >= 20 ? 1 : 0}; outcome = 'warm';
        line = style === 'pragmatic' ? `${c.name}從${c.job}的工作聊到${c.hobby}：「我喜歡把想法說清楚，也喜歡聽不同觀點。」你的認真回應讓對話很踏實。`
          : style === 'outgoing' ? `${c.name}興致勃勃地聊起${c.hobby}，還反過來問你的喜好。你們在${where}笑著交換生活小事，氣氛自然又輕鬆。`
          : `${c.name}慢慢聊起${c.hobby}。你留心傾聽，沒有急著接話，對方願意多說一些。`;
        if (last && last.kind === 'chat') line += '接著上次的話題，你們又多發現一個共同點。';
      }
    } else if (c.familiarity < 25 || c.trust < 18) {
      delta = {familiarity:1, trust:style === 'reserved' ? -6 : -4, closeness:-2}; outcome = 'rejected';
      line = `${c.name}${style === 'outgoing' ? '收起了玩笑' : '猶豫了一下'}：「我們還不太熟，我暫時不想談這麼深入。」先累積熟悉度 25、信任度 18，會更適合分享心事。`;
    } else if (repeatedDeep) {
      delta = {familiarity:1, trust:-3, closeness:-1}; outcome = 'rejected';
      line = `${c.name}還在整理剛才的心情：「今天先聊到這裡吧，我想休息一下。」密集的深入追問讓對方有些疲倦。`;
    } else {
      delta = {familiarity:3, trust:5, closeness:6}; outcome = 'deep';
      const personal = c.marital === '已婚' ? '「我很珍惜家人，也希望朋友能理解我的生活安排。」'
        : c.marital === '離婚' ? '「重新安排生活需要時間，能有人聽我慢慢說，我很感謝。」'
        : '「比起急著定義關係，我更想慢慢了解一個人。」';
      line = `${c.name}願意談談最近的心情。${personal}你尊重對方的步調，也分享自己的感受。`;
      if (!c.storySeen && c.familiarity + delta.familiarity >= 55 && c.trust + delta.trust >= 45 && c.closeness + delta.closeness >= 20) {
        outcome = 'story'; milestone = '心事的一頁';
        line = `${c.name}說：「我們已經很能安心地聊天了，有件事想與你分享。」\n${c.bio || `${c.name}希望把${c.job}的經驗和${c.hobby}結合，開始一個屬於自己的小計畫。`}\n${personal}你們約好，往後也會留心彼此的小小進展。`;
      }
    }
    const changes = {};
    STAT_KEYS.forEach(key => { c[key] = clamp(before[key] + delta[key]); changes[key] = c[key] - before[key]; });
    if (milestone) c.storySeen = true;
    c.history = [...history, {day, slot, kind, approach, outcome}].slice(-20);
    record(state, line, day, slot);
    advance(state);
    return {line, changes, outcome, day, slot, ...(milestone ? {milestone} : {})};
  }

  const base = {VERSION, createState, normalizeCharacter, safeState, randomCharacter, advance, record, interact};
  return (typeof module === 'object' && module.exports ? require('./life.js') : globalThis.extendCity)(base, Data);
});

