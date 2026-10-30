'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Reuse the existing small DOM implementation without executing app.js or its tests.
// Explicit declaration boundaries fail clearly if that helper is reorganized.
const interactionSource = fs.readFileSync(path.join(__dirname, 'qa-interactions.cjs'), 'utf8').replace(/\r\n/g, '\n');
const helperStart = interactionSource.indexOf('let doc;\nclass Element');
const helperEnd = interactionSource.indexOf('\nfunction run(', helperStart);
assert(helperStart >= 0 && helperEnd > helperStart, 'Existing DOM helper declarations are available');
const domHelpers = interactionSource.slice(helperStart, helperEnd);
const markup = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const librarySource = fs.readFileSync(path.join(__dirname, 'resource-library.js'), 'utf8');
const projects = ['all', 'omni', 'afd', 'router', 'agent', 'rlt', 'mlx', 'inferrsi'];
const flush = () => new Promise(resolve => setImmediate(resolve));

function record(kind, index, overrides = {}) {
  return {
    id: `${kind}-${index}`,
    project: index < 8 ? 'omni' : 'afd',
    type: index % 2 ? 'tutorial' : (kind === 'video' ? 'talk' : 'technical'),
    title: {zh: `${kind === 'video' ? '视频' : '文章'} ${index}`, en: `${kind} title ${index}`},
    description: {zh: `学习资料 ${index}`, en: `Learning resource ${index}`},
    url: `https://example.com/${kind}/${index}`,
    platform: 'Example',
    publisher: 'Project team',
    ...(kind === 'video' ? {speaker: `Speaker ${index}`} : {author: `Author ${index}`}),
    ...overrides
  };
}

function harness({onlySection} = {}) {
  const helperContext = vm.createContext({});
  const helpers = vm.runInContext(`${domHelpers}\n({parseMarkup, setDocument(value) {doc = value;}})`, helperContext);
  const root = helpers.parseMarkup(markup).find(element => element.tagName === 'html');
  assert(root, 'Current HTML is parsed rather than an old DOM fixture');
  root.lang = 'zh-CN';
  if (onlySection) {
    const excluded = root.querySelector(onlySection === 'article-resources' ? '#video-resources' : '#article-resources');
    excluded.parentNode.children = excluded.parentNode.children.filter(child => child !== excluded);
  }
  for (const input of root.querySelectorAll('input')) input.value = '';
  for (const select of root.querySelectorAll('select')) select.value = 'all';
  const document = {
    documentElement: root,
    activeElement: null,
    querySelector: selector => root.querySelector(selector),
    querySelectorAll: selector => root.querySelectorAll(selector),
    getElementById: id => root.querySelector(`#${id}`)
  };
  helpers.setDocument(document);
  const requests = [], observers = [];
  const context = vm.createContext({
    document, URL,
    MutationObserver: class {
      constructor(callback) {observers.push(callback);}
      observe() {}
    },
    fetch(url, options) {
      return new Promise((resolve, reject) => requests.push({url, options, resolve, reject, handled: false}));
    }
  });
  vm.runInContext(librarySource, context, {filename: 'resource-library.js'});
  const q = selector => {
    const result = root.querySelector(selector);
    assert(result, `Element exists: ${selector}`);
    return result;
  };
  const control = (kind, name) => q(`#${kind === 'video' ? 'resource' : 'article'}-${name}`);
  const cards = kind => control(kind, 'results').querySelectorAll('.resource-card');
  const ids = kind => cards(kind).map(card => card.getAttribute('data-resource-id'));
  const click = (kind, name) => control(kind, name).dispatch('click');
  const project = (kind, name) => control(kind, 'project-filters').querySelector(`[data-resource-project="${name}"]`).dispatch('click');
  const search = (kind, query) => {control(kind, 'search').value = query; control(kind, 'search').dispatch('input');};
  const type = (kind, value) => {control(kind, 'type').value = value; control(kind, 'type').dispatch('change');};
  const language = lang => {root.lang = lang; observers.forEach(callback => callback());};
  async function respond(kind, records, {status = 200, reject = false, jsonError = false} = {}) {
    const request = requests.find(item => !item.handled && item.url.startsWith(`assets/${kind}-resources.json?`));
    assert(request, `Pending ${kind} request exists`);
    request.handled = true;
    if (reject) request.reject(new Error('Network unavailable'));
    else request.resolve({ok: status >= 200 && status < 300, json: async () => {
      if (jsonError) throw new SyntaxError('Invalid JSON');
      return records;
    }});
    await flush();
  }
  return {root, document, requests, q, control, cards, ids, click, project, search, type, language, respond};
}

async function testIndependentLibraries() {
  const h = harness();
  assert.equal(h.requests.length, 2, 'Both catalogs start independently');
  for (const kind of ['video', 'article']) {
    assert.equal(h.control(kind, 'results').getAttribute('aria-busy'), 'true');
    assert.equal(h.control(kind, 'pagination').hidden, true);
  }
  for (const request of h.requests) {
    assert.equal(request.options.cache, 'no-store');
    assert.match(request.url, /\?v=\d+$/);
  }
  await h.respond('video', Array.from({length: 11}, (_, index) => record('video', index)));
  assert.equal(h.cards('video').length, 6);
  assert.equal(h.control('article', 'results').getAttribute('aria-busy'), 'true', 'Other pending request remains loading');
  await h.respond('article', Array.from({length: 14}, (_, index) => record('article', index)));
  assert.equal(h.cards('article').length, 6);
  assert.match(h.control('video', 'count').textContent, /1–6 \/ 11/);
  assert.match(h.control('article', 'count').textContent, /1–6 \/ 14/);
  for (const kind of ['video', 'article']) {
    assert.equal(h.control(kind, 'previous-page').disabled, true);
    assert.equal(h.control(kind, 'next-page').disabled, false);
    assert.equal(h.control(kind, 'results').getAttribute('aria-busy'), 'false');
    const counters = h.control(kind, 'project-filters');
    assert.equal(counters.querySelector('[data-resource-count="omni"]').textContent, '8', 'Badges count the complete catalog');
  }
  h.click('video', 'next-page');
  assert.equal(h.cards('video').length, 5);
  assert.equal(h.control('video', 'next-page').disabled, true);
  assert.equal(h.cards('article').length, 6);
  assert.match(h.control('article', 'page-status').textContent, /第 1 \/ 3/);
  assert.equal(h.document.activeElement, h.control('video', 'results'));
  assert.equal(h.control('video', 'results').scrolled, true);

  const articleIds = [...h.ids('article')];
  h.click('article', 'next-page');
  articleIds.push(...h.ids('article'));
  assert.equal(h.cards('article').length, 6);
  h.click('article', 'next-page');
  articleIds.push(...h.ids('article'));
  assert.equal(h.cards('article').length, 2);
  assert.equal(new Set(articleIds).size, 14, 'Pagination visits every article exactly once');
  assert.equal(h.control('article', 'next-page').disabled, true);
  assert.match(h.control('video', 'page-status').textContent, /第 2 \/ 2/, 'Article pagination leaves video page intact');

  h.language('en');
  assert.equal(h.q('[data-resource-i18n="nav"]').textContent, 'Videos');
  assert.equal(h.q('[data-article-i18n="nav"]').textContent, 'Articles');
  assert.equal(h.control('video', 'search').placeholder, 'Search titles, speakers or keywords');
  assert.equal(h.control('article', 'search').placeholder, 'Search titles, authors or keywords');
  assert.match(h.control('video', 'page-status').textContent, /Page 2 of 2 · 6 per page/);
  assert.match(h.control('article', 'page-status').textContent, /Page 3 of 3 · 6 per page/);
  assert.equal(h.control('article', 'results').querySelector('.resource-link').textContent.trim(), 'Read article');
  assert.match(h.control('video', 'results').innerHTML, /Watch video/);

  h.project('video', 'afd');
  assert.equal(h.cards('video').length, 3);
  assert.equal(h.control('video', 'pagination').hidden, true);
  assert.match(h.control('video', 'page-status').textContent, /Page 1 of 1/);
  assert.match(h.control('article', 'page-status').textContent, /Page 3 of 3/);
  h.project('article', 'omni');
  h.click('article', 'next-page');
  assert.equal(h.cards('article').length, 2);
  h.type('article', 'technical');
  assert.equal(h.cards('article').length, 4);
  assert.match(h.control('article', 'page-status').textContent, /Page 1 of 1/);
  h.search('article', 'ＡＵＴＨＯＲ ２');
  assert.deepEqual([...h.ids('article')], ['article-2'], 'Search normalizes width and case and includes article authors');
  h.language('zh-CN');
  assert.deepEqual([...h.ids('article')], ['article-2'], 'Language changes preserve project/type/search');
  assert.equal(h.control('article', 'type').value, 'technical');
  assert.equal(h.control('article', 'search').value, 'ＡＵＴＨＯＲ ２');
  h.search('article', '不存在的文章');
  assert.equal(h.cards('article').length, 0);
  assert.equal(h.control('article', 'empty').hidden, false);
  assert.equal(h.control('article', 'pagination').hidden, true);
  assert.equal(h.control('article', 'reset').hidden, false);
  assert.match(h.control('article', 'empty-title').textContent, /没有找到相关文章/);
  h.click('article', 'reset');
  assert.equal(h.cards('article').length, 6);
  assert.equal(h.control('article', 'search').value, '');
  assert.equal(h.control('article', 'type').value, 'all');
  assert.equal(h.control('article', 'reset').hidden, true);
  assert.equal(h.document.activeElement, h.control('article', 'search'));
  assert.equal(h.cards('video').length, 3, 'Resetting articles leaves video filters intact');
  h.search('article', '文章 3');
  assert.deepEqual([...h.ids('article')], ['article-3'], 'Search covers the other title language');
  h.click('article', 'reset');
  h.project('article', 'inferrsi');
  assert.match(h.control('article', 'empty-description').textContent, /InferRSI/);
  assert.equal(h.control('article', 'project-filters').querySelector('[data-resource-count="all"]').textContent, '14');
  for (const name of projects) assert(h.control('article', 'project-filters').querySelector(`[data-resource-project="${name}"]`));
}

async function testIndependentRecovery() {
  const h = harness();
  await h.respond('video', Array.from({length: 7}, (_, index) => record('video', index)));
  h.click('video', 'next-page');
  await h.respond('article', null, {status: 503});
  assert.equal(h.cards('article').length, 0);
  assert.equal(h.control('article', 'retry').hidden, false);
  assert.match(h.control('article', 'empty-title').textContent, /暂时无法加载/);
  assert.equal(h.control('article', 'pagination').hidden, true);
  assert.equal(h.cards('video').length, 1);
  h.click('article', 'retry');
  assert.equal(h.control('article', 'retry').disabled, true);
  h.click('article', 'retry');
  assert.equal(h.requests.length, 3, 'Repeated retry during loading does not duplicate requests');
  await h.respond('article', [record('article', 0)]);
  assert.equal(h.cards('article').length, 1);
  assert.equal(h.control('article', 'retry').hidden, true);
  assert.equal(h.control('article', 'empty').hidden, true);
  assert.match(h.control('video', 'page-status').textContent, /第 2 \/ 2/);

  for (const failure of [{reject: true}, {jsonError: true}, {}]) {
    const invalid = harness();
    await invalid.respond('video', []);
    await invalid.respond('article', {unexpected: 'object'}, failure);
    assert.equal(invalid.control('article', 'retry').hidden, false, 'Network, malformed JSON, and non-array catalogs are retryable errors');
    assert.equal(invalid.control('video', 'retry').hidden, true);
    assert.match(invalid.control('video', 'empty-title').textContent, /第一批视频/);
    assert.equal(invalid.control('video', 'pagination').hidden, true);
  }
}

async function testValidationAndEscaping() {
  const h = harness();
  const dangerous = '<img src=x onerror="alert(1)"> & \'quoted\'';
  const safeArticle = record('article', 0, {
    id: dangerous,
    title: {zh: dangerous, en: dangerous},
    description: {zh: dangerous, en: dangerous},
    platform: dangerous,
    author: dangerous,
    publisher: dangerous,
    url: 'https://example.com/?q="<tag>&value=1',
    publishedAt: '2026-02-30'
  });
  const invalid = [
    null,
    record('article', 1, {id: '  '}),
    record('article', 2, {project: 'constructor'}),
    record('article', 3, {type: 'talk'}),
    record('article', 4, {title: {zh: '中文'}}),
    record('article', 5, {description: {zh: '', en: 42}}),
    record('article', 6, {platform: ' '}),
    ...['http://example.com', 'javascript:alert(1)', 'https://user:password@example.com', '/relative', 'not a URL']
      .map((url, index) => record('article', 7 + index, {url}))
  ];
  const leapDate = record('article', 20, {publishedAt: '2024-02-29'});
  await h.respond('article', [safeArticle, ...invalid, {...safeArticle}, leapDate]);
  await h.respond('video', [record('video', 0, {id: dangerous}), record('video', 1, {type: 'technical'})]);
  assert.equal(h.cards('article').length, 2, 'Malformed entries and duplicate IDs are omitted individually');
  assert.equal(h.cards('video').length, 1, 'Valid IDs can independently appear in both catalogs');
  const html = h.control('article', 'results').innerHTML;
  assert(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quoted&#39;'));
  assert.equal(h.control('article', 'results').querySelectorAll('img').length, 0, 'Untrusted markup is text');
  assert.equal(h.control('article', 'results').querySelectorAll('script').length, 0);
  const links = h.control('article', 'results').querySelectorAll('a');
  assert.equal(links.length, 2, 'Untrusted metadata cannot inject extra links');
  for (const link of links) {
    assert.equal(new URL(link.getAttribute('href').replace(/&amp;/g, '&')).protocol, 'https:');
    assert.equal(link.getAttribute('target'), '_blank');
    assert.equal(link.getAttribute('rel'), 'noopener noreferrer');
  }
  assert(!html.includes('datetime="2026-02-30"'), 'Impossible optional dates are omitted');
  assert(html.includes('datetime="2024-02-29"'));
  assert.equal(h.control('article', 'project-filters').querySelector('[data-resource-count="all"]').textContent, '2');
}

async function testMarkupAndSingleLibrary() {
  const h = harness();
  const ids = h.root.querySelectorAll('[id]').map(element => element.id);
  assert.equal(ids.length, new Set(ids).size, 'HTML IDs remain unique across both columns');
  for (const kind of ['video', 'article']) {
    const resultId = h.control(kind, 'results').id;
    for (const element of ['search', 'type', 'previous-page', 'next-page']) {
      assert.equal(h.control(kind, element).getAttribute('aria-controls'), resultId);
    }
    const label = h.q(`label[for="${h.control(kind, 'search').id}"]`);
    assert(label.textContent);
  }
  for (const onlySection of ['video-resources', 'article-resources']) {
    const single = harness({onlySection});
    const kind = onlySection.startsWith('article') ? 'article' : 'video';
    assert.equal(single.requests.length, 1, 'A missing sibling section is optional');
    await single.respond(kind, [record(kind, 0)]);
    assert.equal(single.cards(kind).length, 1);
  }
}

(async () => {
  await testIndependentLibraries();
  await testIndependentRecovery();
  await testValidationAndEscaping();
  await testMarkupAndSingleLibrary();
  console.log('PASS: independent video/article catalogs, six-item pagination, bilingual state, combined filters and author search, reset/focus, loading/error/retry isolation, invalid records, HTTPS/XSS escaping, and unique accessible controls.');
  console.log('Verification uses the existing VM DOM helper and current HTML; rendered layout remains a browser check.');
})().catch(error => {console.error(error); process.exitCode = 1;});
