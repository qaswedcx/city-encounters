/* v0.2 life and event extension;
 pure data, no DOM or storage. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.extendCity=factory;})(globalThis,function(Base,Data){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)), ids=Data.PLACES.map(p=>p.id), locations=[...ids,'home','office'];
const outcomes=['not_occurred','success','temporary_failure','permanent_failure','missed'];
const STORY = typeof module==='object'&&module.exports ? require('./story.js') : globalThis.CityStory;
const LEGACY = typeof module==='object'&&module.exports ? require('./story-v1.js') : globalThis.CityStoryV1;
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const Scenes=typeof module==='object'&&module.exports?require('./scenes.js'):globalThis.CityScenes;
const BALANCE={illness:.06,overtime:.08,gathering:.06,errand:.12,busy:.2};
const assert=(v,m='生活資料格式不正確')=>{if(!v)throw Error(m);};
const rule=(label,slot,location='home',days=[1,2,3,4,5,6,7])=>({label,slot,location,days});
function event(id,title,text,reply,previous=null,key=false,minimum=key?100:0,willing=true,retry=true){return {id,title,key,minimum,trust:key?50:0,willing,retry,previous,location:null,slot:null,deadline:null,nodes:[{text,choices:[{label:'先聽你的想法，尊重你的決定',next:1,effect:'support'},{label:'今天先不推進',result:'not_occurred'},{label:'要求對方照我的安排',result:retry?'temporary_failure':'permanent_failure'}]},{text:reply,choices:[{label:'我願意記住並尊重這個約定',result:willing?'success':'permanent_failure'},{label:'先保持現在的距離',result:'not_occurred'},{label:'要求對方放棄原有生活',result:retry?'temporary_failure':'permanent_failure'}]}]};}
function defaults(c){const index=Data.DEFAULTS.findIndex(d=>d.name===c.name);const stories=[['雨後的花材','這批花淋了雨，我想留給社區花藝課，但得趕回家準備晚餐。','謝謝你陪我整理，下次請來看孩子們的花籃。','親子花籃','孩子想親手完成花籃，你願意讓他慢慢試嗎？','你沒有替他完成，這份耐心很珍貴。','花店門口的界線','我珍惜婚姻，只願保持友情。深厚的朋友也能一起走很久。'],['招牌草稿','我正在整理城市招牌畫冊。你能指出看不懂的地方嗎？','具體的意見比稱讚有用，下一版想再請你看。','小誌試印','上次的建議我試過了，這次打算署名發行自己的小誌。','你尊重我的創作決定，讓我願意分享未完成的作品。','創作與我們','共同改稿讓我更了解你。我願意認真討論關係，也需要保留創作空間。'],['失敗的麵團','重建烘焙事業後，我還是害怕失敗。這批麵團沒發起來。','謝謝你陪我記錄原因，沒有急著叫我振作。','重新開爐','照上次紀錄調整，今天第一盤成功了。我想先小量預訂。','你沒有催我擴店。我想邀你一起試新口味。','烤箱熄火以後','過去的經驗讓我在意自己的步調。願意前進，不代表放棄事業與家人。']];
const a=stories[index];const events=a?[event('life1',a[0],a[1],a[2]),event('life2',a[3],a[4],a[5],'life1'),event('key',a[6],a[7],index===0?'我的答案仍然是友情，謝謝你尊重。':'我願意和你一起向前，也保留自己的生活。','life2',true,index===1?65:100,index!==0,index!==2)]:[event('key','彼此的步調',`我想談談我們，也需要你尊重${c.hobby}和我的生活。`,'一起把界線說清楚，再向前走。',null,true)];
return {work:{type:'休假',location:'office',days:[1,2,3,4,5],slots:[0,1],brief:false},family:{children:[],duties:[]},weekend:[...c.schedule],mood:'平靜',topics:[c.hobby],boundary:'尊重私人生活',events,records:{},memories:[],daily:{day:0,changes:[],busy:false},appointments:[],gains:{},pending:null};}
function profile(c){return typeof c.coreId==='string'&&Object.hasOwn(Data.PROFILES,c.coreId)?Data.PROFILES[c.coreId]:null;}
function upgrade(c){
 const l=c.life,p=profile(c);
 if(p&&STORY?.[c.coreId]) for(const e of STORY[c.coreId]){
   const index=l.events.findIndex(x=>x.id===e.id),saved=l.events[index];
   if(index<0)l.events.push(clone(e));
   else if(l.pending?.id!==e.id && !saved.officialVersion && canonical(saved)===canonical(LEGACY[c.coreId].find(x=>x.id===e.id)))l.events[index]=clone(e);
 }

 if(!p||l.profileVersion===3)return l;
 // Additive migration: existing authored events, records, pending talks and schedules survive.
 const make=(id,title,text,previous,minimum,trust,key=false)=>({...event(id,title,text,p.key,previous,key,minimum,true,false),trust});
 const intro=make('v03-intimacy',p.events[1],p.opening,'life2',50,40);
 intro.nodes[1].text='謝謝你願意聽我說。靠近之前，我還需要確認自己的心意，也把生活安排想清楚。';
 if(!l.events.some(e=>e.id==='life2'))intro.previous=null;
 const key=make('v03-choice',p.events[2],p.key,intro.id,65,55,true);
 key.nodes=[{text:p.key,choices:[{label:'我也願意，先談清楚各自的生活與界線',result:'success'},{label:'我珍惜你，選擇維持友情',result:'not_occurred'},{label:'要求她現在放棄原有生活',result:'permanent_failure'}]}];
 const after=make('v03-together',p.events[3],p.after,key.id,0,0);
 after.nodes=[{text:p.after,choices:[{label:'一起安排，也為彼此保留空間',result:'success'}]}];
 for(const e of [intro,key,after])if(!l.events.some(x=>x.id===e.id))l.events.push(e);
 l.profileVersion=3;return l;
}
function life(c){if(!c.life)c.life=defaults(c);return upgrade(c);}
function routeStage(c){
 const l=life(c);if(!profile(c))return relationship(c);
 const story=l.records.story7;
 if(story?.status==='success')return story.path==='friendship'?'友情維持':story.path==='romance'?'戀愛成功':'彼此理解';
 const r=l.records['v03-choice']?.status;
 if(r==='success')return '戀愛成功';
 if(r==='not_occurred')return '友情維持';
 if(['permanent_failure','missed'].includes(r))return '錯過／失敗';
 if(l.events.some(e=>e.key&&l.records[e.id]?.status==='success'))return '戀愛成功';
 if(l.records['v03-intimacy']?.status==='success')return '關鍵事件';
 if(c.familiarity>=50&&c.trust>=40&&l.records.life2?.status==='success')return '曖昧';
 if(c.trust>=30&&l.records.life1?.status==='success')return '信任';
 return c.familiarity>=20?'熟悉':'初識';
}
function profileLevel(c){const l=life(c);return l.records['v03-choice']?.status==='success'?4:l.records['v03-intimacy']?.status==='success'?3:c.trust>=30&&l.records.life1?.status==='success'?2:c.familiarity>=20?1:0;}
function validate(l){assert(l&&typeof l==='object');assert(l.workReviewed===undefined||typeof l.workReviewed==='boolean');assert(l.work&&['休假','固定班','輪班','自由接案'].includes(l.work.type)&&locations.includes(l.work.location)&&typeof l.work.brief==='boolean');const nums=(a,min,max)=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=min&&n<=max);assert(nums(l.work.days,1,7)&&nums(l.work.slots,0,2));assert(l.family&&nums(l.family.children,0,80)&&l.family.children.length<=20&&Array.isArray(l.family.duties)&&l.family.duties.length<=20);const validRule=r=>r&&typeof r.label==='string'&&r.label.length<=200&&nums(r.days,1,7)&&[0,1,2].includes(r.slot)&&locations.includes(r.location);assert(l.family.duties.every(validRule));assert(Array.isArray(l.weekend)&&l.weekend.length===3&&l.weekend.every(p=>ids.includes(p)));assert(typeof l.mood==='string'&&l.mood.length<=100&&typeof l.boundary==='string'&&l.boundary.length<=500&&Array.isArray(l.topics)&&l.topics.length<=20&&l.topics.every(t=>typeof t==='string'&&t.length<=100));assert(Array.isArray(l.events)&&l.events.length<=33);const used=new Set();for(const e of l.events){assert(e&&/^[a-zA-Z0-9_-]{1,40}$/.test(e.id)&&!used.has(e.id)&&!['__proto__','constructor','prototype'].includes(e.id));used.add(e.id);assert(typeof e.title==='string'&&typeof e.key==='boolean'&&typeof e.willing==='boolean'&&typeof e.retry==='boolean'&&Number.isFinite(e.minimum)&&e.minimum>=0&&e.minimum<=100&&Number.isFinite(e.trust)&&e.trust>=0&&e.trust<=100);assert((e.location===null||ids.includes(e.location))&&(e.slot===null||[0,1,2].includes(e.slot))&&(e.deadline===null||Number.isSafeInteger(e.deadline)&&e.deadline>0));assert(Array.isArray(e.nodes)&&e.nodes.length>0&&e.nodes.length<=30);for(const n of e.nodes){assert(typeof n.text==='string'&&n.text.length<=2000&&Array.isArray(n.choices)&&n.choices.length<=6&&(n.choices.length>0||(outcomes.includes(n.result)||Number.isInteger(n.next)&&n.next>=0&&n.next<e.nodes.length)));assert(n.next===undefined||!n.choices.length&&n.result===undefined&&Number.isInteger(n.next)&&n.next>=0&&n.next<e.nodes.length);assert(n.result===undefined||!n.choices.length&&outcomes.includes(n.result));if(n.delta)assert(Object.keys(n.delta).every(k=>['trust','closeness'].includes(k)&&Number.isInteger(n.delta[k])&&Math.abs(n.delta[k])<=10));for(const q of n.choices)assert(typeof q.label==='string'&&q.label.length<=200&&(outcomes.includes(q.result)||Number.isInteger(q.next)&&q.next>=0&&q.next<e.nodes.length));}}
assert(l.events.every(e=>e.previous===null||used.has(e.previous)));
// Both event dependencies and dialogue edges must terminate.
for(const e of l.events){let cursor=e;const chain=new Set();while(cursor){assert(!chain.has(cursor.id),'事件前置條件不可循環');chain.add(cursor.id);cursor=l.events.find(x=>x.id===cursor.previous);}const visited=new Set();const visit=(i,path)=>{assert(!path.has(i),'對話節點不可循環');if(visited.has(i))return;const next=new Set(path);next.add(i);if(e.nodes[i].next!==undefined)visit(e.nodes[i].next,next);for(const q of e.nodes[i].choices)if(q.next!==undefined)visit(q.next,next);visited.add(i);};visit(0,new Set());}
assert(l.records&&typeof l.records==='object'&&!Array.isArray(l.records));for(const [id,r] of Object.entries(l.records))assert(used.has(id)&&outcomes.includes(r.status)&&Number.isSafeInteger(r.day)&&r.day>0);assert(Array.isArray(l.memories)&&l.memories.length<=80&&l.memories.every(m=>Number.isSafeInteger(m.day)&&m.day>0&&typeof m.text==='string'&&m.text.length<=2000));assert(l.daily&&Number.isSafeInteger(l.daily.day)&&l.daily.day>=0&&typeof l.daily.busy==='boolean'&&Array.isArray(l.daily.changes)&&l.daily.changes.every(validRule));assert(Array.isArray(l.appointments)&&l.appointments.length<=100&&l.appointments.every(a=>validRule(a)&&Number.isSafeInteger(a.day)&&a.day>0&&['planned','completed','cancelled'].includes(a.status)));assert(l.gains&&typeof l.gains==='object'&&!Array.isArray(l.gains)&&Object.values(l.gains).every(Number.isSafeInteger));assert(l.pending===null||typeof l.pending==='object'&&typeof l.pending.id==='string'&&Number.isInteger(l.pending.node)&&typeof l.pending.event==='boolean'&&(l.pending.choice===null||typeof l.pending.choice==='string'&&l.pending.choice.length<=80));if(l.pending?.sceneBeat!==undefined)assert(Number.isInteger(l.pending.sceneBeat)&&l.pending.sceneBeat>=0&&l.pending.sceneBeat<=8);if(l.pending?.trace)assert(Array.isArray(l.pending.trace)&&l.pending.trace.length<=30&&l.pending.trace.every(t=>typeof t==='string'&&t.length<=200));for(const r of Object.values(l.records)){if(r.reply!==undefined)assert(typeof r.reply==='string'&&r.reply.length<=2000);if(r.path!==undefined)assert(r.path===null||typeof r.path==='string'&&r.path.length<=80);}return clone(l);}
function remember(s,c,text){const l=life(c);l.memories.push({day:s.day,text:text.slice(0,2000)});l.memories=l.memories.slice(-80);Base.record(s,c.name+'：'+text);}
function prepare(s,rng=Math.random){for(const c of s.characters){const l=life(c);if(l.daily.day===s.day)continue;const changes=[];const add=(label,slot,location='home')=>changes.push(rule(label,slot,location));const r=rng();if(l.family.children.length&&r<BALANCE.illness){for(let i=0;i<3;i++)add('孩子身體不舒服',i);}else if(l.work.type!=='休假'&&r<BALANCE.illness+BALANCE.overtime)add('臨時加班',2,l.work.location);else if(r<BALANCE.illness+BALANCE.overtime+BALANCE.gathering)add('家庭聚會',2);else if(r<BALANCE.illness+BALANCE.overtime+BALANCE.gathering+BALANCE.errand)add('採買與準備餐食',0,'market');l.daily={day:s.day,changes,busy:rng()<BALANCE.busy};for(const x of changes)remember(s,c,x.label);for(const a of l.appointments){if(a.day<s.day&&a.status==='planned'){a.status='cancelled';remember(s,c,'錯過約定：'+a.label);}if(a.day===s.day&&a.status==='planned'&&changes.some(x=>x.slot===a.slot)){a.status='cancelled';remember(s,c,'因生活事件取消約定：'+a.label);}}for(const e of l.events)if(e.deadline&&s.day>e.deadline&&!['success','permanent_failure'].includes(l.records[e.id]?.status))l.records[e.id]={status:'missed',day:s.day};}}
// Pure resolver shared by encounters, today's agenda and weekly preview.
// Only already-saved daily changes are shown; inspecting a week never rolls events.
function statusAt(s, c, date, slot) {
  const l = life(c), weekday = (date - 1) % 7 + 1;
  let r = l.daily.day === date ? l.daily.changes.find(r => r.slot === slot) : null;
  if (r) return {...r, label:'臨時有事', reason:r.label, busy:true, priority:1};
  r = l.appointments.find(a => a.day === date && a.slot === slot && a.status === 'planned');
  if (r) return {...r, label:'特殊活動', reason:r.label, busy:false, priority:2};
  r = l.family.duties.find(r => r.slot === slot && r.days.includes(weekday));
  if (r) return {...r, label:'家庭時間', reason:r.label, busy:true, priority:3};
  if (l.work.type !== '休假' && l.work.days.includes(weekday) && l.work.slots.includes(slot)) {
    return {location:l.work.location, label:'工作中', reason:l.work.type,
      busy:!l.work.brief || !ids.includes(l.work.location) || (l.daily.day === date && l.daily.busy),
      brief:true, priority:4};
  }
  return {location:(weekday >= 6 ? l.weekend : c.schedule)[slot],
    label:slot === 2 ? '休息' : '自由活動', reason:weekday >= 6 ? '週末行程' : '一般行程', busy:false, priority:5};
}
function status(s,c) { prepare(s); return statusAt(s,c,s.day,s.slot); }
function weekSchedule(s,c) {
  const monday = s.day - (s.day - 1) % 7;
  return Array.from({length:7}, (_,i) => ({day:monday+i, slots:[0,1,2].map(slot => statusAt(s,c,monday+i,slot))}));
}
// Suggestions are opt-in form drafts, never a migration that overwrites saved work.
function suggestedWork(c) {
  if (/花藝/.test(c.job)) return {type:'輪班',location:'market',days:[1,2,3,4,5],slots:[0,1],brief:true};
  if (/烘焙|甜點|咖啡/.test(c.job)) return {type:'輪班',location:'cafe',days:[2,3,4,5,6],slots:[0,1],brief:true};
  if (/設計|插畫|攝影/.test(c.job)) return {type:'自由接案',location:'home',days:[1,2,3,4,5],slots:[0],brief:false};
  if (/服飾|百貨/.test(c.job)) return {type:'輪班',location:'mall',days:[2,3,4,5,6],slots:[1,2],brief:true};
  return {type:'固定班',location:'office',days:[1,2,3,4,5],slots:[0,1],brief:false};
}
function available(s,c,e){const l=life(c),r=l.records[e.id];if(profile(c)&&e.id==='key'&&l.events.some(x=>x.id==='v03-choice'))return false;if(profile(c)&&e.id==='v03-choice'&&r?.status==='not_occurred')return false;return !['success','permanent_failure','missed'].includes(r?.status)&&r?.day!==s.day&&(!e.previous||l.records[e.previous]?.status==='success')&&c.familiarity>=e.minimum&&c.trust>=e.trust&&(!e.location||e.location===s.location)&&(e.slot===null||e.slot===s.slot)&&!status(s,c).busy&&!status(s,c).brief;}
function relationship(c){if(profile(c)&&life(c).records['v03-choice'])return routeStage(c);const l=life(c),keys=l.events.filter(e=>e.key);const blocked=(e,seen=new Set())=>{if(seen.has(e.id))return true;seen.add(e.id);return !e.willing||['permanent_failure','missed'].includes(l.records[e.id]?.status)||(e.previous&&blocked(l.events.find(p=>p.id===e.previous),seen));};if(keys.some(e=>l.records[e.id]?.status==='success'))return '進一步關係';if(c.familiarity===100&&keys.length&&keys.every(e=>blocked(e)))return '無法進一步發展';return '好友';}
function begin(s,id,kind){const c=s.characters.find(c=>c.id===id);assert(c);const l=life(c);if(l.pending)return l.pending;assert(!s.characters.some(other=>other.id!==id&&life(other).pending),'已有進行中的談話');assert(status(s,c).location===s.location,'人物不在此處');const e=l.events.find(e=>e.id.startsWith('story')&&available(s,c,e))||l.events.find(e=>available(s,c,e));l.pending={id:e?e.id:kind,node:0,kind,choice:null,day:s.day,slot:s.slot,location:s.location,event:!!e};return l.pending;}
function dialogue(s,c) {
  const p=c.life.pending;assert(p&&p.event,'這是事件對話入口');
  const e=c.life.events.find(e=>e.id===p.id);let node=e.nodes[p.node];
  if(c.coreId==='zhiyan'&&e.officialVersion===2&&e.id==='story6'&&p.node===0&&c.life.records.story2?.path==='respectful')node={...node,text:node.text.replace('芷妍先把偏酸的一份放在你面前。「你上次的表情我記得，比打分數誠實。」','芷妍把新舊配方並排放下。「上次你說舊版順口，我回去試了好幾遍。今天還要聽實話。」')};
  if(!node.choices.length&&node.result==='success'&&e.key&&!e.willing)node={...node,text:'她停了一下。「我現在不能答應這樣的關係。」'};
  const followup=Scenes.followup(c,e,p.node);if(followup)return {...node,text:followup+node.text};
  const original=LEGACY[c.coreId]?.find(x=>x.id===e.id);
  if(original&&canonical(e)===canonical(original)&&node.choices.length===1&&node.choices[0].result)return {...node,choices:[],result:node.choices[0].result};
  if(!['story3','story6','story7'].includes(e.id)||p.node!==0||!e.previous)return node;
  const prev=l=>l.events.find(x=>x.id===e.previous);
  const before=prev(c.life),choice=c.life.records[e.previous]?.path;
  if(!before||!choice)return node;
  const previousReply=c.life.records[e.previous]?.reply || (before.officialVersion===2?(LEGACY[c.coreId]?.find(x=>x.id===e.previous)||before):before).nodes[choice==='support'||choice==='romance'?1:2]?.text;
  const lead={ruoqing:'若晴接著上次聊過的事，慢慢開了口。',yian:'以安翻到上次那一頁，沒有從頭解釋。',zhiyan:'芷妍還記得你上回的反應，見面就提了起來。'}[c.coreId]||'你們想起上次的談話。';
  return previousReply?{...node,text:lead+'\n'+previousReply+'\n\n'+node.text}:node;
}
function choose(s,id,index) {
  const c=s.characters.find(c=>c.id===id);assert(c);const l=c.life,p=l.pending;
  assert(p&&p.event&&p.day===s.day&&p.slot===s.slot,'沒有有效的事件對話');
  const node=dialogue(s,c),e=l.events.find(e=>e.id===p.id);
  if(index==='continue'){assert(!node.choices.length&&node.next!==undefined,'不能直接延續');p.node=node.next;delete p.sceneBeat;return false;}
  let q;
  if(index==='finish'){assert(!node.choices.length&&outcomes.includes(node.result),'尚未到結尾');q=node;}
  else {q=node.choices[index];assert(q,'選項不存在');}
  if(q.next!==undefined){p.node=q.next;delete p.sceneBeat;p.choice=q.effect||p.choice;p.trace=[...(p.trace||[]),q.label].slice(-30);return false;}
  let result=q.result;
  if(result==='temporary_failure'&&!e.retry)result='permanent_failure';
  if(result==='success'&&e.key&&!e.willing)result='permanent_failure';
  const sceneEnding=Scenes.ending(s,c);
  l.records[e.id]={status:result,day:s.day,...(e.id.startsWith('story')?{path:p.choice,reply:node.text.slice(0,2000),choices:p.trace||[],...(sceneEnding||{})}:{} )};
  if(e.id==='v03-choice'&&['permanent_failure','missed'].includes(result)&&profile(c))remember(s,c,profile(c).depth.eventPlan.fallout+'：'+profile(c).depth.eventPlan.falloutSummary);
  remember(s,c,e.title+'：'+(e.id.startsWith('story')?(sceneEnding?.reply||node.text):({success:e.key?'我願意認真發展，工作與家庭仍然重要。':'一起完成了這次經歷。',not_occurred:'這次選擇不推進。',temporary_failure:'這次不合適，請給我時間。',permanent_failure:'我明確拒絕這條發展路線。',missed:'這次機會已經錯過。'})[result]));
  if(result.includes('failure'))c.trust=Math.max(0,c.trust-10);
  else if(result==='success')c.trust=Math.min(100,c.trust+5);
  if(q===node&&q.delta&&result===q.result)for(const [key,value] of Object.entries(q.delta))c[key]=Math.max(0,Math.min(100,c[key]+value));
  l.mood=result==='success'?'安心':result==='not_occurred'?'平靜':'低落';l.pending=null;
  for(const appointment of l.appointments)if(appointment.day===s.day&&appointment.slot===s.slot&&appointment.status==='planned')appointment.status='completed';
  Base.advance(s);prepare(s);return true;
}
const normalizeCharacter=x=>{const c=Base.normalizeCharacter(x);c.life=x.life?validate(x.life):defaults(c);upgrade(c);if(!x.life&&x.work){c.life.work=clone(x.work);c.life.family={children:x.family?.children||[],duties:x.family?.responsibility?[rule(x.family.responsibility,x.family.slot)]:[]};c.life.memories=(x.memories||[]).slice(-80);if(x.key){const e=c.life.events.find(e=>e.key);Object.assign(e,{minimum:x.key.minimum,trust:x.key.trust,willing:x.key.willing,retry:x.key.retry});}for(const [id,r] of Object.entries(x.events||{}))if(c.life.events.some(e=>e.id===id)&&outcomes.includes(r.status))c.life.records[id]=clone(r);validate(c.life);}return c;};
function safeState(x){const s=Base.safeState(x);s.characters=s.characters.map((c,i)=>normalizeCharacter({...x.characters[i],...c,life:x.characters[i].life}));for(const c of s.characters){const p=c.life.pending;if(p){assert(p.day===s.day&&p.slot===s.slot&&ids.includes(p.location)&&p.location===s.location&&['greet','chat','deep'].includes(p.kind)&&Number.isInteger(p.node)&&p.node>=0);if(p.event){const e=c.life.events.find(e=>e.id===p.id);assert(e&&p.node<e.nodes.length);}else assert(p.node<=1);}}assert(s.characters.filter(c=>c.life.pending).length<=1);return s;}
return {...Base,interact:(s,id,kind,approach)=>{const c=s.characters.find(c=>c.id===id);assert(c&&status(s,c).location===s.location,'人物目前不在這個地點');assert(!status(s,c).busy,'人物目前忙碌');return Base.interact(s,id,kind,approach);},BALANCE,event,rule,validate,life,profile,routeStage,profileLevel,prepare,status,statusAt,weekSchedule,suggestedWork,available,relationship,begin,dialogue,choose,normalizeCharacter,safeState,createState:()=>{const s=Base.createState();s.characters=s.characters.map(normalizeCharacter);s.characters.forEach((c,i)=>{c.life.work={type:i===1?'自由接案':'輪班',location:i===0?'market':i===1?'office':'cafe',days:i===2?[2,3,4,5,6]:[1,2,3,4,5],slots:i===1?[0]:[0,1],brief:i!==1};c.life.family={children:i===0?[6]:[],duties:[rule(i===0?'接送與照顧子女':i===1?'陪伴家人':'家務及家庭維持',2,'home',i===2?[1,3,5]:[1,2,3,4,5])]};if(i===2)c.life.weekend=['park','market','community'];});return s;},randomCharacter:existing=>{const c=normalizeCharacter(Base.randomCharacter(existing)),l=c.life;const pick=a=>a[Math.floor(Math.random()*a.length)];l.work={type:pick(['固定班','輪班','自由接案','休假']),location:/咖啡/.test(c.job)?'cafe':/服飾/.test(c.job)?'mall':'office',days:pick([[1,2,3,4,5],[2,4,6],[3,4,5,6,7]]),slots:pick([[0],[0,1],[1,2]]),brief:/咖啡|服飾/.test(c.job)};l.family.children=pick([[],[5],[8,12]]);l.family.duties=[rule(l.family.children.length?'接送與照顧子女':pick(['家務及家庭維持','陪伴家人']),2)];l.weekend=ids.slice().sort(()=>Math.random()-.5).slice(0,3);return c;}};
});

