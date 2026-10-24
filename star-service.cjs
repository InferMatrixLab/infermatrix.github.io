'use strict';
const {randomBytes}=require('node:crypto');
const repositories=require('./star-repositories.json');

// Single-process, short-lived sessions. Never serialize tokens or log upstream responses.
function createStarService({clientId='',origin='http://127.0.0.1:4173',fetcher=fetch,now=Date.now,pause=ms=>new Promise(r=>setTimeout(r,ms))}={}) {
  const sessions=new Map();
  const forget=key=>{clearTimeout(sessions.get(key)?.timer);sessions.delete(key);};
  const cookieName=new URL(origin).protocol==='https:'?'__Host-infermatrix-star':'infermatrix-star';
  async function upstream(url,options){return fetcher(url,{...options,redirect:'error',signal:AbortSignal.timeout(15000)});}
  async function oauth(path,params){const r=await upstream('https://github.com/login/'+path,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params)});if(!r.ok)throw Error('upstream');return r.json();}
  return async function handle(req,res){
    const path=new URL(req.url,origin).pathname;
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(JSON.stringify(data));};
    if(path==='/api/stars/status' && req.method==='GET'){send(200,{configured:!!clientId,repositories});return;}
    if(req.method!=='POST'){send(405,{error:'method'});return;}
    if(req.headers.origin!==origin || req.headers['x-requested-with']!=='InferMatrixStars'){send(403,{error:'origin'});return;}
    for(const [key,s]of sessions)if(s.expires<=now()&&!s.busy)forget(key);
    const id=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    let session=sessions.get(id);
    const cookie=(value,age)=>res.setHeader('Set-Cookie',`${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${origin.startsWith('https:')?'; Secure':''}`);
    if(path==='/api/stars/logout'){forget(id);cookie('',0);send(200,{ok:true});return;}
    if(!clientId){send(503,{error:'not_configured'});return;}
    try {
      if(path==='/api/stars/start'){
        if(session){send(409,{error:'session_exists'});return;}
        if(sessions.size>=100){send(429,{error:'busy'});return;}
        // Reserve capacity before awaiting GitHub, limiting concurrent anonymous starts.
        const key=randomBytes(32).toString('hex');
        session={expires:now()+15*60*1000,busy:true,done:new Set()};sessions.set(key,session);
        session.timer=setTimeout(()=>forget(key),15*60*1000);session.timer.unref?.();
        let d;
        try{d=await oauth('device/code',{client_id:clientId});}catch{forget(key);throw Error('upstream');}
        if(d.error || !d.device_code || !d.user_code){forget(key);send(502,{error:'authorization_unavailable'});return;}
        session.device=d.device_code;session.interval=Math.max(5,Number(d.interval)||5);session.next=now()+session.interval*1000;
        session.expires=now()+Math.min(900,Number(d.expires_in)||900)*1000;session.busy=false;
        cookie(key,900);send(200,{userCode:d.user_code,verificationUri:'https://github.com/login/device',interval:session.interval});return;
      }
      if(!session || session.expires<=now()){send(401,{error:'expired'});return;}
      if(session.busy){send(409,{error:'busy'});return;}
      if(path==='/api/stars/poll'){
        if(session.token){send(200,{authorized:true});return;}
        if(now()<session.next){send(200,{pending:true,interval:session.interval});return;}
        session.busy=true;
        try{
          const d=await oauth('oauth/access_token',{client_id:clientId,device_code:session.device,grant_type:'urn:ietf:params:oauth:grant-type:device_code'});
          if(d.error==='slow_down')session.interval+=5;
          session.next=now()+session.interval*1000;
          if(['authorization_pending','slow_down'].includes(d.error)){send(200,{pending:true,interval:session.interval});return;}
          if(!d.access_token){forget(id);cookie('',0);send(401,{error:'authorization_denied'});return;}
          session.token=d.access_token;delete session.device;
          session.expires=Math.min(session.expires,now()+(Number(d.expires_in)||900)*1000);
          send(200,{authorized:true});return;
        }finally{session.busy=false;}
      }
      if(path==='/api/stars/all'){
        if(!session.token){send(401,{error:'authorize_first'});return;}
        session.busy=true;
        const results=[];
        try{
          for(const repository of repositories){
            if(!sessions.has(id))break;
            if(session.done.has(repository)){results.push({repository,ok:true});continue;}
            let status=0;
            try{const r=await upstream('https://api.github.com/user/starred/'+repository,{method:'PUT',headers:{Authorization:'Bearer '+session.token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'InferMatrix-Stars'}});status=r.status;}catch{/* Report only a neutral network error. */}
            const ok=status===204 || status===304;
            if(ok)session.done.add(repository);
            results.push({repository,ok,status});
            // Stop on credentials/rate limits instead of amplifying a failed batch.
            if([401,403,429].includes(status)){if(status===401){delete session.token;session.expires=now();}break;}
            await pause(1000);
          }
          for(const repository of repositories)if(!results.some(r=>r.repository===repository))results.push({repository,ok:session.done.has(repository),status:0});
          send(200,{results});return;
        }finally{session.busy=false;}
      }
      send(404,{error:'not_found'});
    }catch{send(502,{error:'github_unavailable'});}
  };
}
module.exports={createStarService};
