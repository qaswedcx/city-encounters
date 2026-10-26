/* Zero-code authoring: edits a private draft until the enclosing character form saves. */
window.CityLifeEditor = function mountLifeEditor(config) {
  'use strict';
  const {root,Core,escape:e,places}=config;
  const draft=JSON.parse(JSON.stringify(config.life));
  const locations=[['home','居家'],['office','辦公室'],...places.map(p=>[p.id,p.name])];
  const results=[['not_occurred','未發生／不推進'],['success','成功'],['temporary_failure','暫時失敗'],['permanent_failure','永久失敗'],['missed','永久錯過']];
  const get=path=>path.split('.').reduce((o,k)=>o[k],draft);
  function set(path,value){const keys=path.split('.'),last=keys.pop();const obj=keys.reduce((o,k)=>o[k],draft);obj[last]=value;}
  const button=(action,label,extra='',disabled=false)=>`<button type="button" class="btn secondary" data-editor-action="${action}" ${extra} ${disabled?'disabled':''}>${label}</button>`;
  function field(path,label,type='text',extra=''){
    const v=get(path),attrs=`data-editor-field="${path}" ${extra}`;
    return `<label class="field"><span>${label}</span>${type==='textarea'?`<textarea ${attrs} maxlength="2000">${e(v)}</textarea>`:`<input ${attrs} type="${type}" value="${e(v??'')}" ${type==='text'?'maxlength="200"':''}>`}</label>`;
  }
  const select=(path,label,options)=>`<label class="field"><span>${label}</span><select data-editor-field="${path}">${options.map(([v,label])=>`<option value="${e(v??'')}" ${get(path)===v?'selected':''}>${e(label)}</option>`).join('')}</select></label>`;
  const check=(path,label)=>`<label class="check-option"><input type="checkbox" data-editor-field="${path}" ${get(path)?'checked':''}><span>${label}</span></label>`;
  function days(path){return `<fieldset><legend>每週日期</legend><div class="check-grid">${Array.from({length:7},(_,i)=>`<label class="check-option"><input type="checkbox" data-editor-days="${path}" value="${i+1}" ${get(path).includes(i+1)?'checked':''}><span>星期${'一二三四五六日'[i]}</span></label>`).join('')}</div></fieldset>`;}
  const time=path=>select(path,'時段',[[0,'早上'],[1,'下午'],[2,'晚上']]);
  function rule(path,index,appointment=false){
    return `<fieldset class="author-row"><legend>${appointment?'活動':'家庭行程'} ${index+1}</legend>${field(path+'.label','內容（例如接送小孩、採買、料理、家務、照顧家人）')}${appointment?field(path+'.day','遊戲第幾天','number','min="1" step="1"'):days(path+'.days')}${time(path+'.slot')}${select(path+'.location','地點',locations)}${appointment?select(path+'.status','約定狀態',[['planned','已確定'],['completed','已完成'],['cancelled','已取消']]):''}${button(appointment?'remove-appointment':'remove-duty','移除此項',`data-index="${index}"`)}</fieldset>`;
  }
  function choice(eventIndex,nodeIndex,choiceIndex){
    const path=`events.${eventIndex}.nodes.${nodeIndex}.choices.${choiceIndex}`,q=get(path),nodes=draft.events[eventIndex].nodes;
    const nextOptions=nodes.map((n,i)=>[i,`對話 ${i+1}：${n.text.slice(0,12)}`]).filter(([i])=>i!==nodeIndex);
    return `<div class="author-choice">${field(path+'.label','玩家說的話／採取的行動')}<label class="field"><span>選擇後的走向</span><select data-editor-mode="${path}"><option value="result" ${q.next===undefined?'selected':''}>設定事件結果</option><option value="next" ${q.next!==undefined?'selected':''} ${nextOptions.length?'':'disabled'}>接到另一段對話</option></select></label>${q.next!==undefined?select(path+'.next','下一段對話',nextOptions):select(path+'.result','設定結果',results)}${button('remove-choice','移除此選項',`data-event="${eventIndex}" data-node="${nodeIndex}" data-index="${choiceIndex}"`,get(`events.${eventIndex}.nodes.${nodeIndex}.choices`).length===1)}</div>`;
  }
  function authoredEvent(event,index){
    const path='events.'+index,record=draft.records[event.id];
    const used=!!record||draft.events.some(other=>other.previous===event.id);
    return `<details class="author-event" data-author-panel="${e(event.id)}"><summary>事件 ${index+1}：${e(event.title)}${record?'（保留既有紀錄）':''}</summary>${field(path+'.title','事件名稱')}${check(path+'.key','這是進一步關係的關鍵事件')}${select(path+'.previous','前置事件（需成功）',[[null,'無'],...draft.events.filter(v=>v.id!==event.id).map(v=>[v.id,v.title])])}<div class="form-grid">${field(path+'.minimum','最低熟悉度','number','min="0" max="100" step="1"')}${field(path+'.trust','最低信任度','number','min="0" max="100" step="1"')}</div>${select(path+'.location','觸發地點',[[null,'不限地點'],...places.map(p=>[p.id,p.name])])}${select(path+'.slot','觸發時段',[[null,'不限時段'],[0,'早上'],[1,'下午'],[2,'晚上']])}${field(path+'.deadline','最晚遊戲日（留空表示無期限）','number','min="1" step="1" data-editor-nullable')}${check(path+'.willing','人物願意考慮進一步發展')}${check(path+'.retry','失敗後允許日後重試')}<p class="sub">達到條件仍須完成事件並取得本人同意。已保存的成功、拒絕或失敗不會因編輯而重置。</p>${event.nodes.map((node,i)=>`<fieldset class="author-node"><legend>對話 ${i+1}</legend>${field(path+'.nodes.'+i+'.text','人物台詞','textarea')}${node.choices.map((_,j)=>choice(index,i,j)).join('')}${button('add-choice','新增選項',`data-event="${index}" data-node="${i}"`,node.choices.length>=6)}${button('remove-node','刪除這段對話',`data-event="${index}" data-node="${i}"`,i===0)}</fieldset>`).join('')}${button('add-node','新增對話',`data-event="${index}"`,event.nodes.length>=30)}${button('remove-event','移除此事件',`data-index="${index}"`,used)}${used?'<p class="sub">此事件已有紀錄或被其他事件引用，請保留。</p>':''}</details>`;
  }
  function render(){
    const expanded=new Set([...root.querySelectorAll('[data-author-panel][open]')].map(n=>n.dataset.authorPanel));
    root.innerHTML=`<section class="visual-editor"><h3>家庭與子女</h3><p class="sub">婚姻不決定是否有子女或照顧責任。下方可自行新增安排。</p><label class="field"><span>子女人數</span><input type="number" name="child-count" min="0" max="20" step="1" value="${draft.family.children.length}" data-editor-child-count></label><div class="form-grid">${draft.family.children.map((_,i)=>field('family.children.'+i,`第 ${i+1} 位子女年齡`,'number','min="0" max="80" step="1"')).join('')}</div>${draft.family.duties.map((_,i)=>rule('family.duties.'+i,i)).join('')}${button('add-duty','新增家庭行程','',draft.family.duties.length>=20)}<h3>週末活動</h3>${[0,1,2].map(i=>select('weekend.'+i,['早上','下午','晚上'][i],places.map(p=>[p.id,p.name]))).join('')}<h3>確定活動與約定</h3>${draft.appointments.map((_,i)=>rule('appointments.'+i,i,true)).join('')}${button('add-appointment','新增活動／約定','',draft.appointments.length>=100)}<h3>談話與界線</h3>${field('mood','當前心情')}${field('boundary','個人界線')}<h3>行程優先順序預覽</h3><p class="sub">臨時事件 → 確定活動 → 家庭 → 工作 → 平日／週末活動。同時家庭責任取上方第一項。預覽不生成未知事件。</p><div data-editor-preview></div><details data-author-panel="events"><summary>進階模式：人物專屬事件</summary><p class="sub">用中文表單編排對話，無需JSON。一般結尾可只留一個完成按鈕；其他選項請寫明不同的話、行動或結果。事件欄位會揭示作者設定。</p>${draft.events.map(authoredEvent).join('')}${button('add-event','新增專屬事件','',draft.events.length>=30)}</details></section>`;
    root.querySelectorAll('[data-author-panel]').forEach(n=>n.open=expanded.has(n.dataset.authorPanel));
    preview();
  }
  function preview(){
    const node=root.querySelector('[data-editor-preview]');if(!node)return;
    const current={...config.character,schedule:config.schedule(),life:{...draft,work:config.work()}};
    const expanded=new Set([...node.querySelectorAll('details[open]')].map(n=>n.dataset.previewDay));
    node.innerHTML=Core.weekSchedule(config.state,current).map((d,i)=>`<details data-preview-day="${d.day}"><summary>星期${'一二三四五六日'[i]}</summary>${config.agenda(d.slots)}</details>`).join('');
    node.querySelectorAll('details').forEach(n=>n.open=expanded.has(n.dataset.previewDay));
  }
  function update(event){
    const el=event.target;
    if(el.matches('[data-editor-child-count]')){
      const n=Number(el.value);if(!Number.isInteger(n)||n<0||n>20){el.setCustomValidity('請填寫0–20的整數');return;}el.setCustomValidity('');
      draft.family.children=Array.from({length:n},(_,i)=>draft.family.children[i]??0);render();return;
    }
    if(el.dataset.editorDays){const path=el.dataset.editorDays;set(path,[...root.querySelectorAll(`[data-editor-days="${path}"]:checked`)].map(n=>Number(n.value)));preview();return;}
    if(el.dataset.editorMode){const q=get(el.dataset.editorMode);if(el.value==='next'){delete q.result;q.next=draft.events[Number(el.dataset.editorMode.split('.')[1])].nodes.findIndex((_,i)=>i!==Number(el.dataset.editorMode.split('.')[3]));}else{delete q.next;q.result='not_occurred';}render();return;}
    const path=el.dataset.editorField;if(!path)return;
    let value=el.type==='checkbox'?el.checked:el.type==='number'?el.value===''&&el.hasAttribute('data-editor-nullable')?null:Number(el.value):el.value;
    if(path.endsWith('.previous')||path.endsWith('.location')&&path.startsWith('events.'))value=value||null;
    if(path.endsWith('.slot')||path.endsWith('.next'))value=value===''?null:Number(value);
    set(path,value);preview();
  }
  root.addEventListener('change',update);
  root.addEventListener('input',event=>{if(event.target.matches('[data-editor-field]')&&event.target.tagName!=='SELECT'&&event.target.type!=='checkbox')update(event);});
  root.addEventListener('click',event=>{
    const b=event.target.closest('[data-editor-action]');if(!b)return;
    const index=Number(b.dataset.index),ei=Number(b.dataset.event),ni=Number(b.dataset.node),ev=draft.events[ei];
    switch(b.dataset.editorAction){
      case 'add-duty':draft.family.duties.push(Core.rule('採買與準備餐食',0,'market'));break;
      case 'remove-duty':draft.family.duties.splice(index,1);break;
      case 'add-appointment':draft.appointments.push({...Core.rule('新的活動',0,'park'),day:config.state.day+1,status:'planned'});break;
      case 'remove-appointment':draft.appointments.splice(index,1);break;
      case 'add-event':{
        let id='evt-'+Date.now().toString(36);while(draft.events.some(e=>e.id===id))id+='x';
        draft.events.push({id,title:'新的關鍵事件',key:true,minimum:100,trust:50,willing:true,retry:true,previous:null,location:null,slot:null,deadline:null,nodes:[{text:'請填寫人物想說的話。',choices:[{label:'今天先維持朋友關係',result:'not_occurred'}]}]});break;
      }
      case 'remove-event':if(draft.records[draft.events[index].id]||draft.events.some(e=>e.previous===draft.events[index].id))return;draft.events.splice(index,1);break;
      case 'add-node':ev.nodes.push({text:'請填寫接下來的台詞。',choices:[{label:'結束這次事件',result:'not_occurred'}]});break;
      case 'remove-node':if(ni===0)return;if(!confirm('刪除這段對話後，原本接到這裡的選項將改為「未發生／不推進」。確定？'))return;ev.nodes.splice(ni,1);for(const n of ev.nodes)for(const q of n.choices)if(q.next===ni){delete q.next;q.result='not_occurred';}else if(q.next>ni)q.next--;break;
      case 'add-choice':ev.nodes[ni].choices.push({label:'請填寫不同的台詞或行動',result:'not_occurred'});break;
      case 'remove-choice':if(ev.nodes[ni].choices.length>1)ev.nodes[ni].choices.splice(index,1);break;
    }
    render();
    // Preserve expanded author panels after a structural change.
    if(b.dataset.editorAction.includes('event')||b.dataset.editorAction.includes('node')||b.dataset.editorAction.includes('choice'))root.querySelectorAll('details:not([data-editor-preview] details)').forEach(d=>d.open=true);
  });
  render();
  function read(){
    for(const event of draft.events){
      if(!event.title.trim())throw Error('事件名稱不可空白');
      for(const node of event.nodes){
        if(!node.text.trim())throw Error('人物台詞不可空白');
        const labels=node.choices.map(q=>q.label.trim());
        if(labels.some(label=>!label)||new Set(labels).size!==labels.length)throw Error('同一段的選項不可空白或重複，請寫出不同的話或行動');
      }
    }
    return JSON.parse(JSON.stringify(draft));
  }
  return {read,preview};
};
