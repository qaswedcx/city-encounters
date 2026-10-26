
(() => {
  'use strict';
  const STORE = 'city-encounters-v1';
  const {TIMES,PLACES,DEFAULTS,NAMES,JOBS,TRAITS,HOBBIES,EMOJIS} = CityData;
  const {normalizeCharacter,safeState,createState} = CityCore;
  const $ = sel => document.querySelector(sel);
  const escape = x => String(x ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp = n => Math.max(0,Math.min(100,Number(n)||0));
  const place = id => PLACES.find(p=>p.id===id)||PLACES[0];
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'npc-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  let state; let readOnlySave=false;
  try { const raw=localStorage.getItem(STORE); state=raw?safeState(JSON.parse(raw)):createState(); }
  catch(e) { console.warn('無法讀取存檔，使用預設遊戲',e);state=createState();readOnlySave=true; }
  let activeScreen='map';
  function persist(){if(readOnlySave)return;try{localStorage.setItem(STORE,JSON.stringify(state));}catch(e){console.warn('無法儲存',e);toast('本機儲存失敗，請嘗試匯出備份');}}
  function toast(message){const node=$('#toast');node.textContent=message;node.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.add('hidden'),2800);}
  function clockLabel(){return `第 ${state.day} 天 · ${TIMES[state.slot]}`}
  function render(){
    $('#clock-day').textContent=`第 ${state.day} 天`;$('#clock-slot').textContent='星期'+['一','二','三','四','五','六','日'][(state.day-1)%7]+' · '+TIMES[state.slot];
    document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('selected',b.dataset.screen===activeScreen));
    ['map','people','diary'].forEach(s=>$('#screen-'+s).hidden=(s!==activeScreen));
    if(activeScreen==='map') renderMap(); if(activeScreen==='people') renderPeople(); if(activeScreen==='diary') renderDiary();
  }
  function navTo(screen){activeScreen=screen;render();window.scrollTo({top:0,behavior:'instant'});}
  function renderMap(){
    $('#place-grid').innerHTML=PLACES.map(p=>`<button type="button" class="place ${state.location===p.id?'active':''}" data-place="${p.id}" aria-pressed="${state.location===p.id}"><span class="place-emoji" aria-hidden="true">${p.icon}</span><strong>${p.name}</strong><small>${p.desc}</small>${state.location===p.id?'<span class="here">目前所在地</span>':''}</button>`).join('');
    const loc=place(state.location);$('#place-title').textContent=`${loc.icon} ${loc.name}`;$('#place-description').textContent=`${clockLabel()}｜${loc.desc}`;
    const present=state.characters.filter(c=>CityCore.status(state,c).location===state.location);
    $('#encounters').innerHTML=present.length?present.map(c=>`
      <article class="npc"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><div class="npc-name">${escape(c.name)}　<span class="muted" style="font-size:12px">${c.age} 歲</span></div><div class="npc-desc">${escape(c.trait)} · ${escape(c.job)} · ${escape(CityCore.status(state,c).label)}</div><div class="meta">${escape(c.marital)} ｜ 熟悉度 ${Math.round(c.familiarity)} · 信任 ${Math.round(c.trust)}</div></div></div>
      <div class="actions">${CityCore.keyAvailable(state,c)?`<button class="btn primary" data-interact="key" data-id="${escape(c.id)}">重要談話</button>`:""}<button class="btn primary" data-interact="greet" data-id="${escape(c.id)}">打招呼</button><button class="btn secondary" data-interact="chat" data-id="${escape(c.id)}">閒聊</button><button class="btn secondary" data-interact="deep" data-id="${escape(c.id)}" ${c.familiarity<25||c.trust<18?'disabled':''}>深入交流 🔒</button></div>
    </article>`).join(''):`<div class="empty"><span class="big">🍃</span>這個時段暫時沒有認識的人在這裡。<br>可以換個地點，或前往下一時段。</div>`;
  }
  function meter(title,value,klass){return `<div class="meter-line"><span>${title}</span><div class="track"><div class="fill ${klass}" style="width:${clamp(value)}%"></div></div><strong>${Math.round(clamp(value))}</strong></div>`;}
  function renderPeople(){
    $('#people-list').innerHTML=state.characters.length?state.characters.map(c=>`
      <article class="people-card"><div class="row"><span class="avatar" aria-hidden="true">${escape(c.emoji)}</span><div><h3>${escape(c.name)} <span class="muted" style="font-size:12px;font-weight:400">${c.age} 歲</span></h3><p>${escape(c.marital)} · ${escape(c.trait)} · ${escape(c.job)} · ${escape(CityCore.status(state,c).label)}</p></div></div>
      <p>關係：${escape(CityCore.label(c))} · 關鍵事件：${escape(c.events.key?.status||"未發生")}</p><p>目前：${escape(CityCore.status(state,c).label)} · ${escape(CityCore.status(state,c).reason)}</p><p>記憶：${c.memories.map(m=>escape(m.text)).join("／")||"尚無"}</p><p class="bio">${escape(c.bio)}</p><p>興趣：${escape(c.hobby)}</p><p>行程：早上 ${escape(place(c.schedule[0]).name)}／下午 ${escape(place(c.schedule[1]).name)}／晚上 ${escape(place(c.schedule[2]).name)}</p>
      <div class="meters">${meter('熟悉度',c.familiarity,'')}${meter('信任度',c.trust,'trust')}${meter('親密度',c.closeness,'close')}</div>
      <div class="actions"><button class="btn secondary" data-edit="${escape(c.id)}">編輯人物</button><button class="btn ghost" data-delete="${escape(c.id)}">刪除</button></div></article>`).join(''):'<div class="empty">目前沒有角色，請新增或隨機產生人物。</div>';
  }
  function renderDiary(){
    $('#log-count').textContent=`${state.logs.length} 則`;
    $('#logs').innerHTML=state.logs.length?state.logs.slice().reverse().map(l=>`<div class="diary-entry"><small>第 ${Math.round(l.day)} 天 · ${TIMES[l.slot]}</small>${escape(l.message)}</div>`).join(''):'<div class="empty">目前沒有日誌。</div>';
  }
  function advance(){CityCore.advance(state);persist();render();}
  function record(message){state.logs.push({message,day:state.day,slot:state.slot});state.logs=state.logs.slice(-100);}
  function talk(id,kind){if(state.conversation)return renderConversation();const c=state.characters.find(c=>c.id===id);if(!c)return;if(kind==='key'&&!CityCore.keyAvailable(state,c))return;CityCore.begin(state,c,kind);persist();renderConversation();}
  function renderConversation(){const d=state.conversation;if(!d)return;showSheet('相遇片刻',`<div class="dialogue" aria-live="polite">${escape(d.text)}</div><div class="actions">${d.round===0?'<button class="btn primary" data-choice="listen">先傾聽，尊重你的安排</button><button class="btn secondary" data-choice="push">要求對方照我的想法做</button><button class="btn secondary" data-choice="leave">今天先不推進</button>':'<button class="btn primary" data-choice="end">結束這次談話</button>'}</div><p class="muted">完整談話只消耗一個時段；關閉視窗會保留進度。</p>`);}
  function showSheet(title,html){$('#sheet-title').textContent=title;$('#sheet-content').innerHTML=html;$('#overlay').classList.remove('hidden');document.body.style.overflow='hidden';}
  function closeSheet(){$('#overlay').classList.add('hidden');document.body.style.overflow='';$('#sheet-content').innerHTML='';}
  function locationOptions(selected){return PLACES.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${p.name}</option>`).join('');}
  function openEditor(id){
    const c=id?state.characters.find(x=>x.id===id):null;
    const x=c||{name:'',age:30,marital:'已婚',trait:'溫柔慢熟',job:'',hobby:'',bio:'',emoji:'🌷',schedule:['community','cafe','park']};
    showSheet(c?'編輯人物':'建立新人物',`
      <form id="character-form">
      <div class="form-grid"><label class="field"><span>姓名</span><input name="name" required maxlength="40" value="${escape(x.name)}" placeholder="例：林若晴"></label><label class="field"><span>年齡（18 歲以上）</span><input name="age" type="number" min="18" max="99" required value="${x.age}"></label></div>
      <div class="form-grid"><label class="field"><span>婚姻狀態</span><select name="marital">${['已婚','單身','離婚'].map(s=>`<option ${x.marital===s?'selected':''}>${s}</option>`).join('')}</select></label><label class="field"><span>人物頭像</span><select name="emoji">${EMOJIS.map(s=>`<option ${x.emoji===s?'selected':''}>${s}</option>`).join('')}</select></label></div>
      <div class="form-grid"><label class="field"><span>性格</span><input name="trait" maxlength="50" required value="${escape(x.trait)}"></label><label class="field"><span>職業</span><input name="job" maxlength="50" required value="${escape(x.job)}" placeholder="例：咖啡師"></label></div>
      <label class="field"><span>興趣／喜好</span><input name="hobby" maxlength="70" required value="${escape(x.hobby)}" placeholder="例：看書、料理"></label>
      <label class="field"><span>人物背景（選填）</span><textarea name="bio" maxlength="500" placeholder="描述人物的生活與性格">${escape(x.bio)}</textarea></label>
      <div class="section-label"><h3>每天的出沒地點</h3><span>可隨時修改</span></div>
      <div class="form-grid"><label class="field"><span>早上</span><select name="s0">${locationOptions(x.schedule[0])}</select></label><label class="field"><span>下午</span><select name="s1">${locationOptions(x.schedule[1])}</select></label></div>
      <label class="field"><span>晚上</span><select name="s2">${locationOptions(x.schedule[2])}</select></label>
      <label class="field"><span>工作型態</span><select name="workType">${['休假','固定班','輪班','自由接案'].map(v=>`<option ${x.work?.type===v?'selected':''}>${v}</option>`).join('')}</select></label>
      <label class="field"><span>工作地點</span><select name="workPlace"><option value="office">辦公室／非開放場所</option>${locationOptions(x.work?.location)}</select></label>
      <label class="field"><span>工作星期（1–7，逗號分隔）</span><input name="workDays" value="${escape((x.work?.days||[1,2,3,4,5]).join(','))}"></label>
      <label class="field"><span>工作時段（0早／1午／2晚）</span><input name="workSlots" value="${escape((x.work?.slots||[0,1]).join(','))}"></label>
      <label class="field"><span>工作可短暫互動</span><input name="brief" type="checkbox" ${x.work?.brief?'checked':''}></label>
      <label class="field"><span>子女年齡（逗號分隔；無子女留空）</span><input name="children" value="${escape((x.family?.children||[]).join(','))}"></label>
      <label class="field"><span>家庭責任（可留空，不依婚姻推定）</span><input name="responsibility" maxlength="100" value="${escape(x.family?.responsibility||'')}"></label>
      <label class="field"><span>家庭時段（0–2）</span><input name="familySlot" type="number" min="0" max="2" value="${x.family?.slot??2}"></label>
      <label class="field"><span>個人界線</span><input name="boundaries" maxlength="100" value="${escape(x.boundaries||'尊重私人生活')}"></label>
      <details><summary>作者設定：關鍵事件條件（含劇透）</summary><label class="field"><span>最低熟悉度</span><input name="minimum" type="number" min="0" max="100" value="${x.key?.minimum??100}"></label><label class="field"><span>最低信任</span><input name="keyTrust" type="number" min="0" max="100" value="${x.key?.trust??60}"></label><label class="field"><span>本人願意發展</span><input type="checkbox" name="willing" ${x.key?.willing!==false?'checked':''}></label><label class="field"><span>失敗可日後重試</span><input type="checkbox" name="retry" ${x.key?.retry!==false?'checked':''}></label></details>
      <div class="form-actions"><button type="button" class="btn secondary" id="cancel-editor">取消</button><button type="submit" class="btn primary">儲存人物</button></div></form>`);
    $('#cancel-editor').addEventListener('click',closeSheet);
    $('#character-form').addEventListener('submit',ev=>{
      ev.preventDefault();const f=new FormData(ev.currentTarget);
      const age=Number(f.get('age'));if(!Number.isInteger(age)||age<18||age>99)return toast('年齡須為 18–99 歲');
      if(!String(f.get('name')).trim())return toast('請輸入姓名');
      const nums=n=>String(f.get(n)).trim()?String(f.get(n)).split(',').map(Number):[];if(nums('workDays').some(n=>!Number.isInteger(n)||n<1||n>7)||nums('workSlots').some(n=>!Number.isInteger(n)||n<0||n>2)||nums('children').some(n=>!Number.isInteger(n)||n<0||n>80))return toast('請檢查星期、時段及子女年齡');
      const data={...c,work:{type:f.get('workType'),location:f.get('workPlace'),days:nums('workDays'),slots:nums('workSlots'),brief:f.has('brief')},family:{children:nums('children'),responsibility:f.get('responsibility'),slot:Number(f.get('familySlot'))},boundaries:f.get('boundaries'),key:{minimum:Number(f.get('minimum')),trust:Number(f.get('keyTrust')),willing:f.has('willing'),retry:f.has('retry')},id:c?c.id:uid(),name:String(f.get('name')).trim(),age,marital:f.get('marital'),emoji:f.get('emoji'),trait:String(f.get('trait')).trim(),job:String(f.get('job')).trim(),hobby:String(f.get('hobby')).trim(),bio:String(f.get('bio')).trim(),schedule:[f.get('s0'),f.get('s1'),f.get('s2')],familiarity:c?c.familiarity:0,trust:c?c.trust:0,closeness:c?c.closeness:0};
      if(c){Object.assign(c,normalizeCharacter(data));record(`更新了 ${c.name} 的人物設定。`);}else{state.characters.push(normalizeCharacter(data));record(`新增了人物「${data.name}」。`);}
      persist();closeSheet();navTo('people');toast(c?'人物設定已更新':'新人物已建立');
    });
  }
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  function addRandom(){
    const used=new Set(state.characters.map(c=>c.name));const available=NAMES.filter(n=>!used.has(n));
    const name=available.length?pick(available):pick(NAMES)+' '+Math.floor(Math.random()*1000);
    const trait=pick(TRAITS),job=pick(JOBS),hobby=pick(HOBBIES);
    const c=normalizeCharacter({id:uid(),name,age:27+Math.floor(Math.random()*18),marital:pick(['已婚','單身','離婚']),work:{type:pick(['固定班','自由接案','輪班','休假']),location:job==='咖啡師'?'cafe':job==='服飾店經營者'?'mall':'office',days:pick([[1,2,3,4,5],[2,4,6],[3,4,5,6,7]]),slots:pick([[0,1],[1,2],[0]]),brief:job==='咖啡師'||job==='服飾店經營者'},family:{children:pick([[],[5],[8,12]]),responsibility:pick(['','陪伴家人','家務及家庭維持']),slot:2},trait,job,hobby,emoji:pick(EMOJIS),bio:`${name}是一位${job}，個性${trait}，平常喜歡${hobby}。最近剛開始在這一帶活動。`,schedule:[pick(PLACES).id,pick(PLACES).id,pick(PLACES).id],familiarity:0,trust:0,closeness:0});
    if(state.characters.length>=200)return toast('人物上限為 200 位');
    state.characters.push(c);record(`新人物「${c.name}」出現在城市中。`);persist();render();toast(`已隨機新增：${c.name}`);
  }
  function deleteCharacter(id){const c=state.characters.find(x=>x.id===id);if(!c)return;if(!confirm(`確定刪除「${c.name}」？此人物的關係數值無法復原。`))return;state.characters=state.characters.filter(x=>x.id!==id);record(`刪除了人物「${c.name}」。`);persist();render();toast('人物已刪除');}
  function exportSave(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`城市邂逅-第${state.day}天-存檔.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('已開始匯出存檔，請至「檔案」查看');
  }
  async function importSave(file){if(!file)return;try{const content=await file.text(),parsed=JSON.parse(content),loaded=safeState(parsed);if(!confirm('匯入會覆蓋目前進度，確定要繼續？'))return;state=loaded;readOnlySave=false;persist();render();toast('存檔匯入成功');}catch(e){console.warn(e);toast('匯入失敗：請使用本遊戲匯出的 JSON 存檔');}}
  document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.screen)));
  $('#place-grid').addEventListener('click',ev=>{const b=ev.target.closest('[data-place]');if(!b)return;state.location=b.dataset.place;persist();render();});
  $('#encounters').addEventListener('click',ev=>{const b=ev.target.closest('[data-interact]');if(b)talk(b.dataset.id,b.dataset.interact);});
  $('#btn-wait').addEventListener('click',()=>{advance();toast('時間已推進，人物行程已更新');});
  $('#btn-add').addEventListener('click',()=>{if(state.characters.length>=200)return toast('人物上限為 200 位');openEditor();});
  $('#btn-random').addEventListener('click',addRandom);
  $('#people-list').addEventListener('click',ev=>{let b=ev.target.closest('[data-edit]');if(b)return openEditor(b.dataset.edit);b=ev.target.closest('[data-delete]');if(b)deleteCharacter(b.dataset.delete);});
  $('#btn-export').addEventListener('click',exportSave);
  $('#btn-import').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async ev=>{await importSave(ev.target.files[0]);ev.target.value='';});
  $('#btn-reset').addEventListener('click',()=>{if(!confirm('確定重置全部人物、關係和時間進度嗎？建議先匯出存檔。'))return;state=createState();readOnlySave=false;persist();render();toast('已重新開始遊戲');});
  $('#sheet-content').addEventListener('click',ev=>{const b=ev.target.closest('[data-choice]');if(!b)return;CityCore.choose(state,b.dataset.choice);persist();if(state.conversation)renderConversation();else{closeSheet();render();}});
  $('#btn-close').addEventListener('click',closeSheet);
  $('#overlay').addEventListener('click',ev=>{if(ev.target.id==='overlay')closeSheet();});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeSheet();});
  CityCore.prepare(state);persist();render();if(state.conversation)renderConversation();
})();
