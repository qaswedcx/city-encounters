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
    Core.prepare(state);
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
  const relationship = Core.relationship;
  function clockLabel(day = state.day, slot = state.slot) { return `第 ${day} 天 · ${TIMES[slot]}`; }
  function render() {
    $('#clock-day').textContent = `第 ${state.day} 天`;
    $('#clock-slot').textContent = `星期${['一','二','三','四','五','六','日'][(state.day-1)%7]} ${TIMES[state.slot]}`;
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
      const count = state.characters.filter(c => Core.status(state,c).location === p.id).length;
      return `<button type="button" class="place ${state.location === p.id ? 'active' : ''}" data-place="${p.id}" aria-pressed="${state.location === p.id}"><span class="place-emoji" aria-hidden="true">${p.icon}</span><strong>${p.name}</strong><small>${count ? `${count} 位人物在這裡` : '靜靜走走也很好'}</small>${state.location === p.id ? '<span class="here" aria-label="目前所在地"></span>' : ''}</button>`;
    }).join('');
    const loc = place(state.location);
    $('#place-title').textContent = `${loc.icon} ${loc.name}`;
    $('#place-description').textContent = `${clockLabel()}｜${loc.desc}`;
    const present = state.characters.filter(c => Core.status(state,c).location === state.location);
    $('#encounters').innerHTML = present.length ? present.map(c => `<article class="npc"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><div class="npc-name">${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></div><div class="npc-desc">${escape(c.trait)} · ${escape(c.job)} · ${escape(Core.status(state,c).label)}</div><span class="meta">${escape(c.marital)} · ${relationship(c)}</span></div></div>${meters(c)}${c.life.events.some(e=>Core.available(state,c,e))?'<p class="sub">對方有件事想找你談談，可選「深入交流」。</p>':''}<div class="actions"><button type="button" class="btn primary" data-interact="greet" data-id="${escape(c.id)}">打招呼</button><button type="button" class="btn secondary" data-interact="chat" data-id="${escape(c.id)}">聊天</button><button type="button" class="btn secondary" data-interact="deep" data-id="${escape(c.id)}">深入交流</button></div></article>`).join('') : '<div class="empty"><span class="big" aria-hidden="true">🍃</span>這個時段，熟悉的身影還沒出現。<br>換個地點走走，或等候下一時段。<br><button type="button" class="btn secondary" id="view-schedules">看看人物行程 ↗</button></div>';
    $('#view-schedules')?.addEventListener('click', () => navTo('people'));
  }
  const locationName = id => ({office:'辦公室',home:'居家'}[id] || place(id)?.name || '未知地點');
  function agenda(slots, current = -1) {
    return `<div class="schedule effective-schedule">${slots.map((r,slot)=>`<span class="${slot===current?'current':''}" data-agenda-slot="${slot}"><small>${TIMES[slot]}</small><strong>${escape(r.label)}</strong><br>${escape(locationName(r.location))}<small>${escape(r.reason)} · 優先${r.priority}</small>${r.brief ? `<small>${r.busy?'忙碌，暫不聊天':'可短暫互動'}</small>` : ''}</span>`).join('')}</div>`;
  }
  function showWeek(id) {
    const c = state.characters.find(c=>c.id===id); if(!c)return;
    showSheet(c.name+'的每週行程', `<p class="sub">本週固定安排與已知活動。未來的突發事件尚未決定；過去未留存的突發位置不在此重建。</p><p class="tip">優先順序：1 臨時事件（可取消約定） → 2 確定活動 → 3 家庭責任 → 4 工作 → 5 一般／週末活動。同時家庭責任依設定順序取第一項。</p>${Core.weekSchedule(state,c).map((d,i)=>`<section class="week-day"><h3>星期${'一二三四五六日'[i]} · 第 ${d.day} 天${d.day===state.day?'（今天）':''}</h3>${agenda(d.slots,d.day===state.day?state.slot:-1)}</section>`).join('')}`);
  }
  function renderPeople() {
    $('#people-list').innerHTML = state.characters.length ? state.characters.map(c => `<article class="people-card"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><h3>${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></h3><p>${escape(c.marital)} · ${escape(c.trait)} · ${escape(c.job)}</p></div></div><p class="bio">${escape(c.bio)}</p><p>目前：${escape(Core.status(state,c).label)} · ${escape(Core.status(state,c).reason)} · ${escape(locationName(Core.status(state,c).location))}</p><p>事件紀錄：${escape(Object.entries(c.life.records).map(([id,r])=>(c.life.events.find(e=>e.id===id)?.title||id)+"："+({success:"成功",not_occurred:"未發生",temporary_failure:"暫時失敗",permanent_failure:"永久失敗",missed:"永久錯過"}[r.status])).join("／"))||"尚無"}</p><p>記憶：${c.life.memories.map(m=>escape(m.text)).join("／")||"尚無"}</p><p>喜歡的事：${escape(c.hobby)}</p><span class="meta">${relationship(c)}${c.storySeen ? ' · 已收藏人物故事' : ''}</span>${c.life.work.type==='休假'&&!c.life.workReviewed?'<p class="tip">目前保留休假設定。若是舊版未設定班表，可到「編輯人物 → 工作時間」補齊；不會自動覆寫。</p>':''}${agenda([0,1,2].map(slot=>Core.statusAt(state,c,state.day,slot)),state.slot)}<button type="button" class="btn secondary" data-weekly="${escape(c.id)}">查看每週行程</button>${meters(c)}${c.life.conversations?.length ? `<p class="last-memory">最近日常：${clockLabel(c.life.conversations.at(-1).day,c.life.conversations.at(-1).slot)} · ${escape(c.life.conversations.at(-1).topic)}</p>` : c.history.length ? `<p class="last-memory">最近互動：${clockLabel(c.history.at(-1).day, c.history.at(-1).slot)} · ${escape({greet:'打招呼',chat:'聊天',deep:'深入交流'}[c.history.at(-1).kind])}</p>` : ''}<div class="actions"><button type="button" class="btn secondary" data-edit="${escape(c.id)}">編輯人物</button><button type="button" class="btn ghost" data-delete="${escape(c.id)}">刪除</button></div></article>`).join('') : '<div class="empty">城市裡還沒有角色。<br>新增一位人物，開始新的故事吧。</div>';
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
  function resumeTalk(){const c=state.characters.find(c=>c.life.pending);if(!c)return;const d=Core.dialogue(state,c);showSheet('與'+c.name+'的對話'+(d.ordinary?'（日常）':'（事件）'),`<div class="dialogue" aria-live="polite">${escape(d.text)}</div><div class="dialogue-choices">${d.choices.map((q,i)=>`<button class="btn secondary" data-life-choice="${i}">${escape(q.label)}</button>`).join('')}</div>${d.canLeave?'<button type="button" class="btn ghost" data-life-choice="leave">我得先去辦自己的事，這個問題改天再談</button>':''}<p class="sub">整段只消耗一時段。關閉會保留對話，下次點互動可繼續。</p>`);document.querySelectorAll('[data-life-choice]').forEach(b=>b.addEventListener('click',()=>{try{const done=Core.choose(state,c.id,b.dataset.lifeChoice==='leave'?'leave':Number(b.dataset.lifeChoice));persist();if(done){closeSheet();render();}else resumeTalk();}catch(e){toast(e.message);}}));}
  function talk(id,kind){try{if(!state.characters.some(c=>c.life.pending))Core.begin(state,id,kind);persist();resumeTalk();}catch(e){toast(e.message);}}
  function locationOptions(selected) { return PLACES.map(p => `<option value="${p.id}" ${selected === p.id ? 'selected' : ''}>${p.name}</option>`).join(''); }
  function workFields(x, existing) {
    const w = x.life.work;
    const checks = (name,items,chosen) => items.map(([value,label])=>`<label class="check-option"><input type="checkbox" name="${name}" value="${value}" ${chosen.includes(value)?'checked':''}><span>${label}</span></label>`).join('');
    return `<section class="work-editor" aria-labelledby="work-heading"><h3 id="work-heading">工作時間</h3><p class="sub">勾選每週班表。家庭責任與已知事件可能覆蓋工作；休假時不啟用工作班表。</p>${existing && w.type==='休假' && !x.life.workReviewed ? '<div class="tip" id="work-review">這份休假設定可能來自舊版預設，也可能是你原本的選擇。我們不會自動更改。可保留休假，或先預覽建議班表，按「儲存人物」才生效。<button type="button" class="btn secondary" id="keep-vacation">保留休假設定</button></div>' : ''}<label class="field"><span>工作型態</span><select name="work-type">${['固定班','輪班','自由接案','休假'].map(v=>`<option ${w.type===v?'selected':''}>${v}</option>`).join('')}</select></label><fieldset><legend>工作日（可複選）</legend><div class="check-grid">${checks('work-days',Array.from({length:7},(_,i)=>[i+1,'星期'+'一二三四五六日'[i]]),w.days)}</div></fieldset><fieldset><legend>工作時段（可複選）</legend><div class="check-grid">${checks('work-slots',TIMES.map((label,i)=>[i,label]),w.slots)}</div></fieldset><label class="field"><span>工作地點</span><select name="work-location">${[['office','辦公室'],['home','居家'],...PLACES.map(p=>[p.id,p.name])].map(([id,label])=>`<option value="${id}" ${w.location===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="check-option"><input type="checkbox" name="work-brief" ${w.brief?'checked':''}><span>工作時允許短暫互動</span></label><p class="sub">辦公室、居家不開放探索；即使允許短暫互動也不會在休閒地點出現。服務場所忙碌時仍可能拒絕。</p><p class="sub" id="work-summary" role="status"></p><button type="button" class="btn secondary" id="suggest-work">預覽職業建議班表</button><p class="sub" id="work-draft-status" role="status">表單變更在儲存人物後生效。</p></section>`;
  }
  function readWork(form) {
    return {type:form.get('work-type'), location:form.get('work-location'), days:form.getAll('work-days').map(Number), slots:form.getAll('work-slots').map(Number), brief:form.has('work-brief')};
  }
  function openEditor(id) {
    if(state.characters.some(c=>c.life.pending))return resumeTalk();
    const c = state.characters.find(character => character.id === id);
    const x = c || Core.normalizeCharacter({name:'',age:30,marital:'單身',trait:'溫柔慢熟',job:'',hobby:'',bio:'',emoji:'🌷',schedule:['community','cafe','park']});
    showSheet(c ? '編輯人物' : '認識一位新人物', `<form id="character-form"><div class="form-grid"><label class="field"><span>姓名</span><input name="name" required maxlength="40" value="${escape(x.name)}" placeholder="例：林若晴"></label><label class="field"><span>年齡（18–99 歲）</span><input name="age" type="number" inputmode="numeric" min="18" max="99" step="1" required value="${x.age}"></label></div><div class="form-grid"><label class="field"><span>婚姻狀態</span><select name="marital">${['已婚','單身','離婚'].map(s => `<option ${x.marital === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="field"><span>人物頭像</span><select name="emoji">${EMOJIS.map(s => `<option ${x.emoji === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div><div class="form-grid"><label class="field"><span>個性</span><input name="trait" list="trait-list" maxlength="50" required value="${escape(x.trait)}"></label><label class="field"><span>職業</span><input name="job" maxlength="50" required value="${escape(x.job)}" placeholder="例：咖啡師"></label></div><datalist id="trait-list">${window.CityData.TRAITS.map(trait => `<option value="${escape(trait)}"></option>`).join('')}</datalist><p class="sub">慢熟、敏感的人偏好循序漸進；外向的人喜歡分享；理性、務實的人重視真誠。可自訂個性文字。</p><label class="field"><span>興趣／喜好</span><input name="hobby" maxlength="70" required value="${escape(x.hobby)}" placeholder="例：咖啡與閱讀"></label><label class="field"><span>人物背景（選填）</span><textarea name="bio" maxlength="500" placeholder="描述人物的日常與故事">${escape(x.bio)}</textarea></label>${workFields(x,!!c)}<div class="section-label"><h3>平日一般行程</h3><span>工作、家庭與事件優先</span></div><div class="form-grid"><label class="field"><span>早上</span><select name="s0">${locationOptions(x.schedule[0])}</select></label><label class="field"><span>下午</span><select name="s1">${locationOptions(x.schedule[1])}</select></label></div><label class="field"><span>晚上</span><select name="s2">${locationOptions(x.schedule[2])}</select></label><div id="life-editor"></div><p id="form-error" class="error" role="alert" hidden></p><div class="form-actions"><button type="button" class="btn secondary" id="cancel-editor">取消</button><button type="submit" class="btn primary">儲存人物</button></div></form>`);
    const formNode = $('#character-form');
    const author=window.CityLifeEditor({root:$('#life-editor'),Core,escape,places:PLACES,life:x.life,character:x,state,agenda,
      work:()=>readWork(new FormData(formNode)),schedule:()=>[0,1,2].map(i=>formNode.elements['s'+i].value)});
    formNode.addEventListener('change',()=>author.preview());
    function workSummary() {
      const w = readWork(new FormData(formNode));
      $('#work-summary').textContent = w.type==='休假' ? '目前休假：保留勾選資料，但不安排工作。' : !w.days.length || !w.slots.length ? '尚未選齊工作日與時段，儲存前請至少各勾選一項。' : `${w.type} · ${w.days.map(d=>'星期'+'一二三四五六日'[d-1]).join('、')} · ${w.slots.map(i=>TIMES[i]).join('、')} · ${locationName(w.location)}`;
    }
    formNode.addEventListener('change',workSummary);workSummary();
    $('#suggest-work').addEventListener('click',()=>{
      const w=Core.suggestedWork({job:formNode.elements.job.value});
      formNode.elements['work-type'].value=w.type;formNode.elements['work-location'].value=w.location;
      formNode.querySelectorAll('[name="work-days"]').forEach(n=>n.checked=w.days.includes(Number(n.value)));
      formNode.querySelectorAll('[name="work-slots"]').forEach(n=>n.checked=w.slots.includes(Number(n.value)));
      formNode.elements['work-brief'].checked=w.brief;
      $('#work-draft-status').textContent='已填入職業建議，尚未儲存。可繼續調整或取消；不代表此人物的真實工作。';workSummary();author.preview();
    });
    $('#keep-vacation')?.addEventListener('click',()=>{formNode.elements['work-type'].value='休假';$('#work-draft-status').textContent='將保留休假設定；按儲存人物確認。';workSummary();});
    $('#cancel-editor').addEventListener('click', closeSheet);
    $('#character-form').addEventListener('submit', event => {
      event.preventDefault();
      const f = new FormData(event.currentTarget), age = Number(f.get('age'));
      const fields = ['name','trait','job','hobby'];
      let error = '';
      if (!Number.isInteger(age) || age < 18 || age > 99) error = '年齡須為 18–99 歲的整數。';
      else if (fields.some(key => !String(f.get(key)).trim())) error = '請填寫姓名、個性、職業與興趣，不能只輸入空白。';
      else if (f.get('work-type')!=='休假' && (!f.getAll('work-days').length || !f.getAll('work-slots').length)) error = '工作中的人物請至少勾選一個工作日及一個時段，或選擇休假。';
      else if (!c && state.characters.length >= 200) error = '人物上限為 200 位。';
      if (error) { $('#form-error').textContent = error; $('#form-error').hidden = false; return; }
      let life;try{life=author.read();life.work=readWork(f);life.workReviewed=true;Core.validate(life);Core.validateTalk(life);}catch(e){$('#form-error').textContent='請檢查家庭與事件設定：'+e.message;$('#form-error').hidden=false;return;}
      const data = Core.normalizeCharacter({...c, life, name:String(f.get('name')).trim(), age, marital:f.get('marital'), emoji:f.get('emoji'), trait:String(f.get('trait')).trim(), job:String(f.get('job')).trim(), hobby:String(f.get('hobby')).trim(), bio:String(f.get('bio')).trim(), schedule:[f.get('s0'),f.get('s1'),f.get('s2')]});
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
    if(state.characters.some(c=>c.life.pending))return resumeTalk();
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
    showSheet('在城市裡，慢慢認識彼此', '<div class="guide"><ol><li>選擇六個地點探索。移動不消耗時間，地點上的人數代表目前在場人物。</li><li>每人都有早上、下午、晚上的一般行程（工作與家庭優先），可在「人物圖鑑」查看。每次互動或等候會推進一時段；晚上之後是隔天早上。</li><li>從打招呼開始，循序累積熟悉度、信任度與親密度（0–100）。不同個性、關係和互動歷史會影響回應；一直只打招呼，也可能讓對方感到敷衍。</li><li>熟悉度達 25、信任度達 18 後，深入交流比較自在。過早深入或追問私事可能讓關係下降。熟悉 55、信任 45、親密 20 後，再深入交流可收藏人物故事。</li><li>在「人物圖鑑」建立、隨機新增或編輯成年人物。進度會自動儲存，也可在「相遇手記」備份或開始新遊戲。</li></ol><p class="sub">這是一座沒有終點的小城市。先試著與一位人物成為交心的朋友吧。</p></div><button class="btn primary" id="guide-done">開始散步 →</button>');
    $('#guide-done').addEventListener('click', closeSheet);
  }
  document.querySelectorAll('.nav button').forEach(button => button.addEventListener('click', () => navTo(button.dataset.screen)));
  $('#place-grid').addEventListener('click', event => { const b = event.target.closest('[data-place]'); if (b) { if(state.characters.some(c=>c.life.pending))return resumeTalk();state.location = b.dataset.place; persist(); render(); } });
  $('#encounters').addEventListener('click', event => { const b = event.target.closest('[data-interact]'); if (b) talk(b.dataset.id, b.dataset.interact); });
  $('#btn-wait').addEventListener('click', () => { if(state.characters.some(c=>c.life.pending))return resumeTalk();const day = state.day, slot = state.slot; Core.record(state, '放慢腳步，讓城市的時間流動。', day, slot); Core.advance(state); Core.prepare(state); persist(); render(); toast(`已進入${clockLabel()}，人物行程已更新。`); });
  $('#btn-add').addEventListener('click', () => state.characters.length >= 200 ? toast('人物上限為 200 位') : openEditor());
  $('#btn-random').addEventListener('click', addRandom);
  $('#people-list').addEventListener('click', event => { const weekly=event.target.closest('[data-weekly]');if(weekly)return showWeek(weekly.dataset.weekly);const edit = event.target.closest('[data-edit]'); if (edit) return openEditor(edit.dataset.edit); const del = event.target.closest('[data-delete]'); if (del) deleteCharacter(del.dataset.delete); });
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
  Core.prepare(state);persist(); render();resumeTalk();
})();

