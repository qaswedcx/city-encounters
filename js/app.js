/* 城市邂逅：觸控介面與本機存檔。人物詞庫和規則分別位於 data.js、core.js。 */
(() => {
  'use strict';
  const { TIMES, PLACES, EMOJIS } = window.CityData;
  const Core = window.CityCore;
  const STORE = 'city-encounters-v1'; // 保留舊鍵，載入時由核心升級資料。
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const place = id => PLACES.find(p => p.id === id);
  let state, activeScreen = 'map', protectedSave = false, unreadableSave = null;
  let previousFocus = null, scrollPosition = 0;

  function storageWarning(message) {
    $('#storage-warning').hidden = false;
    $('#storage-warning').textContent = message;
    $('#save-status').textContent = '○ 暫存遊玩，尚未儲存';
    if (unreadableSave !== null) {
      const button = document.createElement('button');
      button.textContent = '匯出無法讀取的原始存檔';
      button.addEventListener('click', () => download(unreadableSave, '城市邂逅-原始存檔.json'));
      $('#storage-warning').append(button);
    }
  }
  try {
    const raw = localStorage.getItem(STORE);
    if (raw !== null) {
      try { state = Core.safeState(JSON.parse(raw)); }
      catch (error) { protectedSave = true; unreadableSave = raw; }
    }
  } catch (error) {
    protectedSave = true;
    storageWarning('瀏覽器無法讀取本機存檔。可以繼續遊玩，請到「相遇手記」匯出 JSON 備份。');
  }
  if (!state) state = Core.createState();

  function persist() {
    if (protectedSave) {
      storageWarning(unreadableSave === null
        ? '無法讀取原本機存檔，已停止自動寫入以保護進度。目前以暫存新局遊玩；請匯入有效備份，或確認「開始新遊戲」後再儲存。'
        : '原存檔無法讀取，已保留原始資料。目前以暫存新局遊玩；請匯入有效備份，或選擇「開始新遊戲」後再儲存。');
      return false;
    }
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      $('#storage-warning').hidden = true;
      $('#save-status').textContent = '● 已自動儲存';
      return true;
    } catch (error) {
      storageWarning('本機儲存失敗，最新進度目前只保留在這個頁面。請在關閉或重新整理前，到「相遇手記」匯出 JSON 備份。');
      return false;
    }
  }
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $('#toast').classList.add('hidden'), 3500);
  }
  function relationship(c) {
    if (c.trust >= 45 && c.closeness >= 20) return '交心的朋友';
    if (c.familiarity >= 25 && c.trust >= 18) return '漸漸熟悉';
    return c.familiarity >= 10 ? '點頭之交' : '初次認識';
  }
  function clockLabel(day = state.day, slot = state.slot) { return `第 ${day} 天 · ${TIMES[slot]}`; }
  function render() {
    $('#clock-day').textContent = `第 ${state.day} 天`;
    $('#clock-slot').textContent = `${['☀', '◒', '☾'][state.slot]} ${TIMES[state.slot]}`;
    document.querySelectorAll('.nav button').forEach(button => {
      const selected = button.dataset.screen === activeScreen;
      button.classList.toggle('selected', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    ['map', 'people', 'diary'].forEach(screen => { $('#screen-' + screen).hidden = screen !== activeScreen; });
    if (activeScreen === 'map') renderMap();
    if (activeScreen === 'people') renderPeople();
    if (activeScreen === 'diary') renderDiary();
  }
  function navTo(screen) { activeScreen = screen; render(); window.scrollTo(0, 0); }
  function meter(title, value, klass = '') {
    return `<div class="meter-line"><span>${title}</span><div class="track" role="meter" aria-label="${title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><div class="fill ${klass}" style="width:${value}%"></div></div><strong>${value}</strong></div>`;
  }
  function meters(c) { return `<div class="meters">${meter('熟悉度', c.familiarity)}${meter('信任度', c.trust, 'trust')}${meter('親密度', c.closeness, 'close')}</div>`; }
  function renderMap() {
    $('#place-grid').innerHTML = PLACES.map(p => {
      const count = state.characters.filter(c => c.schedule[state.slot] === p.id).length;
      return `<button type="button" class="place ${state.location === p.id ? 'active' : ''}" data-place="${p.id}" aria-pressed="${state.location === p.id}"><span class="place-emoji" aria-hidden="true">${p.icon}</span><strong>${p.name}</strong><small>${count ? `${count} 位人物在這裡` : '靜靜走走也很好'}</small>${state.location === p.id ? '<span class="here" aria-label="目前所在地"></span>' : ''}</button>`;
    }).join('');
    const loc = place(state.location);
    $('#place-title').textContent = `${loc.icon} ${loc.name}`;
    $('#place-description').textContent = `${clockLabel()}｜${loc.desc}`;
    const present = state.characters.filter(c => c.schedule[state.slot] === state.location);
    $('#encounters').innerHTML = present.length ? present.map(c => `<article class="npc"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><div class="npc-name">${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></div><div class="npc-desc">${escape(c.trait)} · ${escape(c.job)}</div><span class="meta">${escape(c.marital)} · ${relationship(c)}</span></div></div>${meters(c)}<div class="actions"><button type="button" class="btn primary" data-interact="greet" data-id="${escape(c.id)}">打招呼</button><button type="button" class="btn secondary" data-interact="chat" data-id="${escape(c.id)}">聊天</button><button type="button" class="btn secondary" data-interact="deep" data-id="${escape(c.id)}">深入交流</button></div></article>`).join('') : '<div class="empty"><span class="big" aria-hidden="true">🍃</span>這個時段，熟悉的身影還沒出現。<br>換個地點走走，或等候下一時段。<br><button type="button" class="btn secondary" id="view-schedules">看看人物行程 ↗</button></div>';
    $('#view-schedules')?.addEventListener('click', () => navTo('people'));
  }
  function renderPeople() {
    $('#people-list').innerHTML = state.characters.length ? state.characters.map(c => `<article class="people-card"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><h3>${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></h3><p>${escape(c.marital)} · ${escape(c.trait)} · ${escape(c.job)}</p></div></div><p class="bio">${escape(c.bio)}</p><p>喜歡的事：${escape(c.hobby)}</p><span class="meta">${relationship(c)}${c.storySeen ? ' · 已收藏人物故事' : ''}</span><div class="schedule">${c.schedule.map((id, slot) => `<span class="${slot === state.slot ? 'current' : ''}"><small>${TIMES[slot]}</small>${place(id).name}</span>`).join('')}</div>${meters(c)}${c.history.length ? `<p class="last-memory">最近互動：${clockLabel(c.history.at(-1).day, c.history.at(-1).slot)} · ${escape({greet:'打招呼',chat:'聊天',deep:'深入交流'}[c.history.at(-1).kind])}</p>` : ''}<div class="actions"><button type="button" class="btn secondary" data-edit="${escape(c.id)}">編輯人物</button><button type="button" class="btn ghost" data-delete="${escape(c.id)}">刪除</button></div></article>`).join('') : '<div class="empty">城市裡還沒有角色。<br>新增一位人物，開始新的故事吧。</div>';
  }
  function renderDiary() {
    $('#log-count').textContent = `${state.logs.length} 則`;
    $('#logs').innerHTML = state.logs.slice().reverse().map(log => `<div class="diary-entry"><small>${clockLabel(log.day, log.slot)}</small>${escape(log.message)}</div>`).join('') || '<div class="empty">新的一頁，等待相遇。</div>';
  }
  function showSheet(title, html) {
    if ($('#overlay').classList.contains('hidden')) {
      previousFocus = document.activeElement;
      scrollPosition = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    }
    $('#sheet-title').textContent = title;
    $('#sheet-content').innerHTML = html;
    $('#overlay').classList.remove('hidden');
    $('.app').inert = true; $('.nav').inert = true;
    $('.sheet').scrollTop = 0;
    $('#btn-close').focus({preventScroll:true});
  }
  function closeSheet() {
    if ($('#overlay').classList.contains('hidden')) return;
    $('#overlay').classList.add('hidden');
    $('#sheet-content').innerHTML = '';
    $('.app').inert = false; $('.nav').inert = false;
    document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
    const target = previousFocus?.isConnected ? previousFocus : $('.nav button.selected');
    target?.focus({preventScroll:true});
  }
  function talk(id, kind, approach) {
    const c = state.characters.find(character => character.id === id);
    if (!c || c.schedule[state.slot] !== state.location) return;
    if (kind === 'deep' && !approach) {
      const ready = c.familiarity >= 25 && c.trust >= 18;
      showSheet(`與${c.name}深入交流`, `<p class="sub">${ready ? '你們漸漸熟悉，試著聽聽對方的心事。' : '你們還不夠熟悉。現在深入交流，對方可能感到有壓力。建議熟悉度至少 25、信任度至少 18。'}</p><div class="dialogue-choices"><button type="button" class="btn secondary" data-approach="respectful">聊聊最近的心情<small>耐心傾聽，讓對方決定分享多少。</small></button><button type="button" class="btn ghost" data-approach="intrusive">追問私人的細節<small>這可能越過界線，降低對方的信任與親密度。</small></button><button type="button" class="btn primary" id="cancel-talk">先不打擾，不消耗時間</button></div>`);
      document.querySelectorAll('[data-approach]').forEach(button => button.addEventListener('click', () => talk(id, kind, button.dataset.approach)));
      $('#cancel-talk').addEventListener('click', closeSheet);
      return;
    }
    try {
      const result = Core.interact(state, id, kind, approach || 'respectful');
      persist(); render();
      const labels = {familiarity:'熟悉度',trust:'信任度',closeness:'親密度'};
      showSheet(result.milestone ? '收藏一段新的故事' : '相遇片刻', `<p class="sub">${clockLabel(result.day, result.slot)} · ${place(state.location).name}</p><div class="dialogue">${escape(result.line)}</div><div class="delta">${Object.entries(result.changes).map(([key,value]) => `<span class="${value < 0 ? 'negative' : ''}">${labels[key]} ${value > 0 ? '+' : ''}${value}</span>`).join('')}</div><p class="sub">已進入${clockLabel()}。人物也會前往下一個行程地點。</p><button type="button" class="btn primary" style="width:100%" id="dialogue-done">繼續探索 →</button>`);
      $('#dialogue-done').addEventListener('click', closeSheet);
    } catch (error) { toast(error.message); }
  }
  function locationOptions(selected) { return PLACES.map(p => `<option value="${p.id}" ${selected === p.id ? 'selected' : ''}>${p.name}</option>`).join(''); }
  function openEditor(id) {
    const c = state.characters.find(character => character.id === id);
    const x = c || {name:'',age:30,marital:'單身',trait:'溫柔慢熟',job:'',hobby:'',bio:'',emoji:'🌷',schedule:['community','cafe','park']};
    showSheet(c ? '編輯人物' : '認識一位新人物', `<form id="character-form"><div class="form-grid"><label class="field"><span>姓名</span><input name="name" required maxlength="40" value="${escape(x.name)}" placeholder="例：林若晴"></label><label class="field"><span>年齡（18–99 歲）</span><input name="age" type="number" inputmode="numeric" min="18" max="99" step="1" required value="${x.age}"></label></div><div class="form-grid"><label class="field"><span>婚姻狀態</span><select name="marital">${['已婚','單身','離婚'].map(s => `<option ${x.marital === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="field"><span>人物頭像</span><select name="emoji">${EMOJIS.map(s => `<option ${x.emoji === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div><div class="form-grid"><label class="field"><span>個性</span><input name="trait" list="trait-list" maxlength="50" required value="${escape(x.trait)}"></label><label class="field"><span>職業</span><input name="job" maxlength="50" required value="${escape(x.job)}" placeholder="例：咖啡師"></label></div><datalist id="trait-list">${window.CityData.TRAITS.map(trait => `<option value="${escape(trait)}"></option>`).join('')}</datalist><p class="sub">慢熟、敏感的人偏好循序漸進；外向的人喜歡分享；理性、務實的人重視真誠。可自訂個性文字。</p><label class="field"><span>興趣／喜好</span><input name="hobby" maxlength="70" required value="${escape(x.hobby)}" placeholder="例：咖啡與閱讀"></label><label class="field"><span>人物背景（選填）</span><textarea name="bio" maxlength="500" placeholder="描述人物的日常與故事">${escape(x.bio)}</textarea></label><div class="section-label"><h3>每日行程</h3><span>每天依序重複</span></div><div class="form-grid"><label class="field"><span>早上</span><select name="s0">${locationOptions(x.schedule[0])}</select></label><label class="field"><span>下午</span><select name="s1">${locationOptions(x.schedule[1])}</select></label></div><label class="field"><span>晚上</span><select name="s2">${locationOptions(x.schedule[2])}</select></label><p id="form-error" class="error" role="alert" hidden></p><div class="form-actions"><button type="button" class="btn secondary" id="cancel-editor">取消</button><button type="submit" class="btn primary">儲存人物</button></div></form>`);
    $('#cancel-editor').addEventListener('click', closeSheet);
    $('#character-form').addEventListener('submit', event => {
      event.preventDefault();
      const f = new FormData(event.currentTarget), age = Number(f.get('age'));
      const fields = ['name','trait','job','hobby'];
      let error = '';
      if (!Number.isInteger(age) || age < 18 || age > 99) error = '年齡須為 18–99 歲的整數。';
      else if (fields.some(key => !String(f.get(key)).trim())) error = '請填寫姓名、個性、職業與興趣，不能只輸入空白。';
      else if (!c && state.characters.length >= 200) error = '人物上限為 200 位。';
      if (error) { $('#form-error').textContent = error; $('#form-error').hidden = false; return; }
      const data = Core.normalizeCharacter({...c, name:String(f.get('name')).trim(), age, marital:f.get('marital'), emoji:f.get('emoji'), trait:String(f.get('trait')).trim(), job:String(f.get('job')).trim(), hobby:String(f.get('hobby')).trim(), bio:String(f.get('bio')).trim(), schedule:[f.get('s0'),f.get('s1'),f.get('s2')]});
      if (c) Object.assign(c, data); else state.characters.push(data);
      Core.record(state, `${c ? '更新' : '新增'}了人物「${data.name}」。`);
      persist(); closeSheet(); navTo('people'); toast(c ? '人物設定已更新' : '新人物已建立');
    });
  }
  function addRandom() {
    if (state.characters.length >= 200) return toast('人物上限為 200 位');
    const c = Core.randomCharacter(state.characters);
    state.characters.push(c); Core.record(state, `新人物「${c.name}」出現在城市中。`);
    persist(); render(); toast(`已隨機新增「${c.name}」，可點選編輯修改設定。`);
  }
  function deleteCharacter(id) {
    const c = state.characters.find(character => character.id === id);
    if (!c || !confirm(`確定刪除「${c.name}」？人物設定、互動歷史與關係數值將移除。`)) return;
    state.characters = state.characters.filter(character => character.id !== id);
    Core.record(state, `刪除了人物「${c.name}」。`); persist(); render(); toast('人物已刪除');
  }
  function download(content, filename) {
    const url = URL.createObjectURL(new Blob([content], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function exportSave() {
    const content = JSON.stringify(state, null, 2);
    download(content, `城市邂逅-第${state.day}天-存檔.json`);
    showSheet('備份你的城市', '<p class="sub">已送出 JSON 下載。如果 Safari 顯示預覽，請用分享選單「儲存到檔案」。也可以複製下方完整備份文字，另存為 .json。</p><label class="field"><span>完整 JSON 備份</span><textarea readonly class="backup-text" id="backup-text" aria-label="完整 JSON 備份"></textarea></label><button type="button" class="btn primary" id="backup-done">完成</button>');
    $('#backup-text').value = content;
    $('#backup-text').addEventListener('click', event => event.target.select());
    $('#backup-done').addEventListener('click', closeSheet);
  }
  async function importSave(file) {
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('檔案超過 2 MB，請選擇本遊戲匯出的備份。');
      const loaded = Core.safeState(JSON.parse(await file.text()));
      if (!confirm('匯入將取代目前的人物、關係和時間進度，確定繼續？')) return;
      state = loaded; protectedSave = false; unreadableSave = null;
      const saved = persist(); render();
      toast(saved ? '存檔匯入成功' : '已載入備份；本機儲存失敗，請保留原備份。');
    } catch (error) { toast('匯入失敗，原進度未變更。請使用有效的城市邂逅 JSON 備份。'); }
  }
  function guide() {
    showSheet('在城市裡，慢慢認識彼此', '<div class="guide"><ol><li>選擇六個地點探索。移動不消耗時間，地點上的人數代表目前在場人物。</li><li>每人都有早上、下午、晚上的固定行程，可在「人物圖鑑」查看。每次互動或等候會推進一時段；晚上之後是隔天早上。</li><li>從打招呼開始，循序累積熟悉度、信任度與親密度（0–100）。不同個性、關係和互動歷史會影響回應；一直只打招呼，也可能讓對方感到敷衍。</li><li>熟悉度達 25、信任度達 18 後，深入交流比較自在。過早深入或追問私事可能讓關係下降。熟悉 55、信任 45、親密 20 後，再深入交流可收藏人物故事。</li><li>在「人物圖鑑」建立、隨機新增或編輯成年人物。進度會自動儲存，也可在「相遇手記」備份或開始新遊戲。</li></ol><p class="sub">這是一座沒有終點的小城市。先試著與一位人物成為交心的朋友吧。</p></div><button class="btn primary" id="guide-done">開始散步 →</button>');
    $('#guide-done').addEventListener('click', closeSheet);
  }
  document.querySelectorAll('.nav button').forEach(button => button.addEventListener('click', () => navTo(button.dataset.screen)));
  $('#place-grid').addEventListener('click', event => { const b = event.target.closest('[data-place]'); if (b) { state.location = b.dataset.place; persist(); render(); } });
  $('#encounters').addEventListener('click', event => { const b = event.target.closest('[data-interact]'); if (b) talk(b.dataset.id, b.dataset.interact); });
  $('#btn-wait').addEventListener('click', () => { const day = state.day, slot = state.slot; Core.record(state, '放慢腳步，讓城市的時間流動。', day, slot); Core.advance(state); persist(); render(); toast(`已進入${clockLabel()}，人物行程已更新。`); });
  $('#btn-add').addEventListener('click', () => state.characters.length >= 200 ? toast('人物上限為 200 位') : openEditor());
  $('#btn-random').addEventListener('click', addRandom);
  $('#people-list').addEventListener('click', event => { const edit = event.target.closest('[data-edit]'); if (edit) return openEditor(edit.dataset.edit); const del = event.target.closest('[data-delete]'); if (del) deleteCharacter(del.dataset.delete); });
  $('#btn-export').addEventListener('click', exportSave);
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async event => { await importSave(event.target.files[0]); event.target.value = ''; });
  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('開始新遊戲會重設全部人物、關係與進度。建議先匯出備份。確定繼續？')) return;
    state = Core.createState(); protectedSave = false; unreadableSave = null;
    const saved = persist(); navTo('map'); toast(saved ? '新的一天，從這裡開始。' : '已開始暫存新遊戲，請留意存檔提示。');
  });
  $('#btn-guide').addEventListener('click', guide);
  $('#btn-close').addEventListener('click', closeSheet);
  $('#overlay').addEventListener('click', event => { if (event.target.id === 'overlay') closeSheet(); });
  document.addEventListener('keydown', event => {
    if ($('#overlay').classList.contains('hidden')) return;
    if (event.key === 'Escape') closeSheet();
    if (event.key === 'Tab') {
      const elements = [...$('.sheet').querySelectorAll('button,input,select,textarea,a[href]')].filter(node => !node.disabled && !node.hidden);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  persist(); render();
})();
