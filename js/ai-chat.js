/* Optional UI. Password and active requests stay in memory, outside JSON saves. */
window.createCityAIChat=({Core,getState,showSheet,save,render,toast,escape})=>{
  const $=s=>document.querySelector(s),AI=window.CityAI;
  const viewport=()=>document.documentElement.style.setProperty('--ai-viewport-height',(window.visualViewport?.height||window.innerHeight)+'px');
  window.visualViewport?.addEventListener('resize',viewport);
  let session=null,controller=null,password='',mode='offline',endpoint='';
  const notice='AI 文字不會改變好感度、戀愛或事件。只會傳送芷妍的必要情境和有限記憶，請勿輸入個資。整段至多一時段；關閉即結束。';
  function finish(){
    if(!session)return;controller?.abort();controller=null;
    const old=session;session=null;
    if(old.received){const s=getState();if(s.day===old.day&&s.slot===old.slot){Core.record(s,'與陳芷妍結束 AI 自由聊天（不影響關係與事件）。');Core.advance(s);save();render();}}
    document.querySelector('#overlay').classList.remove('ai-chat-active');
    password='';mode='offline';
  }
  function open(id){
    const s=getState(),c=s.characters.find(c=>c.id===id);
    if(!c||c.coreId!=='zhiyan')return;
    if(s.characters.some(c=>c.life.pending)){toast('請先結束原本的離線對話。');return;}
    const r=Core.status(s,c);
    if(r.location!==s.location||r.busy){toast('芷妍目前有工作或生活安排，請晚點再聊。');return;}
    showSheet('陳芷妍 · AI自由聊天',`<p class="tip">預設為離線模式。${escape(notice)}</p><form id="ai-setup"><label class="field"><span>對話模式</span><select id="ai-mode"><option value="offline">離線（原本聊天）</option><option value="mock">Mock 假回應（完全不連網）</option><option value="worker">私人 AI 測試</option></select></label><label class="field"><span>Worker 網址（結尾不需 /chat）</span><input id="ai-url" type="url" placeholder="https://你的名稱.workers.dev" value="${escape(endpoint)}" autocapitalize="none" autocomplete="off"></label><label class="field"><span>私人存取密碼（不儲存）</span><input id="ai-password" type="password" maxlength="256" autocomplete="off"></label><button class="btn primary" type="submit">開始</button></form><p id="ai-status" role="status"></p><div id="ai-transcript" aria-live="polite" aria-relevant="additions"></div><form id="ai-form" hidden><label class="field"><span>想和芷妍說什麼？（最多600字）</span><textarea id="ai-input" rows="3" maxlength="600" required></textarea></label><button class="btn primary" id="ai-send" type="submit">傳送</button></form><button class="btn ghost" id="ai-end" type="button">結束交談／返回離線模式</button>`);
    $('#overlay').classList.add('ai-chat-active');viewport();
    session={c,day:s.day,slot:s.slot,received:false,turns:0,brief:!!r.brief};
    $('#ai-end').onclick=()=>{finish();$('#btn-close').click();};
    $('#ai-setup').onsubmit=e=>{
      e.preventDefault();mode=$('#ai-mode').value;
      if(mode==='offline'){finish();$('#btn-close').click();toast('已維持離線模式，可選原本的「聊天」。');return;}
      if(mode==='worker'){
        try{const u=new URL($('#ai-url').value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/'||!u.hostname.endsWith('.workers.dev'))throw Error();endpoint=u.origin;}catch{$('#ai-status').textContent='請填入有效的 HTTPS workers.dev 網址。';return;}
        password=$('#ai-password').value;if(password.length<16){$('#ai-status').textContent='請輸入至少16字元的私人存取密碼。';return;}
      }
      $('#ai-password').value='';$('#ai-setup').hidden=true;$('#ai-form').hidden=false;
      $('#ai-status').textContent=mode==='mock'?'Mock 假回應測試：不代表真實 AI 已接通。':'私人測試已啟用。';$('#ai-input').focus();
    };
    $('#ai-form').onsubmit=send;
    $('#ai-input').onfocus=()=>setTimeout(()=>$('#ai-input')?.scrollIntoView({block:'center',behavior:'smooth'}),250);
  }
  function line(who,text){const p=document.createElement('p');p.className='ai-line';p.textContent=who+'：'+text;$('#ai-transcript').append(p);p.scrollIntoView({block:'nearest'});}
  async function send(e){
    e.preventDefault();if(!session||controller)return;
    const active=session,s=getState(),input=$('#ai-input').value.trim();if(!input||input.length>600)return;
    controller=new AbortController();const ac=controller;let timer;
    $('#ai-send').disabled=true;$('#ai-input').disabled=true;$('#ai-status').textContent='等待芷妍回應…';
    line('你',input);
    try{
      const context=AI.context(Core,s,active.c);let result;
      if(mode==='mock'){
        await new Promise(resolve=>setTimeout(resolve,180));
        result={reply:active.turns===0?`今天是${['早上','下午','晚上'][s.slot]}，${context.events.some(e=>e.status==='success')?'之前一起經歷的事，我還記得。':'先聊聊近況吧。'}我剛整理完配方，腦袋還有一點麵粉味。你剛才提的「${input.slice(0,45)}」，我有聽見。`:active.turns===1?'嗯，我有接著聽。做麵包也是這樣，不能急著跳過發酵；有些事慢慢說清楚，比急著替我做決定好。':'今天先聊到這裡，我還得整理明天的預訂。下次見面再繼續，記得留點時間給自己。',end:active.turns>=2||active.brief};
      }else{
        timer=setTimeout(()=>ac.abort(),22000);
        const response=await fetch(endpoint+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+password},body:JSON.stringify({coreId:'zhiyan',message:input,context}),signal:ac.signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});
        // Bound response before JSON parsing; no raw error/HTML or model fields reach the game.
        const reader=response.body.getReader();let raw='',size=0;const decoder=new TextDecoder();
        while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>5000){await reader.cancel();throw Error('回應過長');}raw+=decoder.decode(value,{stream:true});}
        raw+=decoder.decode();let data;try{data=JSON.parse(raw);}catch{throw Error('服務回應格式不正確');}
        if(!response.ok)throw Error(response.status===401?'存取密碼不正確':response.status===429?'請求過於頻繁，請稍候再試':response.status===503?'免費資格、額度、模型或服務暫時不可用':'連線失敗');result=data;
      }
      if(session!==active||ac.signal.aborted)return;
      if(!result||typeof result.reply!=='string'||!result.reply.trim()||result.reply.length>600||typeof result.end!=='boolean')throw Error('回應格式不正確');
      // The only accepted model fields are plain dialogue and a request to end.
      active.c.life.ai=AI.append(active.c.life.ai,input,result.reply);active.received=true;active.turns++;save();
      line('芷妍',result.reply);$('#ai-input').value='';
      if(result.end||active.brief||active.turns>=8){$('#ai-form').hidden=true;$('#ai-status').textContent='芷妍結束了聊天，已回到離線模式。';finish();}
      else $('#ai-status').textContent=mode==='mock'?'Mock 假回應 · 可繼續追問或轉移話題。':'可繼續聊天，或隨時結束。';
    }catch(error){
      if(session!==active)return;
      $('#ai-form').hidden=true;$('#ai-status').textContent=(ac.signal.aborted?'請求逾時或已取消':error.message)+'，已返回離線模式。存檔進度不受影響。';finish();
    }finally{
      clearTimeout(timer);if(controller===ac)controller=null;
      if($('#ai-send')){$('#ai-send').disabled=false;$('#ai-input').disabled=false;}
    }
  }
  return {open,finish};
};
