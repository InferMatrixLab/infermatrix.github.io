'use strict';
(() => {
  const projects = {
    omni: 'vLLM-Omni', afd: 'afd-plugin', router: 'vLLM Router',
    agent: 'agent-infer', rlt: 'vllm-rlt', mlx: 'vllm-omni-mlx', inferrsi: 'InferRSI'
  };
  const videoCopy = {
    zh: {
      nav: '视频资源', otherLibrary: '阅读项目文章 ↗', noun: '个视频', kicker: '学习与分享', title: '从了解项目，到动手实践。',
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
      action: '前往观看', newWindow: '在新窗口打开', speaker: '讲者', author: '作者', duration: '时长',
      previousPage: '上一页', nextPage: '下一页', paginationLabel: '视频资源分页', resultsLabel: '视频资源列表'
    },
    en: {
      nav: 'Videos', otherLibrary: 'Read project articles ↗', noun: 'videos', kicker: 'LEARN & SHARE', title: 'Get to know a project. Start building.',
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
      action: 'Watch video', newWindow: 'opens in a new window', speaker: 'Speaker', author: 'Author', duration: 'Duration',
      previousPage: 'Previous', nextPage: 'Next', paginationLabel: 'Video resource pagination', resultsLabel: 'Video resources'
    }
  };
  const articleCopy = {
    zh: {
      ...videoCopy.zh,
      nav: '文章专栏', otherLibrary: '观看学习视频 ↗', noun: '篇文章', kicker: '阅读与实践',
      title: '读懂技术，走近实现。',
      intro: '从官方博客、技术解读到实践指南，按项目探索 InferMatrix 的文章与文档。',
      searchLabel: '搜索文章', searchPlaceholder: '搜索标题、作者或关键词',
      technical: '技术解读', note: '文章链接将前往原发布平台；文档内容以项目当前版本为准。',
      loading: '正在加载文章…', loadingDescription: '正在读取技术文章与实践指南。',
      emptyTitle: '这个项目的文章，正在整理中。',
      emptyDescription: '这里将持续收录各项目的技术解读与实践指南。',
      noResults: '没有找到相关文章。',
      errorTitle: '文章暂时无法加载。', errorDescription: '请稍后重新加载，获取最新的文章列表。',
      action: '阅读原文', author: '作者', paginationLabel: '文章专栏分页', resultsLabel: '文章列表'
    },
    en: {
      ...videoCopy.en,
      nav: 'Articles', otherLibrary: 'Watch learning videos ↗', noun: 'articles', kicker: 'READ & BUILD',
      title: 'Understand the ideas. Explore the implementation.',
      intro: 'Explore official blogs, technical explainers and practical guides from across the InferMatrix projects.',
      searchLabel: 'Search articles', searchPlaceholder: 'Search titles, authors or keywords',
      technical: 'Technical article', note: 'Articles open on their original platforms. Check project documentation for the current version.',
      loading: 'Loading articles…', loadingDescription: 'Fetching technical articles and practical guides.',
      emptyTitle: 'Articles for this project are on their way.',
      emptyDescription: 'Technical explainers and practical project guides will be collected here.',
      noResults: 'No matching articles.',
      errorTitle: 'Articles could not be loaded.', errorDescription: 'Please try again shortly to load the latest articles.',
      action: 'Read article', author: 'Author', paginationLabel: 'Article pagination', resultsLabel: 'Articles'
    }
  };

  // Each library owns its controls, request state, filters and current page.
  function initLibrary({sectionId, prefix, copy, types, catalog}) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const control = name => section.querySelector(`#${prefix}-${name}`);
    const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
    const esc = value => String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
    const filters = control('project-filters');
    const search = control('search');
    const type = control('type');
    const count = control('count');
    const results = control('results');
    const empty = control('empty');
    const emptyTitle = control('empty-title');
    const emptyDescription = control('empty-description');
    const reset = control('reset');
    const retry = control('retry');
    const pagination = control('pagination');
    const previousPage = control('previous-page');
    const nextPage = control('next-page');
    const pageStatus = control('page-status');
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
          !types.includes(record.type) ||
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
      for (const field of ['speaker', 'duration', 'publisher', 'author']) {
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
      if (item.author) metadata.push(`<span>${esc(t.author)} · ${esc(item.author)}</span>`);
      if (item.speaker) metadata.push(`<span>${esc(t.speaker)} · ${esc(item.speaker)}</span>`);
      if (item.publishedAt) metadata.push(`<time datetime="${esc(item.publishedAt)}">${esc(item.publishedAt)}</time>`);
      if (item.duration) metadata.push(`<span>${esc(t.duration)} · ${esc(item.duration)}</span>`);
      return `<article class="resource-card" data-resource-id="${esc(item.id)}">
        <div class="resource-card-top"><span class="resource-project">${esc(projects[item.project])}</span><span class="resource-kind">${esc(t[item.type])}</span></div>
        <h3>${esc(item.title[lang])}</h3>
        <p class="resource-description">${esc(item.description[lang])}</p>
        <div class="resource-meta">${metadata.join('')}</div>
        <a class="resource-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${t.action} · ${item.title[lang]} (${t.newWindow})`)}">${esc(t.action)} <span aria-hidden="true">↗</span></a>
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
          item.speaker || '', item.author || '', item.publisher || '', item.platform, projects[item.project]].join(' ').normalize('NFKC').toLocaleLowerCase();
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
          ? `显示 ${range} / ${matching.length} ${t.noun}${hasFilters ? `（全部 ${items.length} ${t.noun}）` : ''}`
          : `Showing ${range} of ${matching.length} ${t.noun}${hasFilters ? ` (${items.length} total)` : ''}`;
        emptyTitle.textContent = hasFilters ? t.noResults : t.emptyTitle;
        const projectContext = selectedProject === 'all' ? '' : (lang === 'zh'
          ? `${projects[selectedProject]} 暂未收录符合条件的资源。`
          : `There are no matching resources for ${projects[selectedProject]}. `);
        emptyDescription.textContent = hasFilters ? projectContext + t.noResultsDescription : t.emptyDescription;
      }
    }

    function translate() {
      const t = copy[language()];
      document.querySelectorAll(`[data-${prefix}-i18n]`).forEach(element => {
        const value = t[element.getAttribute(`data-${prefix}-i18n`)];
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
        const response = await fetch(`${catalog}?v=${Date.now()}`, {cache: 'no-store'});
        if (!response.ok) throw new Error('Resources unavailable');
        const records = await response.json();
        if (!Array.isArray(records)) throw new Error('Invalid resource catalog');
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
  }

  initLibrary({sectionId: 'video-resources', prefix: 'resource', copy: videoCopy,
    types: ['tutorial', 'talk'], catalog: 'assets/video-resources.json'});
  initLibrary({sectionId: 'article-resources', prefix: 'article', copy: articleCopy,
    types: ['tutorial', 'technical'], catalog: 'assets/article-resources.json'});
})();
