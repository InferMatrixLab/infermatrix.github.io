'use strict';
(() => {
  const section = document.querySelector('#video-resources');
  if (!section) return;

  const projects = {
    omni: 'vLLM-Omni', afd: 'afd-plugin', router: 'vLLM Router',
    agent: 'agent-infer', rlt: 'vllm-rlt', mlx: 'vllm-omni-mlx', inferrsi: 'InferRSI'
  };
  const copy = {
    zh: {
      nav: '视频资源', kicker: '学习与分享', title: '从了解项目，到动手实践。',
      intro: '汇集 InferMatrix 各项目的学习教程、技术分享与宣讲回放。找到感兴趣的项目，前往原平台观看。',
      searchLabel: '搜索视频', searchPlaceholder: '搜索标题、讲者或关键词', typeLabel: '内容类型',
      allTypes: '全部类型', tutorial: '学习教程', talk: '技术分享 / 宣讲', allProjects: '全部项目',
      projectLabel: '按项目筛选', reset: '重置筛选', retry: '重新加载',
      note: '视频链接将前往原发布平台；内容持续整理更新。',
      loading: '正在加载视频资源…', loadingDescription: '正在读取学习教程与技术分享列表。',
      emptyTitle: '第一批视频，正在整理中。',
      emptyDescription: '这里将持续收录各项目的学习教程、技术分享与宣讲回放。欢迎稍后回来看看。',
      noResults: '没有找到相关视频。',
      noResultsDescription: '试试其他项目或内容类型，或调整搜索关键词。',
      errorTitle: '视频资源暂时无法加载。',
      errorDescription: '请稍后重新加载，获取最新的视频列表。',
      watch: '前往观看', newWindow: '在新窗口打开', speaker: '讲者', duration: '时长',
      previousPage: '上一页', nextPage: '下一页', paginationLabel: '视频资源分页', resultsLabel: '视频资源列表'
    },
    en: {
      nav: 'Videos', kicker: 'LEARN & SHARE', title: 'Get to know a project. Start building.',
      intro: 'Explore tutorials, technical talks and presentation recordings from the InferMatrix ecosystem. Find your project and watch on the original platform.',
      searchLabel: 'Search videos', searchPlaceholder: 'Search titles, speakers or keywords', typeLabel: 'Content type',
      allTypes: 'All types', tutorial: 'Tutorial', talk: 'Talk / Presentation', allProjects: 'All projects',
      projectLabel: 'Filter by project', reset: 'Reset filters', retry: 'Try again',
      note: 'Video links open on their original platforms. More resources will be added over time.',
      loading: 'Loading video resources…', loadingDescription: 'Fetching tutorials and technical talks.',
      emptyTitle: 'The first videos are on their way.',
      emptyDescription: 'Project tutorials, technical talks and presentation recordings will be collected here. Check back soon.',
      noResults: 'No matching videos.',
      noResultsDescription: 'Try another project or content type, or change your search keywords.',
      errorTitle: 'Video resources could not be loaded.',
      errorDescription: 'Please try again shortly to load the latest video list.',
      watch: 'Watch video', newWindow: 'opens in a new window', speaker: 'Speaker', duration: 'Duration',
      previousPage: 'Previous', nextPage: 'Next', paginationLabel: 'Video resource pagination', resultsLabel: 'Video resources'
    }
  };
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const esc = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const filters = section.querySelector('#resource-project-filters');
  const search = section.querySelector('#resource-search');
  const type = section.querySelector('#resource-type');
  const count = section.querySelector('#resource-count');
  const results = section.querySelector('#resource-results');
  const empty = section.querySelector('#resource-empty');
  const emptyTitle = section.querySelector('#resource-empty-title');
  const emptyDescription = section.querySelector('#resource-empty-description');
  const reset = section.querySelector('#resource-reset');
  const retry = section.querySelector('#resource-retry');
  const pagination = section.querySelector('#resource-pagination');
  const previousPage = section.querySelector('#resource-previous-page');
  const nextPage = section.querySelector('#resource-next-page');
  const pageStatus = section.querySelector('#resource-page-status');
  const pageSize = 6;
  let items = [];
  let selectedProject = 'all';
  let currentPage = 1;
  let loading = false;
  let failed = false;

  function bilingual(value, allowEmpty = false) {
    return value && typeof value === 'object' && ['zh', 'en'].every(lang =>
      typeof value[lang] === 'string' && (allowEmpty || value[lang].trim().length > 0));
  }

  // Invalid records are omitted individually so one broken entry cannot hide the catalog.
  function validate(record) {
    if (!record || typeof record !== 'object' ||
        typeof record.id !== 'string' || !record.id.trim() ||
        typeof record.project !== 'string' || !Object.hasOwn(projects, record.project) ||
        !['tutorial', 'talk'].includes(record.type) ||
        !bilingual(record.title) || !bilingual(record.description, true) ||
        typeof record.platform !== 'string' || !record.platform.trim() ||
        typeof record.url !== 'string') return null;
    let url;
    try {
      url = new URL(record.url);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
    } catch { return null; }
    const item = {
      id: record.id.trim(), project: record.project, type: record.type,
      title: {zh: record.title.zh.trim(), en: record.title.en.trim()},
      description: {zh: record.description.zh.trim(), en: record.description.en.trim()},
      platform: record.platform.trim(), url: url.href
    };
    for (const field of ['speaker', 'duration', 'publisher']) {
      if (typeof record[field] === 'string' && record[field].trim()) item[field] = record[field].trim();
    }
    if (typeof record.publishedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.publishedAt)) {
      const date = new Date(`${record.publishedAt}T00:00:00Z`);
      if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === record.publishedAt) {
        item.publishedAt = record.publishedAt;
      }
    }
    return item;
  }

  function renderCard(item, lang, t) {
    const metadata = [`<span>${esc(item.platform)}</span>`];
    if (item.publisher) metadata.push(`<span>${esc(item.publisher)}</span>`);
    if (item.speaker) metadata.push(`<span>${esc(t.speaker)} · ${esc(item.speaker)}</span>`);
    if (item.publishedAt) metadata.push(`<time datetime="${esc(item.publishedAt)}">${esc(item.publishedAt)}</time>`);
    if (item.duration) metadata.push(`<span>${esc(t.duration)} · ${esc(item.duration)}</span>`);
    return `<article class="resource-card" data-resource-id="${esc(item.id)}">
      <div class="resource-card-top"><span class="resource-project">${esc(projects[item.project])}</span><span class="resource-kind">${esc(t[item.type])}</span></div>
      <h3>${esc(item.title[lang])}</h3>
      <p class="resource-description">${esc(item.description[lang])}</p>
      <div class="resource-meta">${metadata.join('')}</div>
      <a class="resource-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${t.watch} · ${item.title[lang]} (${t.newWindow})`)}">${esc(t.watch)} <span aria-hidden="true">↗</span></a>
    </article>`;
  }

  function render() {
    const lang = language(), t = copy[lang];
    const query = search.value.trim().normalize('NFKC').toLocaleLowerCase();
    const hasFilters = selectedProject !== 'all' || type.value !== 'all' || query.length > 0;
    const matching = items.filter(item => {
      if (selectedProject !== 'all' && item.project !== selectedProject) return false;
      if (type.value !== 'all' && item.type !== type.value) return false;
      const haystack = [item.title.zh, item.title.en, item.description.zh, item.description.en,
        item.speaker || '', item.publisher || '', item.platform, projects[item.project]].join(' ').normalize('NFKC').toLocaleLowerCase();
      return !query || haystack.includes(query);
    });
    const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
    currentPage = Math.max(1, Math.min(currentPage, pageCount));
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, matching.length);
    section.querySelectorAll('[data-resource-count]').forEach(element => {
      const project = element.dataset.resourceCount;
      element.textContent = String(project === 'all' ? items.length : items.filter(item => item.project === project).length);
    });
    filters.querySelectorAll('[data-resource-project]').forEach(button => {
      const active = button.dataset.resourceProject === selectedProject;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    reset.hidden = !hasFilters;
    retry.hidden = !failed;
    retry.disabled = loading;
    results.setAttribute('aria-busy', String(loading));
    results.innerHTML = loading || failed ? '' : matching.slice(start, end).map(item => renderCard(item, lang, t)).join('');
    pagination.hidden = loading || failed || pageCount <= 1;
    previousPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === pageCount;
    pageStatus.textContent = lang === 'zh'
      ? `第 ${currentPage} / ${pageCount} 页 · 每页 ${pageSize} 条`
      : `Page ${currentPage} of ${pageCount} · ${pageSize} per page`;
    empty.hidden = !loading && !failed && matching.length > 0;
    if (loading) {
      count.textContent = t.loading;
      emptyTitle.textContent = t.loading;
      emptyDescription.textContent = t.loadingDescription;
    } else if (failed) {
      count.textContent = t.errorTitle;
      emptyTitle.textContent = t.errorTitle;
      emptyDescription.textContent = t.errorDescription;
    } else {
      const range = matching.length ? `${start + 1}–${end}` : '0';
      count.textContent = lang === 'zh'
        ? `显示 ${range} / ${matching.length} 个视频${hasFilters ? `（全部 ${items.length} 个）` : ''}`
        : `Showing ${range} of ${matching.length} videos${hasFilters ? ` (${items.length} total)` : ''}`;
      emptyTitle.textContent = hasFilters ? t.noResults : t.emptyTitle;
      const projectContext = selectedProject === 'all' ? '' : (lang === 'zh'
        ? `${projects[selectedProject]} 暂未收录符合条件的视频。`
        : `There are no matching videos for ${projects[selectedProject]}. `);
      emptyDescription.textContent = hasFilters ? projectContext + t.noResultsDescription : t.emptyDescription;
    }
  }

  function translate() {
    const t = copy[language()];
    document.querySelectorAll('[data-resource-i18n]').forEach(element => {
      const value = t[element.dataset.resourceI18n];
      if (value !== undefined) element.textContent = value;
    });
    filters.setAttribute('aria-label', t.projectLabel);
    pagination.setAttribute('aria-label', t.paginationLabel);
    results.setAttribute('aria-label', t.resultsLabel);
    search.placeholder = t.searchPlaceholder;
    render();
  }

  async function load() {
    if (loading) return;
    loading = true;
    failed = false;
    render();
    try {
      // The catalog changes independently of the page and must not reuse an old response.
      const response = await fetch(`assets/video-resources.json?v=${Date.now()}`, {cache: 'no-store'});
      if (!response.ok) throw new Error('Video resources unavailable');
      const records = await response.json();
      if (!Array.isArray(records)) throw new Error('Invalid video resource catalog');
      const seen = new Set();
      items = records.map(validate).filter(item => {
        if (!item || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    } catch {
      items = [];
      failed = true;
    } finally {
      loading = false;
      render();
    }
  }

  filters.querySelectorAll('[data-resource-project]').forEach(button => {
    button.addEventListener('click', () => {
      const project = button.dataset.resourceProject;
      if (project !== 'all' && !Object.hasOwn(projects, project)) return;
      selectedProject = project;
      currentPage = 1;
      render();
    });
  });
  const resetPage = () => {currentPage = 1; render();};
  search.addEventListener('input', resetPage);
  type.addEventListener('change', resetPage);
  reset.addEventListener('click', () => {
    selectedProject = 'all';
    search.value = '';
    type.value = 'all';
    currentPage = 1;
    render();
    search.focus({preventScroll: true});
  });
  function changePage(step) {
    currentPage += step;
    render();
    results.focus({preventScroll: true});
    results.scrollIntoView({block: 'start', behavior: 'instant'});
  }
  previousPage.addEventListener('click', () => changePage(-1));
  nextPage.addEventListener('click', () => changePage(1));
  retry.addEventListener('click', load);
  new MutationObserver(translate).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  translate();
  load();
})();
