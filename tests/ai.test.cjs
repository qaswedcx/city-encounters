'use strict';
const test=require('node:test'),a=require('node:assert/strict'),C=require('../js/core'),A=require('../js/ai-memory'),{randomUUID}=require('node:crypto');
function fixture(){const s=C.createState();C.prepare(s,()=>.99);const c=s.characters[2];c.life.records.life1={day:1,status:'success'};return {s,c,b:{coreId:'zhiyan',message:'上次的麵團後來呢？',context:A.context(C,s,c)}};}
test('AI memories migrate additively and JSON roundtrip; bounded history contains no other NPCs/full save',()=>{
 const {s,c}=fixture();const before=JSON.stringify(c.life.records);
 for(let i=0;i<50;i++)c.life.ai=A.append(c.life.ai,'這是話題'+i,'回應'.repeat(400));
 a.equal(c.life.ai.recent.length,4);a.ok(c.life.ai.summary.length<=600);a.deepEqual(C.safeState(JSON.parse(JSON.stringify(s))),s);a.equal(JSON.stringify(c.life.records),before);
 const context=A.context(C,s,c),raw=JSON.stringify(context);a.ok(!raw.includes('林若晴'));a.ok(!raw.includes('characters'));a.ok(context.events.some(e=>e.id==='life1'&&e.status==='success'));a.equal(context.relationship,'初識');
 for(const version of [1,2,3,4]){const old=JSON.parse(JSON.stringify(s));old.version=version;delete old.characters[2].life.ai;a.ok(C.safeState(old));}
 c.life.ai.summary='x'.repeat(601);a.throws(()=>C.safeState(s));
});
test('Worker validates, authenticates, limits, gates free plan and only returns text/end',async()=>{
 const W=await import('../worker/index.mjs'),{b}=fixture();let calls=0,allowed=true;
 const password=randomUUID(),origin='https://qaswedcx.github.io';
 const env={ALLOWED_ORIGIN:origin,ACCESS_PASSWORD:password,AI_ENABLED:'true',FREE_MODEL_VERIFIED_ON:new Date().toISOString().slice(0,10),CHAT_LIMITER:{async limit(){return {success:allowed};}},AI:{async run(model,input){calls++;a.equal(model,W.MODEL);a.equal(input.max_tokens,384);a.ok(input.messages[0].content.includes('life1'));a.ok(input.messages[0].content.includes('不能重演'));return {response:'嗯，上次試過的麵團我記得。今天慢慢聊。\n[END]',trust:100,events:{key:'success'}};}}};
 const req=(body=b,auth='Bearer '+password,from=origin)=>new Request('https://test.workers.dev/chat',{method:'POST',headers:{Origin:from,Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(body)});
 a.equal((await W.default.fetch(req(b,'bad'),env)).status,401);a.equal((await W.default.fetch(req(b,undefined,'https://evil.example'),env)).status,403);a.equal(calls,0);
 allowed=false;a.equal((await W.default.fetch(req(),env)).status,429);allowed=true;
 a.equal((await W.default.fetch(req(),{...env,CHAT_LIMITER:null})).status,503);
 a.equal((await W.default.fetch(req(),{...env,FREE_MODEL_VERIFIED_ON:''})).status,503);
 a.equal((await W.default.fetch(req(),{...env,AI_ENABLED:'false'})).status,503);a.equal(calls,0);
 for(const mutate of [x=>x.message='x'.repeat(601),x=>x.context.coreId='ruoqing',x=>x.save={},x=>x.context.characters=[],x=>x.context.memory.recent=Array(5).fill({user:'x',reply:'x'}),x=>x.context.memory.secret='extra']){const x=structuredClone(b);mutate(x);a.equal((await W.default.fetch(req(x),env)).status,400);}
 const r=await W.default.fetch(req(),env);a.equal(r.status,200);a.equal(r.headers.get('Access-Control-Allow-Origin'),origin);a.deepEqual(await r.json(),{reply:'嗯，上次試過的麵團我記得。今天慢慢聊。',end:true});a.equal(calls,1);
 a.equal((await W.default.fetch(req(),{...env,AI:{run(){throw Error('quota exhausted');}}})).status,503);
 a.equal((await W.default.fetch(req(),{...env,AI:{run(){return {response:'<think>hidden</think>Hi'};}}})).status,503);
 a.throws(()=>W.messages({...b,context:{...b.context,importantMemories:['x'.repeat(161)]}}));
});
test('Worker timeout fails safely without retries',async t=>{
 const W=await import('../worker/index.mjs'),{b}=fixture(),password=randomUUID();let calls=0,started;
 const reached=new Promise(resolve=>started=resolve);
 t.mock.timers.enable({apis:['setTimeout']});
 try{
 const response=W.default.fetch(new Request('https://test.workers.dev/chat',{method:'POST',headers:{Origin:'https://qaswedcx.github.io',Authorization:'Bearer '+password,'Content-Type':'application/json'},body:JSON.stringify(b)}),{ALLOWED_ORIGIN:'https://qaswedcx.github.io',ACCESS_PASSWORD:password,AI_ENABLED:'true',FREE_MODEL_VERIFIED_ON:new Date().toISOString().slice(0,10),CHAT_LIMITER:{async limit(){return {success:true};}},AI:{run(){calls++;started();return new Promise(()=>{});}}});
 await reached;t.mock.timers.tick(18001);a.equal((await response).status,503);a.equal(calls,1);
 }finally{t.mock.timers.reset();}
});
