'use strict';
(() => {
  const copy = {
    zh: {nav:'演示展示',kicker:'从代码，到真实体验',title:'看见推理的可能。',intro:'按项目探索演示。点击预览播放视频，体验开源创新。',materials:'查看演示素材',note:'视频由项目素材库提供；展示内容与适用条件以原始说明为准。点击后才加载视频，不自动播放。',play:'播放',source:'查看原始视频 ↗',error:'视频暂时无法播放，请使用下方原始视频链接。',retry:'点击播放器重试，或使用下方原始视频链接。'},
    en: {nav:'Showcase',kicker:'FROM CODE TO EXPERIENCE',title:'See inference in action.',intro:'Explore demos by repository. Click a preview to watch open-source innovation in action.',materials:'Browse demo assets',note:'Videos are supplied by the project media repository. Refer to the original materials for context and limitations. Videos load only after you press play.',play:'Play',source:'View original video ↗',error:'This video could not be played. Try the original video link below.',retry:'Press play in the player to retry, or use the original video link below.'}
  };
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const section = document.querySelector('#showcase');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let videos = [];
  const previews = new WeakMap();
  function translate() {
    const lang = language(), t = copy[lang];
    document.querySelectorAll('[data-showcase-i18n]').forEach(el => {el.textContent = t[el.dataset.showcaseI18n];});
    section.querySelectorAll('.video-card').forEach(card => {
      const item = videos.find(item => item.id === card.dataset.video);
      card.querySelector('.video-description').textContent = item.description[lang];
      card.querySelector('.video-source').textContent = t.source;
      const button = card.querySelector('.video-preview');
      if (button) button.setAttribute('aria-label',`${t.play} ${item.title}`);
      const error = card.querySelector('.video-error');
      if (error) error.textContent = t[error.dataset.error];
    });
  }
  function play(card, item) {
    const stage = card.querySelector('.video-stage');
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'none';
    video.poster = item.poster; video.src = item.src;
    video.setAttribute('aria-label',item.title); video.tabIndex = 0;
    section.querySelectorAll('video').forEach(other => {
      other.pause(); other.removeAttribute('src'); other.load();
      const previousCard = other.closest('.video-card');
      other.parentElement.replaceChildren(previews.get(previousCard));
      previousCard.querySelector('.video-error')?.remove();
    });
    const showError = key => {
      let message = card.querySelector('.video-error');
      if (!message) {message = document.createElement('p');message.className='video-error';message.setAttribute('role','status');card.querySelector('.video-info').append(message);}
      message.dataset.error=key; message.textContent=copy[language()][key];
    };
    video.addEventListener('error',()=>showError('error'));
    video.addEventListener('play',()=>{section.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});card.querySelector('.video-error')?.remove();});
    stage.replaceChildren(video); video.focus({preventScroll:true});
    const pending=video.play(); if(pending)pending.catch(()=>{if(video.isConnected && video.getAttribute('src'))showError(video.error?'error':'retry');});
  }
  fetch('assets/showcase/videos.json?v=20261030-inferrsi').then(response=>{if(!response.ok)throw new Error('Video list unavailable');return response.json();}).then(items=>{
    videos=items;
    section.querySelectorAll('.showcase-grid').forEach(grid => {
      grid.innerHTML=videos.filter(item=>item.repo===grid.dataset.repo).map(item=>`<article class="video-card" data-video="${esc(item.id)}"><div class="video-stage"><button type="button" class="video-preview" aria-label="播放 ${esc(item.title)}"><img src="${esc(item.poster)}" alt="${esc(item.title)} 视频预览" width="960" height="540" loading="lazy" decoding="async"><span class="video-play-icon" aria-hidden="true">▶</span><span class="video-duration">${Math.floor(item.duration/60)}:${String(item.duration%60).padStart(2,'0')}</span></button></div><div class="video-info"><h4>${esc(item.title)}</h4><p class="video-description"></p><a class="video-source" href="${esc(item.source)}" target="_blank" rel="noopener noreferrer"></a></div></article>`).join('');
    });
    section.querySelectorAll('.video-card').forEach(card=>{const item=videos.find(item=>item.id===card.dataset.video);const preview=card.querySelector('.video-preview');previews.set(card,preview);preview.addEventListener('click',()=>play(card,item));});
    translate();
  }).catch(()=>{section.querySelectorAll('.showcase-grid').forEach(grid=>{grid.innerHTML='<p>视频列表暂时无法加载 / Videos unavailable. <a class="video-source" href="https://github.com/InferMatrixLab/infermatrix-marketing">GitHub ↗</a></p>';});});
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)section.querySelectorAll('video').forEach(video=>video.pause());});
  translate();
})();
