/* Official mainline presentation only: no alternate event graph or game rules. */
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f(require('./story.js'),require('./scene-data.js'),require('./data.js'));else r.CityScenes=f(r.CityStory,r.CitySceneData,r.CityData);})(globalThis,function(Story,Catalog,Data){
'use strict';
const signature=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const official=Object.fromEntries(Object.entries(Story).flatMap(([id,events])=>events.map(e=>[id+'.'+e.id,signature(e)])));
function active(c){const p=c.life.pending,key=c.coreId+'.'+p?.id;return !!(p?.event&&official[key]&&signature(c.life.events.find(e=>e.id===p.id))===official[key]);}
function recipe(s,c,requestedBeat){
 const p=c.life.pending,taste=c.life.records.story2?.path==='respectful';
 const rows={
  0:[['neutral','烤箱的餘溫','打烊後，冰箱的低鳴顯得格外清楚。芷妍擦掉桌邊一點糖粉，放下兩支叉子。','她把其中一支轉向你，自己卻沒有坐下。'],['smile','替你留的一份',taste?'「舊版比較順口——你上次這句話，我回去想了好幾遍。今天還要聽實話。」':'「偏酸的這份留給你。上次你吃第二口的速度，比評分表誠實多了。」','她把另一張椅子拉近，像早就打算跟你分著吃。'],['neutral','不只是試吃','「今天不用幫我打分數。」她把便條翻到背面，「先說，你怎麼又剛好路過？」','問完，她才坐下。窗外最後一間店也收了招牌。']],
  1:[['shy','歪掉的第一刀','她低頭切蛋糕，第一刀歪得很明顯。','刀尖停在盤邊。她沒有立刻把那塊推給你。'],['shy','那句話的意思','「你這樣問，我很難裝作只是在做顧客調查。」她抬眼，「是真的想約我，還是你對每個請你吃甜點的人都這麼說？」','她試著笑，卻沒有像平常那樣替你接下一句。']],
  2:[['shy','回答得太快','「好。」她回答得太快，自己先笑了。','她把切歪的那塊留給自己，將完整的一塊放到你面前。'],['smile','不用準備試吃','「下次挑我休息的日子。地點換你選——那天我不帶試作品，你也別帶評分表。」','她沒有收回剛才的邀請，只把另一支叉子輕輕放進你手邊。']],
  3:[['neutral','收回去的半句','她看著你低下頭，過了一會才把叉子放回盤邊。','冰箱的聲音又清楚了起來。'],['neutral','先吃吧','「也好，先吃吧。涼了口感會變。」','她沒有生氣，但今晚也沒有再提打烊後一起走。']],
  4:[['neutral','果香還能再亮一點','芷妍自己嚐了一口，皺著眉又吃第二口。','這次她沒有急著反駁，而是拿筆在配方旁畫了一個圈。'],['smile','留下來的人','「敢再試。但你要留下來洗模具，別想只負責出主意。」','你把袖口捲起來，她把水龍頭轉向你。桌上的蛋糕，被你們一人一口分完了。']]
 };
 if(c.life.records.story6?.status==='not_occurred'&&p.node===0)rows[0][2]=['neutral','上回沒有說完的話','「上回你忽然說是玩笑，我有一點不知道該怎麼接。」她把叉子放下，「今天不用急著給答案，但也別為了逗我，說自己不想說的話。」','她沒有把椅子挪遠，只等你自己把話接下去。'];
 const beats=rows[p.node];if(!beats)return null;
 const beat=Math.min(requestedBeat??p.sceneBeat??0,beats.length-1),[expression,caption,line,action]=beats[beat];
 return {id:'zhiyan-recipe-v1',expression,caption,line,action,beat,total:beats.length,more:beat<beats.length-1,background:'assets/scenes/cafe-closing.webp',sheet:'assets/characters/zhiyan/recipe-expressions.webp'};
}
// Location and wardrobe are authored per event, never inferred from relationship rewards.
const tiles={market:[0,0],library:[1,0],mall:[2,0],community:[0,1],park:[1,1],cafe:[2,1]};
function get(s,c,requestedBeat){
 if(!active(c))return null;
 const p=c.life.pending,e=c.life.events.find(e=>e.id===p.id),key=c.coreId+'.'+p.id;
 const common={title:e.title,location:Data.PLACES.find(v=>v.id===e.location).name,time:Data.TIMES[e.slot],fallback:'assets/characters/'+c.coreId+'/portrait-default.webp'};
 if(key==='zhiyan.story6')return {...common,...recipe(s,c,requestedBeat),wardrobe:'work',time:'打烊以後'};
 const data=Catalog[key],node=e.nodes[p.node];if(!data||!node)return null;
 const [caption,atmosphere,openingAction]=data.opening;
 const [expression,action]=p.node===0?['neutral',openingAction]:data.cues[p.node-1];
 const line=followup(c,e,p.node)+node.text;
 const beats=p.node===0?[[atmosphere,openingAction],[line,'']]:node.choices.length?[[action,''],[line,'']]:[[line,action]];
 const beat=Math.min(requestedBeat??p.sceneBeat??0,beats.length-1);
 const closing=c.coreId==='zhiyan'&&e.location==='cafe';
 return {...common,id:key+'-scene-v1',expression,caption,line:beats[beat][0],action:beats[beat][1],beat,total:beats.length,more:beat<beats.length-1,wardrobe:data.wardrobe,
  background:closing?'assets/scenes/cafe-closing.webp':'assets/scenes/town-scenes.webp',atlas:closing?null:tiles[e.location],
  sheet:'assets/characters/'+c.coreId+'/'+(data.wardrobe==='daily'?'daily-expressions':c.coreId==='zhiyan'?'recipe-expressions':'story-expressions')+'.webp'};
}
function next(s,c){const d=get(s,c);if(!d?.more)throw Error('沒有下一段演出');c.life.pending.sceneBeat=d.beat+1;}
function ending(s,c){const d=get(s,c,100);return d?{scene:d.id,reply:d.line+'\n'+d.action}:null;}
function followup(c,e,node){
 if(e.id!=='story7'||node!==0||signature(e)!==official[c.coreId+'.story7'])return '';
 const previous=c.life.records.story6;
 if(previous?.status==='success'&&previous.scene===c.coreId+'.story6-scene-v1'){
  if(c.coreId==='ruoqing')return previous.path==='romance'?'若晴把旁邊的椅子拉開。「上次你說還想再來，我記得。今天這張不用搶第一排。」\n\n':'若晴替你留了座位。「今天不用替誰解決事情。上次那樣坐一會，也很好。」\n\n';
  if(c.coreId==='yian')return previous.path==='romance'?'以安先把工作筆電收進袋裡。「上回約好了，今天不准又變成改稿會議。」\n\n':'以安把年鑑放下。「上次說改天請你吃飯，我沒有忘。今天先把書闔起來。」\n\n';
 }
 const r=c.life.records.story6;if(c.coreId!=='zhiyan'||r?.scene!=='zhiyan-recipe-v1'||r.status!=='success')return '';
 return r.path==='romance'?'芷妍看見你，先指了指那盒甜點。「下次說好不當試吃員的。今天這盒算我請你，不列入工作。」\n\n':'芷妍把洗好的模具收進箱裡。「上次搭檔還不錯。今天收工，也留一點時間一起走吧。」\n\n';
}
return {active,get,next,ending,followup};
});
