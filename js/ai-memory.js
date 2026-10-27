/* Additive, bounded dialogue memory. No model output can become a game command. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CityAI=factory();})(globalThis,()=>{
  'use strict';
  const cut=(x,n=160)=>String(x??'').slice(0,n);
  function memory(x){
    const recent=Array.isArray(x?.recent)?x.recent.slice(-4).filter(r=>r&&typeof r.user==='string'&&typeof r.reply==='string').map(r=>({user:cut(r.user,160),reply:cut(r.reply,240)})):[];
    return {version:1,recent,summary:cut(x?.summary,600)};
  }
  function validate(x){
    if(x===undefined)return;
    if(!x||x.version!==1||typeof x.summary!=='string'||x.summary.length>600||!Array.isArray(x.recent)||x.recent.length>4||x.recent.some(r=>!r||typeof r.user!=='string'||r.user.length>160||typeof r.reply!=='string'||r.reply.length>240))throw Error('AI 記憶格式不正確');
  }
  function append(x,user,reply){
    const m=memory(x);
    if(m.recent.length===4){const r=m.recent.shift();m.summary=cut(m.summary+'\n玩家曾提起：'+r.user+'；芷妍曾回應：'+r.reply,1200).slice(-600);}
    m.recent.push({user:cut(user,160),reply:cut(reply,240)});return m;
  }
  function context(Core,s,c){
    const l=c.life,r=Core.status(s,c);
    return {coreId:'zhiyan',day:s.day,slot:s.slot,location:r.location,workState:cut(r.label+'：'+r.reason,100),brief:!!r.brief,
      relationship:Core.routeStage(c),marital:cut(c.marital,10),job:cut(c.job,50),trait:cut(c.trait,50),hobby:cut(c.hobby,70),
      family:cut(l.boundary+'；子女人數：'+l.family.children.length+'；'+l.family.duties.map(d=>d.label).join('、'),220),
      importantMemories:l.memories.slice(-4).map(m=>cut(m.text,160)),
      promises:l.appointments.slice(-6).map(a=>({label:cut(a.label,60),day:a.day,status:a.status})),
      events:Object.entries(l.records).slice(-33).map(([id,r])=>({id:cut(id,40),status:cut(r.status,24),title:cut(l.events.find(e=>e.id===id)?.title||id,60)})),
      topics:Object.entries(l.talkState||{}).filter(([,r])=>r.stage===2).slice(-20).map(([id])=>cut(id,40)),memory:memory(l.ai)};
  }
  return {memory,validate,append,context};
});
