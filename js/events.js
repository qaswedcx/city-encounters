/* Contextual event content and exact ownership registry; no state or scheduling. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./legacy-events-v1.js'));else r.CityEvents=f(r.CityLegacyEvents);})(globalThis,function(legacy){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function oldEvent(id,title,text,reply,previous=null,key=false,minimum=key?100:0,willing=true,retry=true){return {id,title,key,minimum,trust:key?50:0,willing,retry,previous,location:null,slot:null,deadline:null,nodes:[{text,choices:[{label:'先聽你的想法，尊重你的決定',next:1,effect:'support'},{label:'今天先不推進',result:'not_occurred'},{label:'要求對方照我的安排',result:retry?'temporary_failure':'permanent_failure'}]},{text:reply,choices:[{label:'我願意記住並尊重這個約定',result:willing?'success':'permanent_failure'},{label:'先保持現在的距離',result:'not_occurred'},{label:'要求對方放棄原有生活',result:retry?'temporary_failure':'permanent_failure'}]}]};}
function labels(e,c={}){
 if(e.key)return [`我也想和你約會${c.hobby?'，下次一起'+c.hobby:''}`,'我還沒想好要不要交往，想先把話說清楚','我希望現在就確定關係，不想再等'];
 if(/招牌|設計|草稿|小誌|創作/.test(e.title+e.nodes[0].text))return ['我第一眼看不清主標，能把小字移到背面嗎？','我想先讓沒看過草稿的人讀一次，再決定怎麼改','直接換成我喜歡的字體，今天就定稿吧'];
 if(/花|葉|花籃/.test(e.title+e.nodes[0].text))return ['我幫你把還能用的花材分出來，你來決定怎麼搭','也許不用恢復原樣，我們試試做一束小的？','別再挑了，全照我的配法做吧'];
 if(/麵團|烘焙|烤|甜點/.test(e.title+e.nodes[0].text))return ['先留一份作比較，我陪你記下這次的配方','我覺得先做少量比較穩，這次不急著加單','不用再試了，直接照我的口味改吧'];
 return [`一起試一次「${e.title.slice(0,35)}」的做法，看看哪裡卡住`,`關於「${e.title.slice(0,35)}」，我想先比較另一種做法再答應`,'我想跳過討論，直接替你決定'];
}
function event(id,title,text,reply,previous=null,key=false,minimum=key?100:0,willing=true,retry=true,c){
 const e={id,title,key,minimum,trust:key?50:0,willing,retry,previous,location:null,slot:null,deadline:null,nodes:[{text,choices:[]}]},ls=labels(e,c);
 e.nodes[0].choices=[{label:ls[0],next:1,effect:'support'},{label:ls[1],next:2,effect:'respectful'}];
 e.nodes.push({text:reply,choices:[],result:willing?'success':'permanent_failure'},{text:key?'「那先不要替我們取名字。你想清楚了，再來找我談。」':`「好，我會再想想『${title.slice(0,35)}』的做法。這次先不照原案進行。」`,choices:[],result:'not_occurred'});
 if(key){e.nodes[0].choices.push({label:ls[2],next:3,effect:'intrusive'});e.nodes.push({text:'「你這樣催，我反而更沒辦法回答。今天先到這裡。」',choices:[],result:'temporary_failure'});}
 return e;
}
const after={
 ruoqing:['花藝課收工後，若晴留了一束小花。「這回不是剩下的。今天想一起吃晚飯，還是陪我走回家？」','一起吃晚飯，讓她挑今天想吃的店','她把花塞給你。「那這束先交給你保管。我今天不想再拎東西了。」','陪她走回家，路上聊聊花藝課的趣事','她挽起袋子，步子慢了下來。「那我有件糗事要先跟你說，不准笑太大聲。」'],
 yian:['以安把電腦關了。「今天沒有稿子要你看。附近有場展，想一起去嗎？」','一起看展，約好出來再交換看法','「行，你先別偷看我的評分。」她把兩張票分開，留了一張在你手邊。','提議先吃飯，今天想多跟她聊聊','她看了眼時間，笑了。「比看展還難取悅。好，這次換你選餐廳。」'],
 zhiyan:['芷妍摘下圍裙。「今天收得早。要幫我試新品，還是我們出去吃別人做的？」','帶她出去吃飯，今天不當試吃員','「終於有人替我放假了。」她拿起外套，催你趁自己改變主意前出門。','一起分那份新品，吃完再去散步','她多拿了一支叉子。「可以，但這次不要寫心得。今晚我只想跟你一起吃。」']};
const core=Object.fromEntries(Object.entries(legacy).map(([id,es])=>[id,es.map(old=>{
 const e=event(old.id,old.title,old.nodes[0].text,old.nodes[1]?.text||old.nodes[0].text,old.previous,old.key,old.minimum,old.willing,old.retry);
 for(const k of ['trust','location','slot','deadline'])e[k]=old[k];
 if(old.id==='v03-together'){const a=after[id];e.nodes=[{text:a[0],choices:[{label:a[1],next:1,effect:'support'},{label:a[3],next:2,effect:'respectful'}]},{text:a[2],choices:[],result:'success'},{text:a[4],choices:[],result:'success'}];}
 return e;
})]));
return {legacy,core,event,oldEvent,labels,clone};
});
