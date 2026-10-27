/* Ordinary conversation has its own outcomes; endings never decide event success. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.extendTalk=factory;})(globalThis,(Core,Topics)=>{
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const outcomes=['completed','continued','left_early','refused','no_topic','brief'];
  const assert=(v,m='對話存檔格式不正確')=>{if(!v)throw Error(m);};
  const bounded=(v,n)=>typeof v==='string'&&v.length<=n;
  function validateTalk(l){
    assert(l.talkRole===undefined||['florist','designer','baker','custom'].includes(l.talkRole));
    if(l.talkState!==undefined){assert(l.talkState&&typeof l.talkState==='object'&&!Array.isArray(l.talkState)&&Object.keys(l.talkState).length<=30);for(const [key,r] of Object.entries(l.talkState))assert(/^[a-z-]{1,40}$/.test(key)&&!['constructor','prototype','__proto__'].includes(key)&&r&&Number.isSafeInteger(r.day)&&r.day>0&&[0,1,2].includes(r.stage)&&Number.isInteger(r.option)&&r.option>=0&&r.option<=4&&bounded(r.choice,200));}
    if(l.conversations!==undefined){assert(Array.isArray(l.conversations)&&l.conversations.length<=40);for(const r of l.conversations)assert(r&&Number.isSafeInteger(r.day)&&r.day>0&&[0,1,2].includes(r.slot)&&outcomes.includes(r.outcome)&&bounded(r.topic,100)&&bounded(r.choice,200));}
    const AI=typeof module==='object'&&module.exports?require('./ai-memory.js'):globalThis.CityAI;
    AI.validate(l.ai);
    const p=l.pending;if(p&&!p.event&&p.scene){const d=p.scene;assert(bounded(d.text,3000)&&bounded(d.title,100)&&bounded(d.id,40)&&outcomes.includes(d.outcome)&&Array.isArray(d.options)&&d.options.length<=4&&[0,1].includes(d.stage));for(const o of d.options)assert(o&&bounded(o.label,200)&&bounded(o.reply,2000)&&bounded(o.follow,2000));assert(d.selected===null||Number.isInteger(d.selected)&&d.selected>=0&&d.selected<d.options.length);assert(p.node!==1||!d.options.length||d.selected!==null);}
    return l;
  }
  function context(s,c){
    const l=c.life,r=Core.status(s,c),where={home:'家裡',office:'辦公室'}[r.location]||globalPlace(r.location);
    const voice=/理性|務實|沉穩/.test(c.trait)?'對方想了一下，把話說得很具體。':/慢熟|細膩|敏感/.test(c.trait)?'對方停了片刻，才輕聲接著說。':/活潑|開朗|健談|幽默/.test(c.trait)?'對方招了招手，自己先提起近況。':'對方看了看周圍，聊起最近的日常。';
    return `${where}的${['早上','下午','晚上'][s.slot]}，${c.name}的心情${l.mood}。${voice}`;
  }
  function globalPlace(id){return ({community:'社區',market:'傳統市場',mall:'百貨公司',cafe:'咖啡廳',park:'公園',library:'圖書館'})[id]||'附近';}
  function scene(s,c,kind){
    const l=c.life,r=Core.status(s,c),prefix=context(s,c);
    const simple=(id,title,text,outcome='completed')=>({id,title,text:prefix+'\n'+text,options:[],stage:0,selected:null,outcome});
    if(r.busy)return simple('busy','今天先忙生活',`「今天得處理${r.reason}，現在真的抽不出時間。我們下次再聊。」`,'refused');
    if(r.brief)return simple('work-brief','工作中的招呼',`「${c.job}的工作還沒忙完，我只能停一下。謝謝你過來，等下還得繼續${/咖啡|烘焙|甜點/.test(c.job)?'準備下一份餐點':'手上的工作'}。」`,'brief');
    if(kind==='greet')return simple('greet','街角的招呼',l.memories.length?`「又見面了。你上次說的事我還記得：${l.memories.at(-1).text}」`:`「今天走到這裡剛好遇見你。待會想留點時間給${c.hobby}。」`);
    if(kind==='deep'&&(c.familiarity<25||c.trust<18))return simple('not-ready','還沒有準備好',`「我們還不太熟，我暫時不想談私人的事。可以先從平常的生活聊起。」`,'refused');
    const book=Topics.book(c),state=l.talkState||{};
    // Follow-ups wait until another day. Completed topics cool down for five days.
    const follow=book.find(t=>t.options.length&&state[t.id]?.stage===1&&s.day>state[t.id].day);
    const t=follow||book.find(t=>!state[t.id]||state[t.id].stage===2&&s.day-state[t.id].day>=5);
    if(!t)return simple('quiet','安靜的片刻','「今天沒有什麼新的事想說，留點安靜也很好。」','no_topic');
    if(follow){const previous=state[t.id];return {...simple(t.id,t.title,`「記得你上次說『${previous.choice}』。${t.options[previous.option]?.follow||t.opening}」`,'continued'),stage:1};}
    return {id:t.id,title:t.title,text:prefix+'\n'+t.opening,options:clone(t.options),stage:0,selected:null,outcome:'completed'};
  }
  function begin(s,id,kind){
    assert(['greet','chat','deep'].includes(kind),'無效互動');
    const c=s.characters.find(c=>c.id===id);assert(c,'找不到人物');
    const existing=s.characters.find(c=>c.life.pending);if(existing){assert(existing.id===id,'已有進行中的對話');return existing.life.pending;}
    assert(Core.status(s,c).location===s.location,'人物不在此處');
    // Deep exchange is the deliberate story entry. NPC invitations are shown in UI.
    if(kind==='deep'&&c.life.events.some(e=>Core.available(s,c,e)))return Core.begin(s,id,kind);
    c.life.talkRole=Topics.role(c);
    c.life.pending={id:kind,node:0,kind,choice:null,day:s.day,slot:s.slot,location:s.location,event:false,scene:scene(s,c,kind)};
    return c.life.pending;
  }
  function dialogue(s,c){
    const p=c.life.pending;assert(p,'沒有進行中的對話');if(p.event)return Core.dialogue(s,c);
    // Old v0.2 pending talks keep time and any completed exchange, with one ending.
    if(!p.scene)p.scene={id:'legacy',title:'接續上次談話',text:p.node===1?'先前的交流已經完成，現在可以結束這段談話。':'接著先前未完的日常，互相說說近況。',options:[],stage:0,selected:null,outcome:p.choice==='intrusive'?'refused':'completed'};
    const d=p.scene;
    if(p.node===0&&d.options.length)return {title:d.title,text:d.text,ordinary:true,canLeave:true,choices:d.options.map(o=>({label:o.label}))};
    return {title:d.title,text:p.node===1&&d.selected!==null?d.options[d.selected].reply:d.text,ordinary:true,choices:[{label:'結束這段對話'}]};
  }
  function choose(s,id,index){
    const c=s.characters.find(c=>c.id===id);assert(c,'找不到人物');const l=c.life,p=l.pending;assert(p&&p.day===s.day&&p.slot===s.slot,'沒有有效對話');
    if(p.event)return Core.choose(s,id,index);
    dialogue(s,c);const d=p.scene;
    if(p.node===0&&d.options.length&&index!=='leave'){
      assert(Number.isInteger(index)&&d.options[index],'選項不存在');d.selected=index;p.node=1;return false;
    }
    assert(index===0||index==='leave'&&p.node===0&&d.options.length,'選項不存在');
    const outcome=index==='leave'?'left_early':d.outcome;
    const choice=d.selected===null?'':d.options[d.selected].label;
    const rewarding=['completed','continued','brief'].includes(outcome);
    const gainKey='ordinary-'+p.kind;
    if(rewarding&&l.gains[gainKey]!==s.day){const delta=outcome==='brief'?[1,0,0]:p.kind==='greet'?[2,1,0]:[4,3,p.kind==='deep'?2:0];['familiarity','trust','closeness'].forEach((k,i)=>c[k]=Math.min(100,c[k]+delta[i]));l.gains[gainKey]=s.day;}
    if(rewarding&&!['greet','work-brief','legacy'].includes(d.id)){
      l.talkState||={};l.talkState[d.id]={day:s.day,stage:d.stage===0&&d.options.length?1:2,option:d.selected??0,choice};
    }
    const record={day:s.day,slot:s.slot,outcome,topic:d.title,choice};
    l.conversations=[...(l.conversations||[]),record].slice(-40);
    const message=`${d.title}：${choice?`你說「${choice}」。`:''}${({completed:'這次交流已完成。',continued:'接續了上次的共同話題。',left_early:'玩家先離開，問題留到下次。',refused:'對方今天無法交談。',no_topic:'沒有新話題，自然結束。',brief:'工作中交換了簡短招呼。'})[outcome]}`;
    l.memories=[...l.memories,{day:s.day,text:message}].slice(-80);Core.record(s,c.name+'：'+message);
    if(rewarding&&outcome!=='brief'&&p.kind==='deep'&&!c.storySeen&&c.familiarity>=55&&c.trust>=45&&c.closeness>=20){c.storySeen=true;l.memories=[...l.memories,{day:s.day,text:'分享背景故事：'+c.bio}].slice(-80);Core.record(s,c.name+'分享了背景故事：'+c.bio);}
    for(const a of l.appointments)if(a.day===s.day&&a.slot===s.slot&&a.status==='planned')a.status='completed';
    l.pending=null;Core.advance(s);Core.prepare(s);return true;
  }
  function safeState(input){const s=Core.safeState(input);s.characters.forEach(c=>validateTalk(c.life));return s;}
  function normalizeCharacter(x){const c=Core.normalizeCharacter(x);validateTalk(c.life);return c;}
  return {...Core,begin,dialogue,choose,safeState,normalizeCharacter,topicBook:Topics.book,validateTalk};
});
