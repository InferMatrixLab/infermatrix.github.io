'use strict';
(() => {
  const zh=()=>document.documentElement.lang.startsWith('zh');
  const copy=(a,b)=>zh()?a:b;
  const entry=document.createElement('button');entry.className='star-all-entry button button-secondary';entry.type='button';
  document.querySelector('#projects .section-heading').append(entry);
  const banner=document.createElement('div');banner.className='star-demo-banner';banner.hidden=true;document.body.prepend(banner);
  const dialog=document.createElement('dialog');dialog.className='star-all-dialog';dialog.setAttribute('aria-labelledby','star-all-title');
  dialog.innerHTML='<button type="button" class="star-all-close">×</button><h2 id="star-all-title"></h2><p class="star-all-description"></p><details><summary></summary><ul class="star-all-list"></ul></details><p class="star-all-status" role="status" aria-live="polite"></p><button type="button" class="star-all-submit button button-primary"></button>';
  document.body.append(dialog);
  const $=s=>dialog.querySelector(s),button=$('.star-all-submit'),status=$('.star-all-status');
  let configured=false,demo=false,busy=false,authorized=false,generation=0,catalog=[],results=null,phase='loading';
  const request=async path=>{const r=await fetch('/api/stars/'+path,{method:'POST',credentials:'same-origin',headers:{'X-Requested-With':'InferMatrixStars'}});const d=await r.json();if(!r.ok)throw Error(d.error||'unavailable');return d;};
  let authorizationRequests=Promise.resolve();
  const api=path=>{if(path==='all')return request(path);const op=authorizationRequests.then(()=>request(path));authorizationRequests=op.catch(()=>{});return op;};
  function translate(){
    entry.textContent=copy('☆ 一键 Star 全部仓库','☆ Star all repositories');
    banner.hidden=!demo;banner.textContent=copy('本地模拟测试 · 不会登录 GitHub 或修改真实 Star','Local simulation · no GitHub login or real stars');
    $('.star-all-close').setAttribute('aria-label',copy('关闭 Star 窗口','Close Star dialog'));
    $('#star-all-title').textContent=copy('支持 InferMatrix 开源生态','Support the InferMatrix ecosystem');
    $('.star-all-description').textContent=copy(`一次支持主页展示的 ${catalog.length} 个仓库。前往 GitHub 登录并授权，返回后自动完成。已添加的 Star 保持不变。`,`Support all ${catalog.length} repositories. Sign in and authorize on GitHub; stars are added automatically when you return. Existing stars stay starred.`);
    $('summary').textContent=copy(`查看全部 ${catalog.length} 个仓库`,`View all ${catalog.length} repositories`);
    button.textContent=busy?copy('正在处理…','Working…'):phase==='done'&&results?.every(r=>r.ok)?copy(demo?'模拟体验完成 ✓':'已完成 ✓',demo?'Simulation complete ✓':'Complete ✓'):authorized?copy('重试未成功的仓库','Retry unsuccessful repositories'):demo?copy('体验模拟授权 →','Try simulated authorization →'):copy('前往 GitHub 授权并 Star →','Authorize on GitHub & star →');
    const messages={loading:copy('正在加载…','Loading…'),ready:demo?copy('模拟流程：确认授权 → 自动返回 → 展示结果。不会产生真实 Star。','Simulation: approve → return → view results. No real stars are added.'):copy('只需在 GitHub 确认一次，无需复制验证码或提供访问令牌。','Approve on GitHub. No verification code or access token to copy.'),unconfigured:copy('授权服务尚未配置。你仍可展开清单访问各仓库。','Authorization is not configured. Expand the list to visit the repositories.'),authorizing:copy('正在前往授权页面…','Opening authorization…'),resuming:copy('正在恢复授权，请稍候…','Restoring authorization, please wait…'),starring:copy('正在逐个添加 Star，请稍候…','Starring repositories, please wait…'),error:copy('操作未完成，请重试。已添加的 Star 会保留。','Not completed. Retry to continue; completed stars are retained.'),denied:copy('已取消授权，没有执行新的 Star 操作。','Authorization cancelled. No new stars were added.'),expired:copy('授权已过期，请重新授权。','Authorization expired. Please authorize again.'),done:copy(`${demo?'模拟结果：':''}已 Star ${results?.filter(r=>r.ok).length||0} / ${catalog.length} 个仓库。`,`${demo?'Simulated result: ':''}Starred ${results?.filter(r=>r.ok).length||0} / ${catalog.length} repositories.`)};
    status.textContent=messages[phase]||messages.error;renderList();
  }
  function renderList(){const list=$('.star-all-list');list.replaceChildren();for(const repository of catalog){const li=document.createElement('li'),a=document.createElement('a');a.href='https://github.com/'+repository;a.target='_blank';a.rel='noopener noreferrer';a.textContent=repository;li.append(a);const r=results?.find(x=>x.repository===repository);if(r){const label=document.createElement('span');label.textContent=r.ok?copy(demo?'模拟成功 ✓':'已 Star ✓',demo?'Simulated ✓':'Starred ✓'):copy('未成功 · 可重试','Unsuccessful · retry');label.className=r.ok?'star-ok':'star-error';li.append(label);}list.append(li);}}
  async function configuration(){try{const r=await fetch('/api/stars/status',{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();configured=d.configured;demo=d.demo===true;catalog=d.repositories;}catch{configured=false;demo=false;try{catalog=await (await fetch('star-repositories.json')).json();}catch{catalog=[];}}}
  async function open(resuming=false){const run=++generation;busy=true;phase='loading';authorized=false;results=null;$('details').open=false;button.disabled=true;dialog.showModal();translate();await configuration();if(run!==generation)return null;busy=resuming;phase=resuming?'resuming':configured?'ready':'unconfigured';button.disabled=resuming || !configured;translate();return run;}
  async function star(run){phase='starring';busy=true;button.disabled=true;translate();const d=await api('all');if(run!==generation)return;results=d.results;const expired=results.some(r=>r.status===401);if(expired)authorized=false;phase=expired?'expired':'done';busy=false;button.disabled=results.every(r=>r.ok);$('details').open=true;translate();}
  function fail(error){const expired=['expired','authorize_first'].includes(error?.message);if(expired)authorized=false;phase=expired?'expired':'error';busy=false;button.disabled=!configured;translate();}
  entry.addEventListener('click',()=>{open();});
  button.addEventListener('click',async()=>{
    if(busy)return;busy=true;button.disabled=true;phase='authorizing';translate();const run=generation;
    try{if(authorized){await star(run);return;}await api('logout');if(run!==generation)return;const d=await api('start');if(run!==generation)return;
      const destination=new URL(d.authorizeUrl);
      if(demo ? destination.origin!==location.origin || destination.pathname!=='/api/stars/demo-consent' : destination.origin!=='https://github.com' || destination.pathname!=='/login/oauth/authorize')throw Error('authorization_url');
      location.assign(destination.href);
    }catch(error){if(run===generation)fail(error);}
  });
  $('.star-all-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{generation++;busy=false;authorized=false;results=null;api('logout').catch(()=>{});entry.focus();});
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const returned=new URL(location.href),result=returned.searchParams.get('star');
  if(result){returned.searchParams.delete('star');history.replaceState(null,'',returned.pathname+returned.search+returned.hash);open(result==='authorized').then(async run=>{if(run===null || run!==generation)return;try{if(result==='authorized'){const d=await api('resume');if(run!==generation)return;if(!d.authorized){busy=false;button.disabled=!configured;phase='expired';translate();return;}authorized=true;await star(run);}else{phase=['denied','expired'].includes(result)?result:'error';translate();}}catch(error){if(run===generation)fail(error);}});}
  else configuration().then(translate);
  translate();
})();
