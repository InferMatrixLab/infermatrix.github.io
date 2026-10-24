'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const asset = 'assets/mira/mira-guide.png';
  const mobile = matchMedia('(max-width: 680px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const storage = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k,v) { try { localStorage.setItem(k,v); } catch { /* Optional preferences. */ } } };
  let isOpen = false, lastTrigger = null, context = null;
  let hidden = storage.get('mira-hidden') === 'true';
  let floatingDismissed = storage.get('mira-floating-dismissed') === 'true';
  const conversation = [];
  const inertBefore = new Map();
  const text = {
    zh: {name:'小矩 MIRA',subtitle:'InferMatrix 项目向导',mode:'交互演示 · 本地资料匹配，未接入模型',hello:'你好，我是小矩。',tag:'YOUR MATRIX COMPANION',intro:'一起找到你的推理起点。',open:'问问小矩',short:'问小矩',welcome:'你好，我是小矩。你想了解项目、找部署配方，还是一起读实验结果？',placeholder:'例如：Apple Silicon 适合看哪个项目？',send:'发送',close:'收起助手',clear:'清空对话',hide:'隐藏小矩',restore:'AI 助手 · 小矩',sources:'参考资料',disclaimer:'预设资料演示 · 回答不由 AI 模型生成',context:'正在了解',you:'你',assistant:'小矩',topics:['选项目','找部署配方','解释架构','读实验结果'],prompts:['帮我选一个合适的项目','我想找模型的部署配方','我想了解项目架构','如何读懂实验结果？'],projectAsk:'问小矩',projectPrompt:'请介绍 {name} 的用途和架构',error:'本地项目资料暂不可用。你仍可直接浏览项目仓库和 Recipes。',empty:'请输入想了解的问题。',limit:'本次演示最多保留 30 轮对话。可以先清空，再继续体验。'},
    en: {name:'MIRA',subtitle:'Your InferMatrix guide',mode:'Interactive demo · local matching, no AI model',hello:'Hello, I’m MIRA.',tag:'YOUR MATRIX COMPANION',intro:'Let’s find your inference starting point.',open:'Ask MIRA',short:'Ask MIRA',welcome:'Hi, I’m MIRA. Shall we explore projects, find a deployment recipe, or read experiment results?',placeholder:'e.g. Which project should I explore for Apple Silicon?',send:'Send',close:'Minimize assistant',clear:'Clear conversation',hide:'Hide MIRA',restore:'AI guide · MIRA',sources:'Sources',disclaimer:'Preset content demo · responses are not AI-generated',context:'Exploring',you:'You',assistant:'MIRA',topics:['Choose a project','Find recipes','Explore architecture','Read experiments'],prompts:['Help me choose a project','Find a model deployment recipe','Explain the project architecture','How should I read experiment results?'],projectAsk:'Ask MIRA',projectPrompt:'Introduce the purpose and architecture of {name}',error:'Local project content is unavailable. You can still explore the repositories and Recipes directly.',empty:'Enter a question to get started.',limit:'This preview keeps up to 30 turns. Clear the conversation to continue.'}
  };
  const locale = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const t = () => text[locale()];
  const restore = document.createElement('button');
  restore.type = 'button'; restore.className = 'mira-restore';
  $('.footer').append(restore);
  const root = document.createElement('div'); root.id = 'mira-root';
  root.innerHTML = `
    <div class="mira-backdrop" hidden></div>
    <button class="mira-launcher" type="button" aria-controls="mira-panel" aria-expanded="false"><span class="mira-avatar"><img src="${asset}" alt="" width="1024" height="1536"></span><span class="mira-launcher-label"></span><span aria-hidden="true">↗</span></button>
    <section class="mira-panel" id="mira-panel" role="dialog" aria-labelledby="mira-title" aria-describedby="mira-mode" hidden>
      <header class="mira-panel-head"><span class="mira-avatar"><img src="${asset}" alt="" width="1024" height="1536"></span><div class="mira-heading"><h2 id="mira-title"></h2><p></p></div><div class="mira-tools"><button type="button" class="mira-icon-button mira-clear">↺</button><button type="button" class="mira-icon-button mira-hide">◌</button><button type="button" class="mira-icon-button mira-close">×</button></div></header>
      <div class="mira-mode" id="mira-mode"></div><div class="mira-context" hidden></div>
      <div class="mira-thread" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="mira-topics"></div>
      <form class="mira-compose"><label class="sr-only" for="mira-input"></label><textarea id="mira-input" rows="2" maxlength="1000"></textarea><button class="mira-send" type="submit"><span aria-hidden="true">↑</span></button></form>
      <p class="mira-footnote"></p>
    </section>`;
  document.body.append(root);
  const launcher = $('.mira-launcher',root);
  $('.header-actions').append(launcher);
  const floatingLauncher = launcher.cloneNode(true);
  floatingLauncher.classList.add('mira-floating');
  const stickerImage = $('img',floatingLauncher);
  stickerImage.loading = 'lazy';
  stickerImage.decoding = 'async';
  stickerImage.src = 'assets/mira/mira-sticker-v1.png';
  floatingLauncher.hidden = true;
  const floatingWidget = document.createElement('div');
  floatingWidget.className = 'mira-floating-widget';
  floatingWidget.hidden = true;
  const dismissSticker = document.createElement('button');
  dismissSticker.type = 'button';
  dismissSticker.className = 'mira-sticker-dismiss';
  dismissSticker.textContent = '×';
  floatingWidget.append(floatingLauncher,dismissSticker);
  root.append(floatingWidget);
  const launchers = [launcher,floatingLauncher];
  const siteHeader = $('.site-header');
  let headerInView = siteHeader.getBoundingClientRect().bottom > 0;
  const panel = $('.mira-panel',root), input = $('#mira-input',root), thread = $('.mira-thread',root);
  let projectList = [];
  const dataReady = fetch('initial-data.json').then(r => { if(!r.ok) throw new Error('Missing project data'); return r.json(); }).then(data => { projectList = data.projects || []; }).catch(() => {});
  const source = (title,url) => ({title,url});
  const repo = 'https://github.com/InferMatrixLab/infermatrix.github.io';
  const recipe = 'https://recipes.infermatrix.si/';
  function answer(query, projectId, lang) {
    const zh = lang === 'zh', q = query.toLowerCase();
    const namedProject = [...projectList].sort((a,b)=>b.name.length-a.name.length).find(p => q.includes(p.name.toLowerCase()));
    const genericSelection = /选.*项目|choose.*project/.test(q);
    const project = namedProject || (!genericSelection && projectList.find(p => p.id === projectId));
    const projectReply = p => ({text: `${p.name}\n\n${p.tagline[lang]}\n\n${p.detail[lang]}`, sources:[source(zh ? `${p.name} · 官方仓库` : `${p.name} · repository`,p.url)],action:{label:zh?'查看站内架构':'View architecture',projectId:p.id}});
    if (/实验|证据|结果|验收|性能|速度|吞吐|延迟|benchmark|evidence|experiment|faster|latency|performance|pass|h200|b300|910b|tts.engine/.test(q)) return {
      text:zh?'读实验结果时，先核对模型、硬件、版本、精度、负载和验证状态，再比较数字。\n\n站内案例有作者报告、原目标未达成和待验证等不同状态，不能混为通用结论。例如，L20X 的来源数据不能替代 H200 实测。缺少验证或环境不匹配时应为 INCONCLUSIVE。\n\n这次演示可以带你阅读资料，不能代替实际实验验收。':'Check model, hardware, revision, precision, workload and validation status before comparing numbers.\n\nThe site distinguishes author-reported outcomes, unmet targets and pending validation. L20X source measurements do not establish H200 performance. Missing validation or environment mismatches mean INCONCLUSIVE.\n\nThis demo helps you navigate evidence; it does not run or certify experiments.',
      sources:[source(zh?'实验案例与适用条件':'Experiments and conditions','#inferrsi'),source('BENCHMARK_EVIDENCE.json',`${repo}/blob/main/BENCHMARK_EVIDENCE.json`)],action:{label:zh?'阅读实验案例':'Explore experiments',anchor:'inferrsi'}};
    if (/recipe|配方|部署|安装|deploy|setup|install|模型|model/.test(q)) return {
      text:zh?'可以先告诉我模型名称、硬件型号，以及你希望实现的功能。\n\nRecipes 是查找部署起点的目录。这个本地演示没有同步实时配方，因此我不会编造匹配项或安装命令；你可以打开目录核对模型与硬件条件。\n\n语音/多模态服务可先了解 vLLM-Omni；Apple Silicon 可先了解 vllm-omni-mlx。':'Start with your model, hardware and intended capability.\n\nRecipes is the deployment starting-point catalog. This local demo does not synchronize live recipes, so it will not invent a matching entry or installation command. Open the catalog to check model and hardware requirements.\n\nvLLM-Omni is a starting point for speech/multimodal serving; vllm-omni-mlx targets Apple Silicon.',
      sources:[source(zh?'Recipes · 部署目录':'Recipes · deployment catalog',recipe),...projectList.filter(p=>['omni','mlx'].includes(p.id)).map(p=>source(p.name,p.url))],action:{label:zh?'浏览 Recipes ↗':'Browse Recipes ↗',url:recipe}};
    if (project) return projectReply(project);
    if (/apple|silicon|mac|苹果|mlx/.test(q)) { const p=projectList.find(p=>p.id==='mlx'); if(p)return projectReply(p); }
    if (/语音|多模态|全双工|speech|audio|multimodal|omni/.test(q)) {const p=projectList.find(p=>p.id==='omni'); if(p)return projectReply(p);}
    if (/路由|router|routing/.test(q)) {const p=projectList.find(p=>p.id==='router');if(p)return projectReply(p);}
    if (/智能体|agent/.test(q)) {const p=projectList.find(p=>p.id==='agent');if(p)return projectReply(p);}
    if (/架构|architecture|diagram/.test(q)) return {text:zh?'你想了解哪个项目？可以从项目卡片上的“问小矩”进入，我会带上项目上下文。\n\n站内架构图支持放大查看；示意图不能单独证明部署拓扑、硬件兼容性或性能结论。':'Which project would you like to explore? Use “Ask MIRA” on a project card to bring its context into this conversation.\n\nYou can zoom into architecture diagrams on the site. Illustrative diagrams alone do not establish deployment topology, hardware compatibility or performance.',sources:[source(zh?'项目与架构':'Projects and architecture','#projects')],action:{label:zh?'选择项目':'Choose a project',anchor:'projects'}};
    if (/项目|选择|介绍|了解|起点|开始|project|choose|start|inferm|hello|hi\b|你好/.test(q)) return {text:zh?'InferMatrix 连接七个开源推理项目。你可以按目标选择起点：\n\n• 多模态/语音：vLLM-Omni\n• Apple Silicon：vllm-omni-mlx\n• 大规模请求转发：vLLM Router\n• 智能体工作负载：agent-infer\n• Attention–FFN 分离：afd-plugin\n• 循环迭代 Transformer：vllm-rlt\n• 优化实验与证据：InferRSI\n\n告诉我你感兴趣的方向，或从项目卡片开始。':'InferMatrix connects seven open-source inference projects:\n\n• Speech/multimodal: vLLM-Omni\n• Apple Silicon: vllm-omni-mlx\n• Request forwarding: vLLM Router\n• Agent workloads: agent-infer\n• Attention–FFN disaggregation: afd-plugin\n• Recurrent looped transformers: vllm-rlt\n• Optimization experiments and evidence: InferRSI\n\nChoose a direction or start from a project card.',sources:[source(zh?'InferMatrix 项目说明':'InferMatrix project overview',`${repo}/blob/main/README.md`)],action:{label:zh?'探索项目':'Explore projects',anchor:'projects'}};
    return {text:zh?'这个问题超出了当前本地演示的预设资料范围，我还不能给出可靠回答。\n\n你可以试试“帮我选项目”“找部署配方”“解释架构”或“如何读实验结果”。接入模型与资料检索后，才能扩展为自由问答。':'This question is outside this local demo’s preset content, so I cannot give a reliable answer.\n\nTry choosing a project, finding recipes, exploring architecture or reading experiment results. Open-ended conversation requires a model and retrieval service.',sources:[source(zh?'项目目录':'Project catalog','#projects'),source('Recipes',recipe)]};
  }
  function safeUrl(raw) {
    if(raw.startsWith('#'))return raw;
    try { const u=new URL(raw); return u.protocol==='https:' && ['github.com','recipes.infermatrix.si'].includes(u.hostname) ? u.href : null; } catch {return null;}
  }
  function navigateAnchor(id) {
    closePanel(false);
    const target=document.getElementById(id);if(!target)return;
    const hadTabindex=target.hasAttribute('tabindex');
    if(!hadTabindex){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}
    target.scrollIntoView({behavior:motion.matches?'auto':'smooth'});target.focus({preventScroll:true});
  }
  function openArchitecture(projectId) {
    const trigger=document.querySelector(`[data-open-project="${projectId}"]`);
    if(!trigger)return;
    closePanel(false);trigger.click();
    const dialog=$('#project-dialog');
    if(dialog.open)dialog.addEventListener('close',()=>requestAnimationFrame(()=>{if(!isOpen)returnToAssistantTrigger();}),{once:true});
  }
  function addMessage(role,content) {
    const row=document.createElement('article');row.className=`mira-message mira-message-${role}`;
    const label=document.createElement('div');label.className='mira-message-label';label.textContent=role==='user'?t().you:t().assistant;row.append(label);
    const body=document.createElement('div');body.className='mira-message-content';body.textContent=content.text;row.append(body);
    if(content.sources?.length){const box=document.createElement('div');box.className='mira-sources';const heading=document.createElement('span');heading.textContent=t().sources;box.append(heading);content.sources.forEach(s=>{const href=safeUrl(s.url);if(!href)return;const a=document.createElement('a');a.textContent=s.title+' ↗';a.href=href;if(href.startsWith('#'))a.addEventListener('click',event=>{event.preventDefault();navigateAnchor(href.slice(1));});else{a.target='_blank';a.rel='noopener noreferrer';}box.append(a);});row.append(box);}
    if(content.action){const a=content.action;const button=document.createElement(a.url?'a':'button');button.className='mira-message-action';button.textContent=a.label;if(a.url){button.href=safeUrl(a.url);button.target='_blank';button.rel='noopener noreferrer';}else{button.type='button';button.addEventListener('click',()=>{if(a.projectId){openArchitecture(a.projectId);}else{navigateAnchor(a.anchor);}});}row.append(button);}
    thread.append(row);
  }
  function renderThread() {
    thread.replaceChildren();addMessage('assistant',{text:t().welcome});
    conversation.forEach(turn=>{addMessage('user',{text:turn.query});addMessage('assistant',answer(turn.query,turn.projectId,locale()));});
    thread.scrollTop=thread.scrollHeight;
  }
  function syncMobile() {
    document.body.classList.toggle('mira-modal',isOpen && mobile.matches);
    $('.mira-backdrop',root).hidden=!(isOpen && mobile.matches);
    panel.setAttribute('aria-modal',String(isOpen && mobile.matches));
    if(isOpen && mobile.matches){for(const el of document.body.children){if(el!==root && el.tagName!=='SCRIPT' && !inertBefore.has(el)){inertBefore.set(el,el.inert);el.inert=true;}}if(!panel.contains(document.activeElement))requestAnimationFrame(()=>input.focus());}
    else{inertBefore.forEach((was,el)=>{el.inert=was;});inertBefore.clear();}
  }
  function syncLaunchers() {
    floatingWidget.hidden = headerInView || hidden || isOpen || floatingDismissed;
    floatingLauncher.hidden = floatingWidget.hidden;
    launchers.forEach(button=>button.setAttribute('aria-expanded',String(isOpen)));
  }
  function openPanel(trigger,projectId=null) {
    lastTrigger=trigger || document.activeElement;
    if(hidden){hidden=false;storage.set('mira-hidden','false');}
    if(trigger===launcher || trigger===restore){floatingDismissed=false;storage.set('mira-floating-dismissed','false');}
    context=projectId ? projectList.find(p=>p.id===projectId) : null;
    isOpen=true;panel.hidden=false;document.body.classList.remove('mira-hidden');document.body.classList.add('mira-open');syncLaunchers();
    syncMobile();updateContext();
    if(context)input.value=t().projectPrompt.replace('{name}',context.name);
    requestAnimationFrame(()=>{input.focus();thread.scrollTop=thread.scrollHeight;});
  }
  function focusReadingArea() {
    const readingArea=$('main');const hadTabindex=readingArea.hasAttribute('tabindex');
    if(!hadTabindex){readingArea.setAttribute('tabindex','-1');readingArea.addEventListener('blur',()=>readingArea.removeAttribute('tabindex'),{once:true});}
    readingArea.focus({preventScroll:true});
  }
  function closePanel(returnFocus=true) {
    isOpen=false;panel.hidden=true;document.body.classList.remove('mira-open');syncLaunchers();syncMobile();
    if(returnFocus)returnToAssistantTrigger();
  }
  function returnToAssistantTrigger() {
    let candidate=hidden?restore:lastTrigger;const rect=candidate?.getBoundingClientRect();if(!candidate?.isConnected || !candidate.getClientRects().length || (!hidden && (rect.bottom<=0 || rect.top>=innerHeight)))candidate=headerInView?launcher:(floatingDismissed?null:floatingLauncher);if(candidate)candidate.focus({preventScroll:!hidden});else focusReadingArea();
  }
  function updateContext(){const el=$('.mira-context',root);el.hidden=!context;el.replaceChildren();if(context){const name=document.createElement('span');name.textContent=`${t().context} · ${context.name}`;const clear=document.createElement('button');clear.type='button';clear.textContent=locale()==='zh'?'退出上下文 ×':'Clear context ×';clear.addEventListener('click',()=>{context=null;input.value='';updateContext();input.focus();});el.append(name,clear);}}
  function translate() {
    const d=t();restore.textContent=d.restore;
    const dismissText=locale()==='zh'?'隐藏悬浮贴图':'Hide floating sticker';dismissSticker.setAttribute('aria-label',dismissText);dismissSticker.title=dismissText;
    $('#mira-title',root).textContent=d.name;$('.mira-heading p',root).textContent=d.subtitle;launchers.forEach(button=>{$('.mira-launcher-label',button).textContent=d.short;button.setAttribute('aria-label',d.open);button.title=d.open;});
    $('.mira-mode',root).textContent=d.mode;$('.mira-footnote',root).textContent=d.disclaimer;input.placeholder=d.placeholder;$('.mira-compose label',root).textContent=d.open;
    for(const [cls,key] of [['.mira-close','close'],['.mira-clear','clear'],['.mira-hide','hide'],['.mira-send','send']]){$(cls,root).setAttribute('aria-label',d[key]);$(cls,root).title=d[key];}
    const topics=$('.mira-topics',root);topics.replaceChildren();d.topics.forEach((s,i)=>{const button=document.createElement('button');button.type='button';button.textContent=s;button.addEventListener('click',()=>submit(d.prompts[i]));topics.append(button);});updateContext();renderThread();decorateProjects();
  }
  async function submit(query) {
    const clean=query.trim();if(!clean){input.focus();return;}await dataReady;
    if(conversation.length>=30){addMessage('assistant',{text:t().limit});thread.scrollTop=thread.scrollHeight;return;}
    conversation.push({query:clean.slice(0,1000),projectId:context?.id || null});input.value='';renderThread();
  }
  function decorateProjects() {
    document.querySelectorAll('.project-card').forEach(card=>{let button=$('.mira-project-ask',card);if(!button){button=document.createElement('button');button.type='button';button.className='mira-project-ask';button.dataset.miraProject=card.dataset.project;card.append(button);}button.textContent=t().projectAsk+' ↗';});
  }
  [...launchers,restore].forEach(el=>el.addEventListener('click',()=>{if(isOpen)closePanel();else openPanel(el);}));
  dismissSticker.addEventListener('click',()=>{
    floatingDismissed=true;storage.set('mira-floating-dismissed','true');syncLaunchers();
    focusReadingArea();
  });
  $('.mira-close',root).addEventListener('click',()=>closePanel());$('.mira-backdrop',root).addEventListener('click',()=>closePanel());
  $('.mira-clear',root).addEventListener('click',()=>{conversation.length=0;context=null;input.value='';updateContext();renderThread();input.focus();});
  $('.mira-hide',root).addEventListener('click',()=>{hidden=true;storage.set('mira-hidden','true');document.body.classList.add('mira-hidden');closePanel();});
  $('.mira-compose',root).addEventListener('submit',event=>{event.preventDefault();submit(input.value);});
  input.addEventListener('keydown',event=>{if(event.key==='Enter' && !event.shiftKey && !event.isComposing){event.preventDefault();submit(input.value);}});
  document.addEventListener('click',async event=>{const button=event.target.closest('[data-mira-project]');if(button){await dataReady;openPanel(button,button.dataset.miraProject);}});
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePanel();}if(event.key==='Tab' && mobile.matches){const controls=Array.from(panel.querySelectorAll('button,a[href],textarea')).filter(el=>!el.disabled && el.getClientRects().length);const first=controls[0],last=controls[controls.length-1];if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}});
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  new MutationObserver(decorateProjects).observe($('#project-grid'),{childList:true});
  new IntersectionObserver(entries=>{headerInView=entries[0].isIntersecting;syncLaunchers();},{threshold:0}).observe(siteHeader);
  function syncMotion(){document.body.classList.toggle('mira-paused',motion.matches || $('#motion-toggle')?.getAttribute('aria-pressed')==='true');}
  new MutationObserver(syncMotion).observe($('#motion-toggle'),{attributes:true,attributeFilter:['aria-pressed']});motion.addEventListener('change',syncMotion);mobile.addEventListener('change',syncMobile);
  function syncDialogs(){const blocked=!!document.querySelector('dialog[open]') || !!document.fullscreenElement;document.body.classList.toggle('mira-modal-blocked',blocked);if(blocked && isOpen)closePanel(false);}
  document.querySelectorAll('dialog').forEach(d=>new MutationObserver(syncDialogs).observe(d,{attributes:true,attributeFilter:['open']}));document.addEventListener('fullscreenchange',syncDialogs);
  if(hidden)document.body.classList.add('mira-hidden');
  translate();syncMotion();syncDialogs();syncLaunchers();dataReady.then(()=>{if(conversation.length)renderThread();});
})();
