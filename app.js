'use strict';

// Diagrams use their own full-resolution files. Provenance is recorded per asset.
const architectureAssets = {
  inferrsi: {src:"assets/architecture/inferrsi.svg",width:1800,height:1120,kind:"docs-vector",sourceUrl:"https://github.com/InferMatrixLab/InferRSI/blob/main/docs/assets/modular-components-en.svg"},
  "omni": {
    "src": "assets/architecture/omni.png",
    "width": 1757,
    "height": 895,
    "kind": "official",
    "sourceUrl": "https://github.com/vllm-project/vllm-omni/blob/main/docs/source/architecture/omni-modality-model-architecture.png"
  },
  "afd": {
    "src": "assets/architecture/afd.svg",
    "width": 1280,
    "height": 720,
    "kind": "official",
    "sourceUrl": "https://github.com/vllm-project/afd-plugin/blob/main/docs/assets/vllm-afd-plugin-architecture.svg"
  },
  "agent": {
    "src": "assets/architecture/agent-poster.svg",
    "width": 1295,
    "height": 1260,
    "kind": "poster-vector",
    "sourceUrl": "assets/infermatrix-poster.png"
  },
  "rlt": {
    "src": "assets/architecture/rlt-poster.svg",
    "width": 1544,
    "height": 1028,
    "kind": "poster-vector",
    "sourceUrl": "assets/infermatrix-poster.png"
  },
  "mlx": {
    "src": "assets/architecture/mlx-poster.svg",
    "width": 1792,
    "height": 1044,
    "kind": "poster-vector",
    "sourceUrl": "assets/infermatrix-poster.png"
  },
  "router": {
    "src": "assets/architecture/router-poster.svg",
    "width": 1800,
    "height": 1360,
    "kind": "poster-vector",
    "sourceUrl": "assets/infermatrix-poster.png"
  }
};
// Repository destinations are intentionally independent: this is an ecosystem showcase.
const projects = [
  { id: 'omni', name: 'vLLM-Omni', category: 'multimodal', url: 'https://github.com/vllm-project/vllm-omni', tagline: { en: 'Easy, fast, and cheap omni-modality model serving for everyone.', zh: '让全模态模型服务变得简单、快速、经济，面向每一位开发者。' }, detail: { en: 'Explore the project’s approach to omni-modality model serving. Read the architecture, supported models, and setup instructions in the official repository.', zh: '探索全模态模型服务的开放实现，在项目仓库中了解架构、支持的模型与部署方式。' } },
  { id: 'afd', name: 'afd-plugin', category: 'infrastructure', url: 'https://github.com/vllm-project/afd-plugin', tagline: { en: 'A vLLM external plugin for Attention-FFN Disaggregation (AFD).', zh: '面向 Attention-FFN 分离（AFD）的 vLLM 外部插件。' }, detail: { en: 'An experimental project exploring Attention-FFN Disaggregation. Consult its repository for current status, supported configurations, and implementation details.', zh: '探索 Attention-FFN 分离的实验性项目。请在仓库中查看当前状态、支持的配置与实现细节。' } },
  { id: 'router', name: 'vLLM Router', category: 'infrastructure', url: 'https://github.com/vllm-project/router', tagline: { en: 'A high-performance, lightweight request forwarding system for large-scale vLLM deployments.', zh: '面向大规模 vLLM 部署的高性能、轻量级请求转发系统。' }, detail: { en: 'Explore request forwarding for large-scale vLLM deployments, with project documentation and architecture available in the official repository.', zh: '探索大规模 vLLM 部署中的请求转发。在项目仓库中查看架构、文档与使用方式。' } },
  { id: 'agent', name: 'agent-infer', category: 'agentic', url: 'https://github.com/openJiuwen-ai/agent-infer', tagline: { en: 'A vLLM-based inference framework for agentic workloads.', zh: '基于 vLLM，面向智能体工作负载的推理框架。' }, detail: { en: 'Discover an inference framework focused on agentic workloads. Explore the framework architecture and follow the repository for current setup and integration guidance.', zh: '聚焦智能体工作负载，探索推理框架架构，并在项目仓库中查看最新的配置与集成指南。' } },
  { id: 'rlt', name: 'vllm-rlt', category: 'recurrent', url: 'https://github.com/ThinkFlowLab/vllm-rlt', tagline: { en: 'A standalone inference and serving engine for recurrent looped transformers.', zh: '面向循环迭代 Transformer（recurrent looped transformers）的独立推理与服务引擎。' }, detail: { en: 'Explore standalone inference and serving for recurrent looped transformers. The poster-matched diagram illustrates the repeated-pass concept; consult the repository for implementation details.', zh: '探索循环迭代 Transformer 的独立推理与模型服务。海报同款架构图展示了多轮计算的概念；具体实现请参阅项目仓库。' } },
  { id: 'mlx', name: 'vllm-omni-mlx', category: 'multimodal', url: 'https://github.com/ThinkFlowLab/vllm-omni-mlx', tagline: { en: 'A lightweight Apple Silicon counterpart of vLLM-Omni.', zh: '面向 Apple Silicon 的轻量级 vLLM-Omni 对应实现。' }, detail: { en: 'Explore a lightweight approach to omni-modality inference on Apple Silicon. Check the repository for supported features, model compatibility, and local setup.', zh: '探索 Apple Silicon 上的轻量级全模态推理。在项目仓库中了解支持的功能、模型兼容性与本地使用方式。' } },
  { id:'inferrsi', name:'InferRSI', category:'optimization', url:'https://github.com/InferMatrixLab/InferRSI', tagline:{zh:'以可验证的实验，推动推理优化与专用引擎探索。',en:'Turn inference bottlenecks into verifiable improvements.'}, detail:{zh:'面向编码智能体的推理优化 CLI 工作台：从性能剖析、重复 A/B 实验与质量检查，到可追溯的证据报告和经验复用。用户提供实验命令并驱动代码修改；并非已实现的全自动优化系统。下方 InferRSI 专区展示两个专用语音引擎案例。',en:'A CLI workbench for inference optimization with coding agents: profiling, repeated A/B experiments, quality gates, traceable evidence and reusable lessons. Users supply experiment commands and drive code changes; this is not a fully autonomous optimizer. Explore two dedicated speech-engine examples in the InferRSI section below.'} }
];
const copy = {
  en: {
    filterOptimization:'Optimization',navVision:'Vision',navProjects:'Projects',navExplore:'Explore',navBuild:'Build with us',
    heroEyebrow:'OPEN SOURCE. OPEN POSSIBILITIES.',heroDescription:'An open-source constellation for the next era of AI inference.',heroSubline:'让每一次推理，都成为下一次进化的起点。',heroCta:'Explore the ecosystem',heroSecondary:'See the connections',scroll:'SCROLL TO DISCOVER',heroBottom:'SEVEN PROJECTS. SHARED INNOVATION.',motion:'MOTION ON',motionOff:'MOTION OFF',
    visionKicker:'THE VISION',visionTitle:'Intelligence moves forward.<br><span>Infrastructure should, too.</span>',visionDescription:'New modalities. New architectures. New ways to think. The future of inference is being built in the open.',visionSecondary:'InferMatrix brings seven open-source projects into view, connecting ideas across models, hardware, and serving infrastructure.',visionCta:'Meet the ecosystem',
    projectsKicker:'THE OPEN-SOURCE ECOSYSTEM',projectsTitle:'Seven projects.<br><span>One open horizon.</span>',projectsDescription:'Explore the code.<br>Understand the architecture.<br>Find your next building block.',filterAll:'All projects',filterMultimodal:'Multimodal',filterInfrastructure:'Infrastructure',filterAgentic:'Agentic',filterRecurrent:'Recurrent',directionOptimization:'Autonomous inference optimization',projectFootnote:'Open-source projects from across the community. Follow each repository for documentation, licensing, and contribution guidelines.',
    exploreKicker:'CONNECTED POSSIBILITIES',exploreTitle:'Find your path<br><span>through the matrix.</span>',exploreDescription:'Different challenges. Shared curiosity.<br>Select a direction to explore the ecosystem.',conceptual:'CONCEPTUAL ECOSYSTEM MAP',exploreRelated:'Explore related projects',conceptNote:'An illustrative map of focus areas, not a deployment topology or compatibility guarantee.',
    sourceKicker:'THE NEXT CHAPTER IS OPEN',sourceTitle:'Build what<br><span>comes next.</span>',sourceDescription:'Start with a repository. Follow an idea.<br>Move inference forward, together.',sourceCta:'Find your project',posterCta:'View the brand poster',backTop:'Back to top',footerNote:'An open-source ecosystem showcase.',downloadPoster:'Download poster ↗',posterTitle:'Six projects. Shared innovation.',posterNote:'Original supplied artwork. The website uses the updated vllm-rlt description: recurrent looped transformers.',download:'Download ↗',
    details:'Architecture & details',github:'GitHub',preview:'VIEW ARCHITECTURE',viewRepo:'View repository',architectureOfficial:'Official architecture image',architectureDocsVector:'Vector diagram redrawn from official documentation',architectureVector:'Vector diagram redrawn from official architecture',architecturePosterVector:'Vector diagram redrawn from the supplied poster',architectureSource:'View source',architectureAlt:'architecture diagram',architectureUnavailable:'Architecture image is being prepared.',zoomIn:'Zoom in',zoomOut:'Zoom out',zoomReset:'Fit to window',zoomActual:'Original size',zoomControls:'Architecture image zoom controls',zoomLevel:'Zoom',zoomHint:'Use + / − to zoom. Scroll to explore the diagram.',viewerLabel:'Scrollable architecture image',openOriginal:'Open original',openVector:'Open vector',downloadArchitecture:'Download image',showing:'SHOWING',direction:'DIRECTION',closeDetails:'Close project details',closePoster:'Close poster',openNav:'Open navigation',closeNav:'Close navigation',pauseMotion:'Pause decorative motion',resumeMotion:'Resume decorative motion',switchLang:'Switch language to Chinese',skip:'Skip to content',mapLabel:'Conceptual map highlighting {names} around an inference core'
  },
  zh: {
    filterOptimization:'优化探索',navVision:'品牌愿景',navProjects:'开源项目',navExplore:'探索生态',navBuild:'一起构建',
    heroEyebrow:'开放源码，无限可能。',heroDescription:'为 AI 推理的下一个时代，连接开放创新的力量。',heroSubline:'让每一次推理，都成为下一次进化的起点。',heroCta:'探索开源生态',heroSecondary:'发现技术连接',scroll:'向下探索',heroBottom:'七个开源项目，共享创新。',motion:'动态效果 开',motionOff:'动态效果 关',
    visionKicker:'品牌愿景',visionTitle:'智能不断向前。<br><span>基础设施，也应持续进化。</span>',visionDescription:'新的模态，新的架构，新的思考方式。推理的未来，正在开放协作中构建。',visionSecondary:'InferMatrix 汇聚七个开源项目，连接模型、硬件与推理服务基础设施中的创新思路。',visionCta:'认识开源生态',
    projectsKicker:'开源项目生态',projectsTitle:'七个项目。<br><span>共同打开新的可能。</span>',projectsDescription:'探索代码，理解架构。<br>找到你的下一个构建起点。',filterAll:'全部项目',filterMultimodal:'多模态',filterInfrastructure:'基础设施',filterAgentic:'智能体',filterRecurrent:'循环推理',directionOptimization:'推理自主优化',projectFootnote:'这里展示来自开源社区的项目。文档、许可证与贡献指南，请以各项目仓库为准。',
    exploreKicker:'连接更多可能',exploreTitle:'在技术矩阵中，<br><span>找到你的探索方向。</span>',exploreDescription:'不同的挑战，共同的好奇心。<br>选择一个方向，探索相关项目。',conceptual:'生态方向概念图',exploreRelated:'查看相关项目',conceptNote:'此图展示项目的研究与应用方向，不代表部署拓扑或兼容性保证。',
    sourceKicker:'下一篇章，由开放开启',sourceTitle:'一起构建，<br><span>下一个可能。</span>',sourceDescription:'从一个仓库开始，让一个想法生长。<br>一起推动推理技术向前。',sourceCta:'找到你的项目',posterCta:'查看品牌海报',backTop:'返回顶部',footerNote:'开放推理生态展示。',downloadPoster:'下载品牌海报 ↗',posterTitle:'六个开源项目，共享创新。',posterNote:'此处保留原始品牌海报。网站已采用更新后的 vllm-rlt 描述：面向 recurrent looped transformers。',download:'下载海报 ↗',
    details:'架构与详情',github:'GitHub',preview:'查看架构',viewRepo:'前往项目仓库',architectureOfficial:'官方架构原图',architectureDocsVector:'依据官方文档重绘（矢量）',architectureVector:'依据官方架构重绘（矢量）',architecturePosterVector:'依据原始海报重绘（矢量）',architectureSource:'查看来源',architectureAlt:'架构图',architectureUnavailable:'架构图正在准备中。',zoomIn:'放大',zoomOut:'缩小',zoomReset:'适应窗口',zoomActual:'原始尺寸',zoomControls:'架构图缩放控制',zoomLevel:'缩放',zoomHint:'点击 + / − 缩放，滚动查看架构细节。',viewerLabel:'可滚动的架构图',openOriginal:'打开原图',openVector:'打开矢量图',downloadArchitecture:'下载架构图',showing:'显示',direction:'探索方向',closeDetails:'关闭项目详情',closePoster:'关闭品牌海报',openNav:'打开导航',closeNav:'关闭导航',pauseMotion:'暂停装饰动画',resumeMotion:'开启装饰动画',switchLang:'Switch language to English',skip:'跳转到主要内容',mapLabel:'概念图：围绕推理核心，突出展示 {names}'
  }
};
const capabilities = {
  multimodal: { number:'01', names:['vLLM-Omni','vllm-omni-mlx'], title:{en:'Beyond a single modality.',zh:'打破单一模态的边界。'}, description:{en:'Explore omni-modality model serving with vLLM-Omni, and its lightweight Apple Silicon counterpart, vllm-omni-mlx.',zh:'通过 vLLM-Omni 探索全模态模型服务，并了解其面向 Apple Silicon 的轻量级对应实现 vllm-omni-mlx。'} },
  agentic: { number:'02', names:['agent-infer'], title:{en:'Inference for agents.',zh:'为智能体工作负载而探索。'}, description:{en:'Discover agent-infer, a vLLM-based inference framework focused on agentic workloads. Follow the project from architecture to implementation.',zh:'认识 agent-infer：基于 vLLM、聚焦智能体工作负载的推理框架。从架构出发，深入了解项目实现。'} },
  infrastructure: { number:'03', names:['afd-plugin','vLLM Router'], title:{en:'Rethink the serving layer.',zh:'重新思考推理服务层。'}, description:{en:'Explore two infrastructure directions: Attention-FFN Disaggregation with the experimental afd-plugin, and large-scale request forwarding with vLLM Router.',zh:'探索两个基础设施方向：实验性 afd-plugin 带来的 Attention-FFN 分离，以及 vLLM Router 面向大规模部署的请求转发。'} },
  recurrent: { number:'04', names:['vllm-rlt'], title:{en:'A different path through inference.',zh:'探索循环迭代推理。'}, description:{en:'Meet vllm-rlt: a standalone inference and serving engine for recurrent looped transformers. Explore its architecture and current implementation in the repository.',zh:'认识 vllm-rlt：面向循环迭代 Transformer 的独立推理与服务引擎。在项目仓库中探索架构与当前实现。'} },
  optimization: { number:'05', names:['InferRSI'], title:{en:'Let inference evolve.',zh:'让推理，在探索中自主进化。'}, description:{en:'Explore InferRSI’s evidence-driven optimization loop: propose changes, benchmark candidates, validate results, and retain failed directions for future investigation. Discover dedicated-engine examples for Qwen3-TTS and Drama-3.',zh:'通过 InferRSI 探索以证据驱动的推理自主优化闭环：提出改进、运行基准、验证结果，并记录失败方向供后续排查。了解 Qwen3-TTS 与 Drama-3 专用引擎示例。'} }
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const safeStorage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* The site works without storage. */ } }
};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let language = safeStorage.get('infermatrix-language') === 'en' ? 'en' : 'zh';
let activeFilter = 'all';
let activeCapability = 'multimodal';
let motionPaused = reducedMotion.matches || safeStorage.get('infermatrix-motion') === 'paused';
let activeProject = null;
let lastDialogTrigger = null;
let architectureZoom = 1;
let architectureFitWidth = 0;
const githubIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.14c-3.1.68-3.75-1.32-3.75-1.32-.51-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.61 1.21 3.24.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14A10.6 10.6 0 0 1 12 6.14c.94 0 1.88.13 2.77.37 2.11-1.44 3.04-1.14 3.04-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.28-2.61 5.22-5.1 5.5.4.35.76 1.03.76 2.07v3.11c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z"/></svg>';
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function categoryLabel(category) { return copy[language]['filter' + category[0].toUpperCase() + category.slice(1)]; }
function architectureMarkup(project, full = false) {
  const asset = architectureAssets[project.id];
  if (!asset) return `<p class="architecture-unavailable">${copy[language].architectureUnavailable}</p>`;
  const t = copy[language];
  return `<img class="architecture-image${full ? ' architecture-image-full' : ''}" src="${escapeHtml(asset.src)}" alt="${escapeHtml(project.name)} ${t.architectureAlt}" width="${asset.width}" height="${asset.height}" loading="${full ? 'eager' : 'lazy'}" decoding="async"${full ? ' id="architecture-image" draggable="false"' : ''}>`;
}
function projectMarkup(project, index) {
  const t = copy[language];
  return `<article class="project-card" data-project="${project.id}" data-category="${project.category}"${activeFilter !== 'all' && project.category !== activeFilter ? ' hidden' : ''}>
    <div class="project-card-head"><span class="project-number">${String(index+1).padStart(2,'0')} / OPEN SOURCE</span><span class="project-category">${categoryLabel(project.category)}</span></div>
    <div class="project-card-main"><h3>${project.name}</h3><p class="project-tagline">${escapeHtml(project.tagline[language])}</p></div>
    <button class="architecture-button" data-open-project="${project.id}" aria-label="${t.preview} · ${project.name}">${architectureMarkup(project)}<span class="architecture-overlay">${t.preview} <span aria-hidden="true">↗</span></span></button>
    <div class="project-card-footer"><button class="details-button" data-open-project="${project.id}">${t.details} <span aria-hidden="true">+</span></button><a class="github-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="${project.name} on GitHub (${language === 'zh' ? '新窗口' : 'opens in a new tab'})">${githubIcon} GitHub <span aria-hidden="true">↗</span></a></div>
  </article>`;
}
function renderProjects() {
  const t = copy[language];
  $('#project-grid').innerHTML = projects.map(projectMarkup).join('');
  updateFilterCount();
}
function updateFilterCount() {
  const visible = projects.filter(project => activeFilter === 'all' || project.category === activeFilter).length;
  $('#filter-count').textContent = `${copy[language].showing} ${String(visible).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
}
function setFilter(filter) {
  activeFilter = filter;
  $$('.filter-button').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  $$('.project-card').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
  updateFilterCount();
}
function setCapability(capability, focusTab = false) {
  activeCapability = capability;
  const item = capabilities[capability];
  const t = copy[language];
  $$('.explorer-tab').forEach(tab => {
    const active = tab.dataset.capability === capability;
    tab.classList.toggle('active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) tab.focus();
  });
  $('#capability-panel').setAttribute('aria-labelledby','tab-' + capability);
  $('#constellation').dataset.mode = capability;
  $('#constellation').setAttribute('aria-label',t.mapLabel.replace('{names}',item.names.join(language === 'zh' ? '、' : ' and ')));
  $('#capability-counter').textContent = `${t.direction} ${item.number} / ${String(Object.keys(capabilities).length).padStart(2,'0')}`;
  $('#capability-title').textContent = item.title[language];
  $('#capability-description').textContent = item.description[language];
  $('#capability-tags').innerHTML = item.names.map(name => `<span>${name}</span>`).join('');
}
function updateMotion() {
  const paused = motionPaused || reducedMotion.matches;
  document.documentElement.classList.toggle('motion-paused',paused);
  const button = $('#motion-toggle');
  button.setAttribute('aria-pressed',String(paused));
  button.disabled = reducedMotion.matches;
  button.title = reducedMotion.matches ? (language === 'zh' ? '已遵循系统的减少动态效果设置' : 'Following your system’s reduced-motion preference') : '';
  button.setAttribute('aria-label',copy[language][paused ? 'resumeMotion' : 'pauseMotion']);
  $('.motion-icon',button).textContent = paused ? '▷' : 'Ⅱ';
  $('[data-i18n="motion"]',button).textContent = copy[language][paused ? 'motionOff' : 'motion'];
  if (paused) {
    $('.hero-art').style.removeProperty('--parallax-x');
    $('.hero-art').style.removeProperty('--parallax-y');
  }
}
function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  const t = copy[language];
  $$('[data-i18n]').forEach(element => {
    const value = t[element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  });
  const langButton = $('#language-toggle');
  langButton.innerHTML = language === 'zh' ? '中 <span aria-hidden="true">/ EN</span>' : 'EN <span aria-hidden="true">/ 中</span>';
  langButton.setAttribute('aria-label',t.switchLang);
  $('.skip-link').textContent = t.skip;
  $('#menu-toggle').setAttribute('aria-label',t[$('#menu-toggle').getAttribute('aria-expanded') === 'true' ? 'closeNav' : 'openNav']);
  $('[data-close="project-dialog"]').setAttribute('aria-label',t.closeDetails);
  $('[data-close="poster-dialog"]').setAttribute('aria-label',t.closePoster);
  renderProjects();
  setCapability(activeCapability);
  updateMotion();
  if (activeProject) { renderProjectDialog(activeProject); requestAnimationFrame(() => fitArchitecture()); }
  safeStorage.set('infermatrix-language',language);
}
function setMenu(open) {
  $('#main-nav').classList.toggle('is-open',open);
  $('#menu-toggle').setAttribute('aria-expanded',String(open));
  $('#menu-toggle').setAttribute('aria-label',copy[language][open ? 'closeNav' : 'openNav']);
}
function openDialog(dialog, trigger) {
  lastDialogTrigger = trigger || document.activeElement;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
  document.body.classList.add('modal-open');
  $('[data-close]',dialog).focus();
}
function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close();
  else { dialog.removeAttribute('open'); finishClosing(dialog); }
}
function finishClosing(dialog) {
  document.body.classList.remove('modal-open');
  if (dialog.id === 'project-dialog') activeProject = null;
  if (lastDialogTrigger && document.contains(lastDialogTrigger)) lastDialogTrigger.focus();
  lastDialogTrigger = null;
}
function renderProjectDialog(project) {
  const t = copy[language];
  const asset = architectureAssets[project.id];
  if (!asset) return;
  const sourceCaption = t[asset.kind === 'official' ? 'architectureOfficial' : asset.kind === 'poster-vector' ? 'architecturePosterVector' : asset.kind === 'official-docs-vector' ? 'architectureDocsVector' : 'architectureVector'];
  $('#project-dialog-content').innerHTML = `<div class="dialog-header"><div class="eyebrow">OPEN SOURCE / ${categoryLabel(project.category)}</div><h2 id="project-dialog-title">${project.name}</h2><p>${escapeHtml(project.tagline[language])}</p></div>
    <div class="dialog-architecture">
      <div class="architecture-toolbar"><div class="architecture-zoom-controls" role="group" aria-label="${t.zoomControls}">
        <button type="button" data-zoom="out" aria-label="${t.zoomOut}" title="${t.zoomOut}" aria-controls="architecture-viewer">−</button>
        <output id="architecture-zoom-level" aria-live="polite" aria-atomic="true" aria-label="${t.zoomLevel}">100%</output>
        <button type="button" data-zoom="in" aria-label="${t.zoomIn}" title="${t.zoomIn}" aria-controls="architecture-viewer">+</button>
        <button type="button" class="architecture-fit" data-zoom="reset" aria-controls="architecture-viewer">${t.zoomReset}</button>
        <button type="button" class="architecture-actual" data-zoom="actual" aria-controls="architecture-viewer">${t.zoomActual}</button>
      </div><div class="architecture-file-links"><a href="${escapeHtml(asset.src)}" target="_blank" rel="noopener noreferrer">${asset.kind === 'official' ? t.openOriginal : t.openVector} <span aria-hidden="true">↗</span></a><a href="${escapeHtml(asset.src)}" download="${escapeHtml(asset.src.split('/').pop())}">${t.downloadArchitecture} <span aria-hidden="true">↓</span></a></div></div>
      <div class="architecture-viewer" id="architecture-viewer" role="region" aria-label="${project.name} · ${t.viewerLabel}" aria-describedby="architecture-zoom-hint" tabindex="0"><div class="architecture-stage">${architectureMarkup(project,true)}</div></div>
      <div class="architecture-caption"><p><span>${sourceCaption}</span> · <a href="${escapeHtml(asset.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t.architectureSource} ↗</a></p><p id="architecture-zoom-hint">${t.zoomHint}</p>${project.id === 'router' ? `<p>${language === 'zh' ? '按海报示意重绘；原图中无法辨认的少量微小注释未补写，功能状态请查阅项目仓库。' : 'Redrawn from the poster concept. A few illegible micro-annotations are omitted; see the repository for implementation status.'}</p>` : ''}</div>
    </div><div class="dialog-bottom"><p class="dialog-note">${escapeHtml(project.detail[language])}</p><a class="button button-primary" href="${project.url}" target="_blank" rel="noopener noreferrer">${t.viewRepo} <span aria-hidden="true">↗</span></a></div>`;
}
function fitArchitecture() {
  const viewer = $('#architecture-viewer');
  const asset = activeProject && architectureAssets[activeProject.id];
  if (!viewer || !asset) return;
  const width = Math.max(1, viewer.clientWidth - 48);
  const height = Math.max(1, viewer.clientHeight - 48);
  architectureFitWidth = Math.min(width, height * asset.width / asset.height, asset.width);
  architectureZoom = 1;
  updateArchitectureZoom(false);
  viewer.scrollLeft = 0;
  viewer.scrollTop = 0;
}
function updateArchitectureZoom(preserveCenter = true) {
  const viewer = $('#architecture-viewer');
  const image = $('#architecture-image');
  const asset = activeProject && architectureAssets[activeProject.id];
  if (!viewer || !image || !asset) return;
  const previousWidth = parseFloat(image.style.width) || architectureFitWidth;
  const nextWidth = Math.round(architectureFitWidth * architectureZoom);
  const centerX = viewer.scrollLeft + viewer.clientWidth / 2;
  const centerY = viewer.scrollTop + viewer.clientHeight / 2;
  // Resize layout dimensions, rather than transforming pixels outside the scroll area.
  image.style.width = `${nextWidth}px`;
  image.style.height = `${Math.round(nextWidth * asset.height / asset.width)}px`;
  const percentage = Math.round(architectureZoom * 100);
  $('#architecture-zoom-level').textContent = `${percentage}%`;
  $('[data-zoom="out"]').disabled = architectureZoom <= 0.5;
  $('[data-zoom="in"]').disabled = architectureZoom >= 8;
  if (preserveCenter && previousWidth > 0) {
    const ratio = nextWidth / previousWidth;
    viewer.scrollLeft = Math.max(0, centerX * ratio - viewer.clientWidth / 2);
    viewer.scrollTop = Math.max(0, centerY * ratio - viewer.clientHeight / 2);
  }
}
function changeArchitectureZoom(action) {
  if (!activeProject) return;
  if (action === 'reset') { fitArchitecture(); return; }
  if (action === 'actual') {
    architectureZoom = architectureAssets[activeProject.id].width / architectureFitWidth;
  } else {
    architectureZoom = Math.min(8, Math.max(0.5, architectureZoom * (action === 'in' ? 1.25 : 0.8)));
  }
  updateArchitectureZoom();
}
$('#project-dialog-content').addEventListener('click',event => {
  const button = event.target.closest('[data-zoom]');
  if (button) changeArchitectureZoom(button.dataset.zoom);
});
$('#project-dialog-content').addEventListener('keydown',event => {
  if (!event.target.closest('#architecture-viewer')) return;
  const action = event.key === '+' || event.key === '=' ? 'in' : event.key === '-' ? 'out' : event.key === '0' ? 'reset' : null;
  if (action) { event.preventDefault(); changeArchitectureZoom(action); }
});
// Refit only while already in fit mode so resizing does not discard a user's zoom.
if (typeof ResizeObserver === 'function') {
  new ResizeObserver(() => { if (activeProject && architectureZoom === 1) fitArchitecture(); }).observe($('#project-dialog'));
}
$('#project-grid').addEventListener('click',event => {
  const trigger = event.target.closest('[data-open-project]');
  if (!trigger) return;
  activeProject = projects.find(project => project.id === trigger.dataset.openProject);
  if (!activeProject) return;
  renderProjectDialog(activeProject);
  openDialog($('#project-dialog'),trigger);
  requestAnimationFrame(() => fitArchitecture());
});
$$('.filter-button').forEach(button => button.addEventListener('click',() => setFilter(button.dataset.filter)));
$$('.explorer-tab').forEach(tab => tab.addEventListener('click',() => setCapability(tab.dataset.capability)));
$('.explorer-tabs').addEventListener('keydown',event => {
  const tabs = $$('.explorer-tab');
  const index = tabs.findIndex(tab => tab.dataset.capability === activeCapability);
  let nextIndex;
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = tabs.length-1;
  if (nextIndex !== undefined) { event.preventDefault(); setCapability(tabs[nextIndex].dataset.capability,true); }
});
$('#capability-link').addEventListener('click',() => {
  setFilter(activeCapability);
  const button = $(`.filter-button[data-filter="${activeCapability}"]`);
  if (button) { button.focus({preventScroll:true}); button.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'}); }
});
$('#language-toggle').addEventListener('click',() => setLanguage(language === 'zh' ? 'en' : 'zh'));
$('#motion-toggle').addEventListener('click',() => {
  motionPaused = !(motionPaused || reducedMotion.matches);
  safeStorage.set('infermatrix-motion',motionPaused ? 'paused' : 'on');
  updateMotion();
});
if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change',updateMotion);
$('#menu-toggle').addEventListener('click',() => setMenu($('#menu-toggle').getAttribute('aria-expanded') !== 'true'));
$$('#main-nav a').forEach(link => link.addEventListener('click',() => setMenu(false)));
document.addEventListener('keydown',event => { if (event.key === 'Escape' && $('#menu-toggle').getAttribute('aria-expanded') === 'true') { setMenu(false); $('#menu-toggle').focus(); } });
document.addEventListener('click',event => { if (!event.target.closest('.site-header') && $('#menu-toggle').getAttribute('aria-expanded') === 'true') setMenu(false); });
$('#poster-open').addEventListener('click',event => openDialog($('#poster-dialog'),event.currentTarget));
$$('[data-close]').forEach(button => button.addEventListener('click',() => closeDialog($('#' + button.dataset.close))));
$$('dialog').forEach(dialog => {
  dialog.addEventListener('close',() => finishClosing(dialog));
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});
const hero = $('.hero');
let animationFrame = null;
hero.addEventListener('pointermove',event => {
  if (motionPaused || reducedMotion.matches || event.pointerType !== 'mouse') return;
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(() => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    $('.hero-art').style.setProperty('--parallax-x',`${x * 12}px`);
    $('.hero-art').style.setProperty('--parallax-y',`${y * 8}px`);
  });
});
hero.addEventListener('pointerleave',() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  $('.hero-art').style.setProperty('--parallax-x','0px');
  $('.hero-art').style.setProperty('--parallax-y','0px');
});
$('#year').textContent = String(new Date().getFullYear());
setLanguage(language);
