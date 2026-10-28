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
  function townBuilding(id) {
    const body={
      community:'<path d="M9 45L60 8l51 37v78H9Z" fill="#d8b69d"/><path d="M4 46L60 4l56 42" fill="none" stroke="#8f645a" stroke-width="9"/><path d="M43 83h34v40H43Z" fill="#755b50"/><path d="M20 55h17v21H20zm64 0h17v21H84Z" fill="#9bb9b8"/>',
      market:'<path d="M5 48h110v75H5Z" fill="#ead4aa"/><path d="M1 44h118l-9 26H10Z" fill="#ac6c53"/><path d="M15 44h17l-3 26H12zm37 0h17v26H50zm37 0h17l5 26H87Z" fill="#fff0dc"/><path d="M22 82h76v41H22Z" fill="#688878"/><path d="M30 91h21v13H30zm37 0h21v13H67Z" fill="#d4dba5"/>',
      mall:'<path d="M9 13h102v110H9Z" fill="#c6cfcb"/><path d="M16 23h88v18H16zm0 27h88v18H16zm0 27h88v18H16Z" fill="#9bbab8"/><path d="M39 101h42v22H39Z" fill="#eee5d4"/><path d="M56 101v22" stroke="#80938f" stroke-width="2"/><path d="M11 9h98" stroke="#849e9c" stroke-width="7"/>',
      cafe:'<path d="M10 30h100v93H10Z" fill="#ddbca6"/><path d="M5 37h110l-12 25H17Z" fill="#946b5f"/><path d="M22 37h19l-5 25H18zm38 0h19l3 25H58Z" fill="#f8e7d6"/><path d="M25 73h35v29H25Z" fill="#aac6b8"/><path d="M76 74h21v49H76Z" fill="#725e55"/><path d="M34 16h52v17H34Z" fill="#fff3dd"/>',
      park:'<path d="M4 110Q60 80 116 110v13H4Z" fill="#b4c4a1"/><path d="M18 93V48m73 45V35" stroke="#82674c" stroke-width="8"/><circle cx="18" cy="40" r="28" fill="#739984"/><circle cx="90" cy="35" r="31" fill="#8eac7e"/><path d="M42 98h36m-32-9h28m-23 9v15m18-15v15" stroke="#876c54" stroke-width="5"/><path d="M50 125q10-20 30 0" stroke="#f6ecd8" stroke-width="9"/>',
      library:'<path d="M10 36h100v87H10Z" fill="#d9d1b8"/><path d="M3 37L60 8l57 29" fill="none" stroke="#6f8880" stroke-width="9"/><path d="M22 51h21v27H22zm28 0h21v27H50zm28 0h21v27H78Z" fill="#8fa9a7"/><path d="M42 90h36v33H42Z" fill="#6d7d72"/><path d="M60 90v33" stroke="#d8d4bc" stroke-width="3"/><path d="M19 84h82" stroke="#fff7e6" stroke-width="5"/>'
    };
    return '<svg viewBox="0 0 120 128" aria-hidden="true" focusable="false">'+body[id]+'</svg>';
  }
  function renderTown() {
    const host=$('#town-map');host.dataset.slot=String(state.slot);
    host.innerHTML='<div class="town-sky"><span class="town-sun" aria-hidden="true"></span><span class="town-time">'+clockLabel()+'</span></div><div class="town-road" aria-hidden="true"></div><div class="town-buildings">'+PLACES.map(p=>'<button type="button" class="town-site '+(state.location===p.id?'selected':'')+'" data-place="'+p.id+'" aria-pressed="'+(state.location===p.id)+'" aria-label="前往'+p.name+(state.location===p.id?'，目前位置':'')+'"><span class="town-facade">'+townBuilding(p.id)+'</span><strong>'+p.name+'</strong>'+(state.location===p.id?'<small>● 目前位置</small>':'<small>點選前往</small>')+'</button>').join('')+'</div>';
  }
  function renderMap() {
    renderTown();
    $('#place-grid').innerHTML = PLACES.map(p => {
      const count = state.characters.filter(c => Core.status(state,c).location === p.id).length;
      return `<button type="button" class="place ${state.location === p.id ? 'active' : ''}" data-place="${p.id}" aria-pressed="${state.location === p.id}"><span class="place-emoji" aria-hidden="true">${p.icon}</span><strong>${p.name}</strong><small>${count ? `${count} 位人物在這裡` : '靜靜走走也很好'}</small>${state.location === p.id ? '<span class="here" aria-label="目前所在地"></span>' : ''}</button>`;
    }).join('');
    const loc = place(state.location);
    $('#place-title').textContent = `${loc.icon} ${loc.name}`;
    $('#place-description').textContent = `${clockLabel()}｜${loc.desc}`;
    const present = state.characters.filter(c => Core.status(state,c).location === state.location);
    $('#encounters').innerHTML = present.length ? present.map(c => `<article class="npc">${art(c,Core.status(state,c).brief?'portrait-work':'portrait-default')}<div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><div class="npc-name">${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></div><div class="npc-desc">${escape(c.trait)} · ${escape(c.job)} · ${escape(Core.status(state,c).label)}</div><span class="meta">${escape(c.marital)} · ${Core.profile(c)?Core.routeStage(c):relationship(c)}</span></div></div>${meters(c)}${c.life.events.some(e=>Core.available(state,c,e))?'<p class="sub">對方有件事想找你談談，可選「深入交流」。</p>':''}<div class="actions"><button type="button" class="btn primary" data-interact="greet" data-id="${escape(c.id)}">打招呼</button><button type="button" class="btn secondary" data-interact="chat" data-id="${escape(c.id)}">聊天</button><button type="button" class="btn secondary" data-interact="deep" data-id="${escape(c.id)}">深入交流</button>${c.coreId==='zhiyan'?`<button type="button" class="btn secondary" data-ai-chat="${escape(c.id)}">AI自由聊天</button>`:''}</div></article>`).join('') : '<div class="empty"><span class="big" aria-hidden="true">🍃</span>這個時段，熟悉的身影還沒出現。<br>換個地點走走，或等候下一時段。<br><button type="button" class="btn secondary" id="view-schedules">看看人物行程 ↗</button></div>';
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
  function art(c, variant='portrait-default', scene=false) {
    const p=Core.profile(c);if(!p)return '';
    return `<figure class="character-art ${scene?'scene-art':''} art-${p.id}" role="img" aria-label="${escape(c.name)} · ${escape(p.visual['視覺關鍵詞'])}"><div class="art-placeholder"><span class="silhouette" aria-hidden="true"></span><span class="art-caption">${escape(c.name)}<small>${escape(p.theme)} · 肖像載入中</small></span></div><img src="${p.assets[variant]||p.assets['portrait-default']}" data-fallback="${p.assets['portrait-default']}" data-fallback-alt="${escape(c.name)} · 標準肖像" alt="${escape(c.name)} · ${escape(variant)}" loading="lazy"></figure>`;
  }
  // Capture non-bubbling image errors: variant → same character's default → safe silhouette.
  document.addEventListener('error',e=>{
    const img=e.target;if(!img.matches?.('.character-art img'))return;
    const figure=img.parentElement;figure.classList.remove('art-loaded');
    if(img.getAttribute('src')!==img.dataset.fallback){
      figure.classList.add('portrait-fallback');img.alt=img.dataset.fallbackAlt;img.src=img.dataset.fallback;
    }else{figure.querySelector('.art-caption small').textContent='肖像暫時無法載入';img.remove();}
  },true);
  document.addEventListener('load',e=>{if(e.target.matches?.('.character-art img')){e.target.parentElement.classList.add('art-loaded');e.target.parentElement.removeAttribute('role');e.target.parentElement.removeAttribute('aria-label');}},true);
  function dossier(c){
    const p=Core.profile(c);if(!p)return `<p class="bio">${escape(c.bio)}</p>`;
    const level=Core.profileLevel(c);
    const requirements=['初識即可閱讀','熟悉度 20','信任度 30 ＋ 首次共同事件','曖昧事件完成','戀愛成功'];
    return `<p class="character-tagline">${escape(p.tagline)}</p><p class="meta">${escape(p.theme)} · ${escape(Core.routeStage(c))}</p>${p.sections.map(([title,...lines],i)=>{const needed=[0,1,2,1,2,3][i];return `<details ${i===0?'open':''} class="profile-section"><summary>${escape(title)}${level<needed?' · 尚未解鎖':''}</summary>${level>=needed?lines.map(t=>`<p>${escape(t)}</p>`).join(''):`<p class="sub">${requirements[needed]}後，會更了解她。</p>`}</details>`;}).join('')}${level>=4?`<p class="tip">你們已認真走近彼此。新的生活仍需要一起商量，也需要保留各自的空間。</p>`:''}`;
  }
  function renderPeople() {
    const expanded=new Set([...document.querySelectorAll('[data-management][open]')].map(n=>n.dataset.management));
    const sorted=[...state.characters].sort((a,b)=>Number(!!Core.profile(b))-Number(!!Core.profile(a)));
    $('#people-list').innerHTML = sorted.length ? sorted.map(c=>`<article class="people-card ${Core.profile(c)?'core-character':''}">${art(c)}<div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><h3>${escape(c.name)} <small>${c.age} 歲</small></h3><p>${escape(c.job)} · ${escape(c.marital)}</p></div></div>${dossier(c)}<span class="meta">${escape(Core.profile(c)?Core.routeStage(c):relationship(c))}</span>${meters(c)}<details class="profile-section"><summary>已解鎖事件與回憶</summary><ul>${Object.entries(c.life.records).map(([id,r])=>`<li>${escape(c.life.events.find(e=>e.id===id)?.title||id)} · ${escape({success:'已完成',not_occurred:'維持現狀',temporary_failure:'暫時失敗',permanent_failure:'錯過／失敗',missed:'錯過'}[r.status])}</li>`).join('')||'<li>等待第一段共同經歷。</li>'}</ul>${c.life.memories.slice(-8).map(m=>`<blockquote class="memory-card"><small>第 ${m.day} 天</small><p>${escape(m.text)}</p></blockquote>`).join('')||'<p class="sub">還沒有共同回憶。</p>'}</details><details ${(!Core.profile(c)||expanded.has(c.id))?'open':''} data-management="${escape(c.id)}" class="profile-section"><summary>生活行程與人物管理</summary><p>目前：${escape(Core.status(state,c).label)} · ${escape(Core.status(state,c).reason)}</p>${agenda([0,1,2].map(slot=>Core.statusAt(state,c,state.day,slot)),state.slot)}<button type="button" class="btn secondary" data-weekly="${escape(c.id)}">查看每週行程</button><div class="actions"><button type="button" class="btn secondary" data-edit="${escape(c.id)}">編輯人物</button><button type="button" class="btn ghost" data-delete="${escape(c.id)}">刪除</button></div></details></article>`).join('') : '<div class="empty">城市裡還沒有角色，新增一位人物開始相遇。</div>';
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
  const aiChat=window.createCityAIChat({Core,getState:()=>state,showSheet,save:persist,render,toast,escape});
  function closeSheet() {
    aiChat.finish();
    if ($('#overlay').classList.contains('hidden')) return;
    $('#overlay').classList.add('hidden');
    $('#sheet-content').innerHTML = '';
    $('.app').inert = false; $('.nav').inert = false;
    document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
    const target = previousFocus?.isConnected ? previousFocus : $('.nav button.selected');
    target?.focus({preventScroll:true});
  }
  function resumeTalk(){const c=state.characters.find(c=>c.life.pending);if(!c)return;const d=Core.dialogue(state,c);showSheet('與'+c.name+'的對話'+(d.ordinary?'（日常）':'（事件）'),`${art(c,c.life.pending.event?(c.life.pending.id==='v03-together'?'scene-romance':'scene-key'):(Core.status(state,c).brief?'portrait-work':'portrait-default'),c.life.pending.event)}<div class="dialogue" aria-live="polite">${escape(d.text)}</div><div class="dialogue-choices">${d.choices.map((q,i)=>`<button class="btn secondary" data-life-choice="${i}">${escape(q.label)}</button>`).join('')}</div>${d.canLeave?'<button type="button" class="btn ghost" data-life-choice="leave">我得先去辦自己的事，這個問題改天再談</button>':''}<p class="sub">整段只消耗一時段。關閉會保留對話，下次點互動可繼續。</p>`);document.querySelectorAll('[data-life-choice]').forEach(b=>b.addEventListener('click',()=>{try{const done=Core.choose(state,c.id,b.dataset.lifeChoice==='leave'?'leave':Number(b.dataset.lifeChoice));persist();if(done){closeSheet();render();}else resumeTalk();}catch(e){toast(e.message);}}));}
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
    showSheet(c ? '編輯人物' : '認識一位新人物', `<form id="character-form"><div class="form-grid"><label class="field"><span>姓名</span><input name="name" required maxlength="40" value="${escape(x.name)}" placeholder="例：林若晴"></label><label class="field"><span>年齡（18–55 歲）</span><input name="age" type="number" inputmode="numeric" min="18" max="55" step="1" required value="${x.age}"></label></div><div class="form-grid"><label class="field"><span>婚姻狀態</span><select name="marital">${['已婚','單身','離婚'].map(s => `<option ${x.marital === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label class="field"><span>人物頭像</span><select name="emoji">${EMOJIS.map(s => `<option ${x.emoji === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div><div class="form-grid"><label class="field"><span>個性</span><input name="trait" list="trait-list" maxlength="50" required value="${escape(x.trait)}"></label><label class="field"><span>職業</span><input name="job" maxlength="50" required value="${escape(x.job)}" placeholder="例：咖啡師"></label></div><datalist id="trait-list">${window.CityData.TRAITS.map(trait => `<option value="${escape(trait)}"></option>`).join('')}</datalist><p class="sub">慢熟、敏感的人偏好循序漸進；外向的人喜歡分享；理性、務實的人重視真誠。可自訂個性文字。</p><label class="field"><span>興趣／喜好</span><input name="hobby" maxlength="70" required value="${escape(x.hobby)}" placeholder="例：咖啡與閱讀"></label><label class="field"><span>人物背景（選填）</span><textarea name="bio" maxlength="500" placeholder="描述人物的日常與故事">${escape(x.bio)}</textarea></label>${workFields(x,!!c)}<div class="section-label"><h3>平日一般行程</h3><span>工作、家庭與事件優先</span></div><div class="form-grid"><label class="field"><span>早上</span><select name="s0">${locationOptions(x.schedule[0])}</select></label><label class="field"><span>下午</span><select name="s1">${locationOptions(x.schedule[1])}</select></label></div><label class="field"><span>晚上</span><select name="s2">${locationOptions(x.schedule[2])}</select></label><div id="life-editor"></div><p id="form-error" class="error" role="alert" hidden></p><div class="form-actions"><button type="button" class="btn secondary" id="cancel-editor">取消</button><button type="submit" class="btn primary">儲存人物</button></div></form>`);
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
      if (!Number.isInteger(age) || age < 18 || age > 55) error = '年齡須為 18–55 歲的整數。';
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
  $('#town-map').addEventListener('click', event => {const b=event.target.closest('[data-place]');if(!b)return;if(state.characters.some(c=>c.life.pending))return resumeTalk();state.location=b.dataset.place;persist();render();});
  $('#place-grid').addEventListener('click', event => { const b = event.target.closest('[data-place]'); if (b) { if(state.characters.some(c=>c.life.pending))return resumeTalk();state.location = b.dataset.place; persist(); render(); } });
  $('#encounters').addEventListener('click', event => { const ai=event.target.closest('[data-ai-chat]');if(ai){aiChat.open(ai.dataset.aiChat);return;} const b = event.target.closest('[data-interact]'); if (b) talk(b.dataset.id, b.dataset.interact); });
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

