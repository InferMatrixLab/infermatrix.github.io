'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const {createStarService}=require('./star-service.cjs');
const repos=require('./star-repositories.json');
const origin='https://example.com';
async function fixture(t,{configured=true,status=204,pollError=null}={}){
  let time=100000,puts=[],tokenCalls=0;
  const fetcher=async(url,options)=>{
    if(url.endsWith('/device/code'))return Response.json({device_code:'synthetic-device',user_code:'TEST-CODE',interval:5,expires_in:900});
    if(url.endsWith('/access_token')){tokenCalls++;return Response.json(pollError?{error:pollError}:{access_token:'synthetic-token'});}
    assert.match(url,/^https:\/\/api.github.com\/user\/starred\//);assert.equal(options.method,'PUT');assert.equal(options.headers.Authorization,'Bearer synthetic-token');
    puts.push(url.split('/starred/')[1]);return new Response(null,{status:typeof status==='function'?status(puts.length):status});
  };
  const handler=createStarService({clientId:configured?'synthetic-client':'',origin,fetcher,now:()=>time,pause:async()=>{}});
  const server=http.createServer((req,res)=>handler(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
  let cookie='';
  const request=async(path,options={})=>{const r=await fetch(`http://127.0.0.1:${server.address().port}/api/stars/${path}`,{method:'POST',headers:{Origin:origin,'X-Requested-With':'InferMatrixStars',Cookie:cookie,...options.headers},...options});const c=r.headers.get('set-cookie');if(c)cookie=c.split(';')[0];return {status:r.status,data:await r.json(),cookie:c};};
  return {request,advance:ms=>time+=ms,puts,tokenCalls:()=>tokenCalls,login:async()=>{await request('start');time+=5000;return request('poll');}};
}
test('catalog matches every homepage GitHub repository, without duplicate case variants',()=>{
  const linked=[...fs.readFileSync('index.html','utf8').matchAll(/https:\/\/github.com\/([\w.-]+\/[\w.-]+)/g)].map(m=>m[1].toLowerCase());
  assert.deepEqual([...new Set(linked)].sort(),repos.map(r=>r.toLowerCase()).sort());assert.equal(new Set(repos.map(r=>r.toLowerCase())).size,repos.length);
});
test('unconfigured service is explicit and does not authorize',async t=>{const f=await fixture(t,{configured:false});assert.equal((await f.request('status',{method:'GET'})).data.configured,false);assert.equal((await f.request('start')).status,503);});
test('reject cross-origin and missing custom header; batch requires login',async t=>{const f=await fixture(t);assert.equal((await f.request('start',{headers:{Origin:'https://other.example'}})).status,403);assert.equal((await f.request('start',{headers:{Origin:origin}})).status,403);assert.equal((await f.request('all')).status,401);assert.equal(f.puts.length,0);});
test('device polling is throttled and tokens never leave the server; retries are idempotent',async t=>{const f=await fixture(t);const start=await f.request('start');assert.match(start.cookie,/HttpOnly; SameSite=Strict; Path=\/; Max-Age=900; Secure/);assert.equal(start.data.device_code,undefined);assert.equal((await f.request('poll')).data.pending,true);assert.equal(f.tokenCalls(),0);f.advance(5000);assert.deepEqual((await f.request('poll')).data,{authorized:true});const batch=await f.request('all');assert.ok(batch.data.results.every(r=>r.ok));assert.deepEqual(f.puts,repos);await f.request('all');assert.equal(f.puts.length,repos.length);assert.ok(!JSON.stringify(batch).includes('synthetic-token'));});
test('rate limit stops the batch and never reports unattempted stars as success',async t=>{const f=await fixture(t,{status:403});await f.login();const batch=await f.request('all');assert.equal(f.puts.length,1);assert.equal(batch.data.results.length,repos.length);assert.ok(batch.data.results.every(r=>!r.ok));});
test('partial success retries only failed repositories',async t=>{const f=await fixture(t,{status:n=>n===2?500:204});await f.login();assert.equal((await f.request('all')).data.results.filter(r=>r.ok).length,repos.length-1);await f.request('all');assert.equal(f.puts.length,repos.length+1);assert.equal(f.puts.at(-1),repos[1]);});
test('slow_down extends the poll interval; denial and expiry clear sessions',async t=>{const f=await fixture(t,{pollError:'slow_down'});await f.request('start');f.advance(5000);assert.equal((await f.request('poll')).data.interval,10);f.advance(5000);await f.request('poll');assert.equal(f.tokenCalls(),1);f.advance(900000);assert.equal((await f.request('poll')).status,401);const g=await fixture(t,{pollError:'access_denied'});await g.request('start');g.advance(5000);assert.equal((await g.request('poll')).status,401);assert.equal((await g.request('all')).status,401);});
test('logout discards authorization',async t=>{const f=await fixture(t);await f.login();await f.request('logout');assert.equal((await f.request('all')).status,401);assert.equal(f.puts.length,0);});
