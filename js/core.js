'use strict';
window.CityCore = (() => {
const {DEFAULTS,PLACES}=CityData;
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const uid=()=>crypto.randomUUID();
const normalizeCharacter=x=>({...x,id:x.id||uid(),name:String(x.name||'未命名').slice(0,40),age:Math.max(18,Math.min(99,Number(x.age)||30)),schedule:[0,1,2].map(i=>PLACES.some(p=>p.id===x.schedule?.[i])?x.schedule[i]:'community'),familiarity:clamp(x.familiarity),trust:clamp(x.trust),closeness:clamp(x.closeness),work:x.work||{type:'休假',location:'office',days:[1,2,3,4,5],slots:[0,1],brief:false},family:x.family||{children:[],responsibility:'家務及家庭維持',slot:2},mood:x.mood||'平靜',boundaries:x.boundaries||'尊重私人生活',memories:x.memories||[],events:x.events||{},key:x.key||{minimum:100,trust:60,willing:true,retry:true},stage:x.events?.key?.status==='success'?'進一步關係':'好友'});
function safeState(x){
if(!x||!Array.isArray(x.characters)||x.characters.length>200||![1,2,undefined].includes(x.version))throw Error('存檔版本或人物錯誤');
if(x.characters.some(c=>!c||typeof c.name!=='string'||!Number.isFinite(c.age)||c.age<18||!Array.isArray(c.schedule)))throw Error('人物格式錯誤');
for(const c of x.characters){if(c.work&&(!Array.isArray(c.work.days)||!Array.isArray(c.work.slots)))throw Error('工作設定錯誤');if(c.family&&!Array.isArray(c.family.children))throw Error('家庭設定錯誤');if(c.memories&&!Array.isArray(c.memories))throw Error('記憶格式錯誤');}
return {...x,version:2,day:Math.max(1,Math.floor(Number(x.day)||1)),slot:[0,1,2].includes(x.slot)?x.slot:0,location:PLACES.some(p=>p.id===x.location)?x.location:'community',characters:x.characters.map(normalizeCharacter),logs:Array.isArray(x.logs)?x.logs.slice(-100):[],daily:x.daily||{},conversation:x.conversation||null};
}
function createState(){return safeState({version:2,day:1,slot:0,location:'community',logs:[],characters:DEFAULTS.map((c,i)=>({...c,work:{type:i===1?'自由接案':'輪班',location:i===0?'market':i===1?'office':'cafe',days:i===2?[2,3,4,5,6]:[1,2,3,4,5],slots:i===1?[0]:[0,1],brief:i!==1},family:{children:i===0?[6]:[],responsibility:i===0?'接送與照顧子女':i===1?'陪伴配偶或家人':'家務及家庭維持',slot:2},key:{minimum:i===1?65:100,trust:i===1?50:65,willing:i!==0,retry:i!==2}}))});}
const BALANCE={illness:.07,overtime:.1,gathering:.08};
function remember(s,c,text){c.memories.push({day:s.day,text});c.memories=c.memories.slice(-80);s.logs.push({day:s.day,slot:s.slot,message:c.name+'：'+text});s.logs=s.logs.slice(-100);}
function prepare(s,rng=Math.random){if(s.daily.day===s.day)return;s.daily={day:s.day,people:{}};for(const c of s.characters){const r=rng();const event=c.family.children.length&&r<BALANCE.illness?'孩子身體不舒服':r<BALANCE.overtime?'臨時加班':r<BALANCE.overtime+BALANCE.gathering?'家庭聚會':null;s.daily.people[c.id]=event;if(event)remember(s,c,event);}}
function status(s,c){prepare(s);const event=s.daily.people[c.id];if(event)return {location:null,label:'臨時有事',reason:event,busy:true};if(c.family.responsibility&&s.slot===c.family.slot)return {location:'community',label:'家庭時間',reason:c.family.responsibility,busy:true};if(c.work.type!=='休假'&&c.work.days.includes((s.day-1)%7+1)&&c.work.slots.includes(s.slot))return {location:c.work.location,label:'工作中',reason:c.work.type,busy:!c.work.brief};return {location:c.schedule[s.slot],label:s.slot===2?'休息':'自由活動',reason:'一般行程',busy:false};}
function label(c){return c.stage==='進一步關係'?c.stage:c.familiarity===100&&(!c.key.willing||c.events.key?.status==='permanent_failure')?'無法進一步發展':'好友';}
function advance(s){s.slot++;if(s.slot===3){s.slot=0;s.day++;}prepare(s);}
function begin(s,c,kind){if(s.conversation)return;const p=status(s,c);if(p.location!==s.location)return;if(kind==='deep'&&(c.familiarity<25||c.trust<18))return;const stories=CityData.STORIES[c.name];const story=stories?(kind==='key'?stories[2]:!c.events.life1?stories[0]:!c.events.life2?stories[1]:null):null;if(story&&kind!=='key')kind=!c.events.life1?'life1':'life2';s.conversation={id:c.id,kind,story,round:0,text:story?story.text:`${c.trait}的${c.name}在${PLACES.find(x=>x.id===s.location).name}的${['早上','下午','晚上'][s.slot]}，心情${c.mood}。${p.busy?'「今天有事，只能說幾句。」':`「最近在想${c.hobby}，你想聊聊嗎？」`}`,busy:p.busy||p.label==='工作中'};}
function choose(s,choice){const d=s.conversation;if(!d)return;const c=s.characters.find(x=>x.id===d.id);if(d.round===0){d.choice=d.busy?'leave':choice;d.round=1;d.text=choice==='push'?`「${c.boundaries}，請不要替我決定。」`:choice==='leave'?'「謝謝你體諒，我們下次聊。」':d.story?d.story.reply:`「謝謝你願意聽。${c.memories.at(-1)?.text||c.bio}」`;return;}
const key=d.kind==='key';const last=c.events[d.kind];const fresh=last?.day!==s.day;
if(key){let result=d.choice==='leave'?'not_occurred':d.choice==='push'?(c.key.retry?'temporary_failure':'permanent_failure'):c.key.willing?'success':'permanent_failure';c.events.key={status:result,day:s.day};if(result==='success')c.stage='進一步關係';remember(s,c,result==='success'?'我願意在保留原有生活責任下，認真發展這段關係。':result==='not_occurred'?'我們決定先維持好友。':'我拒絕這次推進，請尊重我的界線。');}
else if(fresh){c.familiarity=clamp(c.familiarity+(d.choice==='push'?0:5));c.trust=clamp(c.trust+(d.choice==='push'?-8:4));c.closeness=clamp(c.closeness+(d.kind==='deep'&&d.choice==='listen'?4:0));c.events[d.kind]={day:s.day,status:d.choice==='push'?'temporary_failure':'success'};remember(s,c,d.story?d.story.title+'：'+(d.choice==='listen'?d.story.reply:'這次沒有取得共識。'):d.choice==='push'?'談話讓我感到壓力。':d.choice==='leave'?'你體諒我的生活安排。':'你聽了我的心事。');}
s.conversation=null;advance(s);
}
function keyAvailable(s,c){return !status(s,c).busy&&(!CityData.STORIES[c.name]||c.events.life2?.status==='success')&&c.familiarity>=c.key.minimum&&c.trust>=c.key.trust&&!['success','permanent_failure'].includes(c.events.key?.status)&&c.events.key?.day!==s.day;}
return {normalizeCharacter,safeState,createState,BALANCE,prepare,status,label,begin,choose,advance,keyAvailable};
})();
