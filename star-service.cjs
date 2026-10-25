'use strict';
const {randomBytes,createHash,timingSafeEqual}=require('node:crypto');
const repositories=require('./star-repositories.json');

function createStarService({clientId='',clientSecret='',origin='http://127.0.0.1:4173',demo=false,fetcher=fetch,now=Date.now,pause=ms=>new Promise(r=>setTimeout(r,ms))}={}) {
  const site=new URL(origin);
  if(demo && !['127.0.0.1','localhost','[::1]'].includes(site.hostname))throw Error('Demo is loopback-only');
  const configured=demo || !!(clientId && clientSecret);
  const callback=origin+'/api/stars/callback';
  const sessions=new Map();
  const forget=key=>{clearTimeout(sessions.get(key)?.timer);sessions.delete(key);};
  const cookieName=site.protocol==='https:'?'__Host-infermatrix-star':'infermatrix-star';
  const matches=(a,b)=>typeof a==='string' && typeof b==='string' && Buffer.byteLength(a)===Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a),Buffer.from(b));
  async function upstream(url,options){return fetcher(url,{...options,redirect:'error',signal:AbortSignal.timeout(15000)});}
  return async function handle(req,res){
    const url=new URL(req.url,origin),path=url.pathname;
    const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
    const send=(status,data)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(data));};
    const redirect=result=>{res.writeHead(303,{...headers,Location:'/?star='+result+'#projects'});res.end();};
    for(const [key,s]of sessions)if(s.expires<=now())forget(key);
    const id=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    const session=sessions.get(id);
    // Lax is required for GitHub's top-level callback; state + PKCE bind that callback.
    const cookie=(value,age)=>res.setHeader('Set-Cookie',`${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${site.protocol==='https:'?'; Secure':''}`);
    if(path==='/api/stars/status' && req.method==='GET'){send(200,{configured,demo,repositories});return;}
    if(path==='/api/stars/demo-consent' && req.method==='GET'){
      if(!demo || !session || !matches(url.searchParams.get('state'),session.state)){send(404,{error:'not_found'});return;}
      const state=session.state;
      res.writeHead(200,{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"});
      res.end(`<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><title>本地模拟授权</title><style>body{background:#060d1c;color:#edf6ff;font:16px/1.8 system-ui;margin:0;padding:24px}main{max-width:480px;margin:10vh auto;padding:28px;border:1px solid #45627c;border-radius:18px}a{display:block;margin:18px 0;color:#9fdae4}.allow{padding:12px;background:#1769ab;color:white;border-radius:8px;text-align:center;text-decoration:none}</style><main><p>本地模拟 · 不连接 GitHub</p><h1>允许添加 Star？</h1><p>模拟为主页列出的 ${repositories.length} 个仓库添加 Star。这里不需要账号、密码或验证码，也不会修改真实 Star。</p><a class="allow" href="/api/stars/callback?state=${state}&amp;code=synthetic-code">模拟允许并返回主页</a><a href="/api/stars/callback?state=${state}&amp;error=access_denied">取消</a></main></html>`);return;
    }
    if(path==='/api/stars/callback' && req.method==='GET'){
      if(!session || !matches(url.searchParams.get('state'),session.state)){send(400,{error:'invalid_state'});return;}
      if(session.busy){send(409,{error:'busy'});return;}
      if(url.searchParams.has('error') || !url.searchParams.get('code')){forget(id);cookie('',0);redirect('denied');return;}
      session.busy=true;
      try{
        let d;
        if(demo)d={access_token:'synthetic-demo-token'};
        else{
          const r=await upstream('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,code:url.searchParams.get('code'),redirect_uri:callback,code_verifier:session.verifier})});
          if(!r.ok)throw Error('exchange');d=await r.json();
        }
        if(!sessions.has(id)){redirect('expired');return;}
        if(!d.access_token)throw Error('exchange');
        session.token=d.access_token;session.ready=true;delete session.state;delete session.verifier;
        session.expires=Math.min(session.expires,now()+(Number(d.expires_in)||900)*1000);
        redirect('authorized');return;
      }catch{forget(id);cookie('',0);redirect('error');return;}finally{session.busy=false;}
    }
    if(req.method!=='POST'){send(405,{error:'method'});return;}
    if(req.headers.origin!==origin || req.headers['x-requested-with']!=='InferMatrixStars'){send(403,{error:'origin'});return;}
    if(path==='/api/stars/logout'){forget(id);cookie('',0);send(200,{ok:true});return;}
    if(!configured){send(503,{error:'not_configured'});return;}
    if(path==='/api/stars/start'){
      if(session){send(409,{error:'session_exists'});return;}
      if(sessions.size>=100){send(429,{error:'busy'});return;}
      const key=randomBytes(32).toString('hex'),state=randomBytes(32).toString('hex'),verifier=randomBytes(48).toString('base64url');
      const s={expires:now()+15*60*1000,state,verifier,busy:false,done:new Set()};sessions.set(key,s);
      s.timer=setTimeout(()=>forget(key),15*60*1000);s.timer.unref?.();cookie(key,900);
      const authorize=new URL(demo?origin+'/api/stars/demo-consent':'https://github.com/login/oauth/authorize');
      authorize.search=new URLSearchParams(demo?{state}:{client_id:clientId,redirect_uri:callback,state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'}).toString();
      send(200,{authorizeUrl:authorize.href});return;
    }
    if(!session){send(401,{error:'expired'});return;}
    if(session.busy){send(409,{error:'busy'});return;}
    if(path==='/api/stars/resume'){const authorized=!!(session.token&&session.ready);session.ready=false;send(200,{authorized});return;}
    if(path==='/api/stars/all'){
      if(!session.token){send(401,{error:'authorize_first'});return;}
      session.busy=true;const results=[];
      try{
        for(const repository of repositories){
          if(!sessions.has(id) || session.expires<=now())break;
          if(session.done.has(repository)){results.push({repository,ok:true});continue;}
          let status=0;
          try{status=demo?204:(await upstream('https://api.github.com/user/starred/'+repository,{method:'PUT',headers:{Authorization:'Bearer '+session.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'InferMatrix-Stars'}})).status;}catch{/* Neutral error only. */}
          const ok=status===204 || status===304;if(ok)session.done.add(repository);
          results.push({repository,ok,status});
          if([401,403,429].includes(status)){if(status===401){delete session.token;session.expires=now();}break;}
          await pause(demo?150:1000);
        }
        for(const repository of repositories)if(!results.some(r=>r.repository===repository))results.push({repository,ok:session.done.has(repository),status:0});
        send(200,{results,demo});return;
      }finally{session.busy=false;}
    }
    send(404,{error:'not_found'});
  };
}
module.exports={createStarService};
