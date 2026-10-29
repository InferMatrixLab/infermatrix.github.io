'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const fixture=JSON.parse(fs.readFileSync(__dirname+'/dom-fixture.json'));
let doc;
class Element {
 constructor(tag,attrs={},text=''){this.tagName=tag;this.attrs={...attrs};this._text=text;this.children=[];this.parentNode=null;this.listeners={};this.scrollLeft=0;this.scrollTop=0;this.styles={};this.style={setProperty:(k,v)=>this.styles[k]=v,removeProperty:k=>delete this.styles[k]};this.classList={contains:c=>this.classes.includes(c),add:c=>this.setClass([...new Set([...this.classes,c])]),remove:c=>this.setClass(this.classes.filter(x=>x!==c)),toggle:(c,v)=>{let on=v===undefined?!this.classes.includes(c):v;on?this.classList.add(c):this.classList.remove(c);return on;}};}
 get id(){return this.attrs.id||''} get classes(){return(this.attrs.class||'').split(/\s+/).filter(Boolean)} setClass(c){this.attrs.class=c.join(' ')}
 get dataset(){const self=this;return new Proxy({}, {get(_,k){return self.attrs['data-'+String(k).replace(/[A-Z]/g,m=>'-'+m.toLowerCase())]},set(_,k,v){self.attrs['data-'+String(k).replace(/[A-Z]/g,m=>'-'+m.toLowerCase())]=String(v);return true}})}
 get textContent(){return this._text} set textContent(v){this._text=String(v)}
 get innerHTML(){return this._html||''} set innerHTML(v){this._html=String(v);this.children=parseMarkup(this._html);this.children.forEach(c=>c.parentNode=this)}
 get clientWidth(){return this.id==='architecture-viewer'?1000:800} get clientHeight(){return this.id==='architecture-viewer'?500:600}
 get hidden(){return 'hidden' in this.attrs} set hidden(v){v?this.attrs.hidden='':delete this.attrs.hidden}
 setAttribute(k,v){this.attrs[k]=String(v)} getAttribute(k){return this.attrs[k]??null} removeAttribute(k){delete this.attrs[k]}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f)} dispatch(n,e={}){e.target??=this;e.currentTarget=this;for(const f of this.listeners[n]||[])f(e)}
 focus(){doc.activeElement=this} scrollIntoView(){this.scrolled=true} contains(e){return e===this||this.children.some(c=>c.contains(e))}
 matches(sel){const attr=[...sel.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)];for(const [,k,v]of attr){if(!(k in this.attrs)||(v!==undefined&&this.attrs[k]!==v))return false}sel=sel.replace(/\[[^\]]+\]/g,'');const id=sel.match(/#([\w-]+)/);if(id&&this.id!==id[1])return false;for(const [,c]of sel.matchAll(/\.([\w-]+)/g))if(!this.classes.includes(c))return false;const tag=sel.match(/^[\w-]+/);return !tag||this.tagName===tag[0]}
 querySelectorAll(sel){const seg=sel.split(/\s+/);if(seg.length>1){let arr=[this];for(const s of seg)arr=arr.flatMap(e=>e.querySelectorAll(s));return arr}let found=[];for(const c of this.children){if(c.matches(sel))found.push(c);found.push(...c.querySelectorAll(sel))}return found}
 querySelector(sel){return this.querySelectorAll(sel)[0]||null}closest(sel){let e=this;while(e){if(e.matches(sel))return e;e=e.parentNode}return null}
 showModal(){this.attrs.open=''} close(){delete this.attrs.open;this.dispatch('close')} getBoundingClientRect(){return {left:0,right:800,top:0,bottom:600,width:800,height:600}}
}
function parseMarkup(html){
 const root=new Element('fragment'),stack=[root];
 const voids=new Set(['img','br','hr','input','meta','link','source','wbr']);
 for(const token of html.match(/<[^>]+>|[^<]+/g)||[]){
  if(token.startsWith('</')){if(stack.length>1)stack.pop();continue}
  if(token.startsWith('<!'))continue;
  if(token.startsWith('<')){
   const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;
   const attrs={};const tail=token.slice(tag.length+1,-1);
   for(const m of tail.matchAll(/([\w:-]+)(?:="([^"]*)"|='([^']*)')?/g))attrs[m[1]]=m[2]??m[3]??'';
   const e=new Element(tag,attrs);e.parentNode=stack.at(-1);e.parentNode.children.push(e);
   if(!voids.has(tag)&&!token.endsWith('/>'))stack.push(e);
  }else{stack.at(-1)._text+=token;}
 }
 return root.children;
}
function build(f){const e=new Element(f.tag,f.attrs,f.text);e.children=f.children.map(build);e.children.forEach(c=>c.parentNode=e);return e}
function run({storageFail=false,reduced=false}={}){
 const root=build(fixture);doc={documentElement:root,body:root.querySelector('body'),activeElement:null,querySelector:s=>root.matches(s)?root:root.querySelector(s),querySelectorAll:s=>root.querySelectorAll(s),contains:e=>root.contains(e),listeners:{},addEventListener(n,f){(this.listeners[n]??=[]).push(f)}};
 const storage={};const media={matches:reduced,addEventListener(){}};
 const ctx={document:doc,window:{matchMedia:()=>media},localStorage:{getItem:k=>{if(storageFail)throw Error('blocked');return storage[k]??null},setItem:(k,v)=>{if(storageFail)throw Error('blocked');storage[k]=v}},requestAnimationFrame:f=>{f();return 1},cancelAnimationFrame(){},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),ctx);return {ctx,doc,root,storage};
}
const {ctx}=run();const q=s=>doc.querySelector(s),qa=s=>doc.querySelectorAll(s),exec=s=>vm.runInContext(s,ctx);
assert.equal(doc.documentElement.lang,'zh-CN');assert.equal(qa('.project-card').length,7);assert.equal(qa('.project-card').filter(e=>!e.hidden).length,7);
for(const [filter,count]of Object.entries({multimodal:2,infrastructure:2,agentic:1,recurrent:1,all:7})){q(`.filter-button[data-filter="${filter}"]`).dispatch('click');assert.equal(qa('.project-card').filter(e=>!e.hidden).length,count);assert.equal(q(`.filter-button[data-filter="${filter}"]`).getAttribute('aria-pressed'),'true');}
q('#language-toggle').dispatch('click');assert.equal(doc.documentElement.lang,'en');assert.ok(q('#project-grid').innerHTML.includes('A standalone inference and serving engine for recurrent looped transformers.'));q('#language-toggle').dispatch('click');assert.equal(doc.documentElement.lang,'zh-CN');
for(const capability of ['agentic','infrastructure','recurrent','optimization','multimodal']){q(`.explorer-tab[data-capability="${capability}"]`).dispatch('click');assert.equal(q('#constellation').dataset.mode,capability);assert.equal(q('#capability-panel').getAttribute('aria-labelledby'),'tab-'+capability);assert.equal(qa('.explorer-tab').filter(e=>e.tabIndex===0).length,1);}
q('.explorer-tabs').dispatch('keydown',{key:'ArrowRight',preventDefault(){}});assert.equal(q('#constellation').dataset.mode,'agentic');q('#capability-link').dispatch('click');assert.equal(qa('.project-card').filter(e=>!e.hidden).length,1);
q('.explorer-tabs').dispatch('keydown',{key:'End',preventDefault(){}});assert.equal(q('#constellation').dataset.mode,'optimization');q('.explorer-tabs').dispatch('keydown',{key:'Home',preventDefault(){}});assert.equal(q('#constellation').dataset.mode,'multimodal');
q('#menu-toggle').dispatch('click');assert.equal(q('#menu-toggle').getAttribute('aria-expanded'),'true');q('#main-nav a').dispatch('click');assert.equal(q('#menu-toggle').getAttribute('aria-expanded'),'false');
const trigger=qa('[data-open-project]').find(e=>e.dataset.openProject==='rlt');q('#project-grid').dispatch('click',{target:trigger});assert.equal(q('#project-dialog').getAttribute('open'),'');assert.ok(q('#project-dialog-content').innerHTML.includes('recurrent looped transformers'));q('[data-close="project-dialog"]').dispatch('click');assert.equal(q('#project-dialog').getAttribute('open'),null);assert.equal(doc.activeElement,trigger);
q('#poster-open').dispatch('click');assert.equal(q('#poster-dialog').getAttribute('open'),'');q('[data-close="poster-dialog"]').dispatch('click');assert.equal(q('#poster-dialog').getAttribute('open'),null);
q('#motion-toggle').dispatch('click');assert.equal(q('#motion-toggle').getAttribute('aria-pressed'),'true');assert.ok(doc.documentElement.classList.contains('motion-paused'));q('#motion-toggle').dispatch('click');assert.equal(q('#motion-toggle').getAttribute('aria-pressed'),'false');
run({storageFail:true});assert.equal(q('#project-grid').children.length,7);run({reduced:true});assert.equal(q('#motion-toggle').getAttribute('aria-pressed'),'true');assert.equal(q('#motion-toggle').disabled,true);assert.ok(doc.documentElement.classList.contains('motion-paused'));
console.log('PASS: initial Chinese rendering; all five category filters; EN/ZH toggle; all five capability modes; keyboard Left/Right/Home/End state; related-project filtering; mobile menu; project dialog open/close and focus return; poster dialog; pause/resume; blocked localStorage; reduced-motion preference.');
console.log('Verification is a VM DOM simulation, not a rendered browser test.');

// Full-resolution diagrams and image-viewer interactions.
const fresh=run();const act=code=>vm.runInContext(code,fresh.ctx);
const assetMap=JSON.parse(act('JSON.stringify(architectureAssets)'));
assert.equal(Object.keys(assetMap).length,7,'Every project has a dedicated architecture asset');
for(const project of ['omni','afd','router','agent','rlt','mlx','inferrsi']){
 const opener=qa('[data-open-project]').find(e=>e.dataset.openProject===project);
 q('#project-grid').dispatch('click',{target:opener});
 const viewer=q('#architecture-viewer'),img=q('#architecture-image');
 assert.ok(viewer&&img,project+' has a scrollable image viewer');
 assert.equal(img.getAttribute('src'),assetMap[project].src);
 assert.ok(!img.getAttribute('src').includes('infermatrix-poster.png'));
 assert.ok(fs.existsSync(__dirname+'/'+assetMap[project].src));
 const initial=parseFloat(img.style.width);assert.ok(initial>0&&initial<=952);
 q('#project-dialog-content').dispatch('click',{target:q('[data-zoom="in"]')});
 assert.ok(parseFloat(img.style.width)>initial,'Zoom increases the real image width');
 assert.equal(q('#architecture-zoom-level').textContent,'125%');
 q('#project-dialog-content').dispatch('click',{target:q('[data-zoom="out"]')});
 assert.equal(parseFloat(img.style.width),initial);
 q('#project-dialog-content').dispatch('keydown',{target:viewer,key:'+',preventDefault(){}});
 assert.equal(q('#architecture-zoom-level').textContent,'125%');
 q('#project-dialog-content').dispatch('click',{target:q('[data-zoom="actual"]')});
 assert.equal(parseFloat(img.style.width),assetMap[project].width);
 q('#project-dialog-content').dispatch('keydown',{target:viewer,key:'0',preventDefault(){}});
 assert.equal(parseFloat(img.style.width),initial);
 assert.equal(viewer.scrollLeft,0);assert.equal(viewer.scrollTop,0);
 for(let i=0;i<20;i++)act("changeArchitectureZoom('in')");
 assert.equal(q('#architecture-zoom-level').textContent,'800%');assert.equal(q('[data-zoom="in"]').disabled,true);
 for(let i=0;i<30;i++)act("changeArchitectureZoom('out')");
 assert.equal(q('#architecture-zoom-level').textContent,'50%');assert.equal(q('[data-zoom="out"]').disabled,true);
 assert.equal(q('.architecture-file-links a').getAttribute('href'),assetMap[project].src);
 assert.ok(q('.architecture-file-links [download]'));
 assert.equal(q('.architecture-caption a').getAttribute('href'),assetMap[project].sourceUrl);
 assert.equal(viewer.getAttribute('tabindex'),'0');
 q('[data-close="project-dialog"]').dispatch('click');assert.equal(doc.activeElement,opener);
}
q('#language-toggle').dispatch('click');const opener=qa('[data-open-project]')[0];q('#project-grid').dispatch('click',{target:opener});
assert.equal(q('[data-zoom="in"]').getAttribute('aria-label'),'Zoom in');
assert.ok(q('#project-dialog-content').innerHTML.includes('Open original'));
console.log('PASS: six standalone asset files; viewer actual-layout zoom, keyboard shortcuts, original size, fit reset, limits, source/download links, bilingual labels, and close focus return.');

const finalRun=run();vm.runInContext("setCapability('optimization')",finalRun.ctx);assert.equal(q('#capability-counter').textContent,'探索方向 05 / 05');q('#capability-link').dispatch('click');assert.equal(qa('.project-card').filter(e=>!e.hidden).length,1);assert.ok(q('#capability-description').textContent.includes('失败方向'));vm.runInContext("setLanguage('en')",finalRun.ctx);assert.equal(q('#tab-optimization [data-i18n]').innerHTML,'Autonomous inference optimization');console.log('PASS: fifth RSI direction, related InferRSI filter, bilingual text, counter 05/05.');

// Dedicated-engine content must survive both language directions without losing evidence qualifiers.
{
 const html=fs.readFileSync(__dirname+'/index.html','utf8');
 const card=html.match(/<article class="rsi-example" id="h3-metal">([\s\S]*?)<\/article>/)?.[1];
 assert(card, 'h3-metal example exists in no-JavaScript HTML');
 assert.equal((html.match(/<article class="rsi-example"/g)||[]).length,4);
 const nodes=[...card.matchAll(/<[^>]+data-rsi-i18n="([^"]+)"[^>]*>([^<]*)<\//g)].map(([,key,text])=>({dataset:{rsiI18n:key},textContent:text}));
 let observer;
 const document={documentElement:{lang:'zh-CN'},querySelectorAll:()=>nodes};
 const context={document,MutationObserver:class{constructor(fn){observer=fn}observe(){}}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/inferrsi.js','utf8'),context);
 const text=()=>nodes.map(n=>n.textContent).join(' ');
 assert(text().includes('未独立重跑'));
 document.documentElement.lang='en';observer();
 assert(text().includes('Author-reported'));
 assert(text().includes('Different checkpoint / steps'));
 assert(text().includes('Not independently rerun'));
 assert(text().includes('remains on the roadmap'));
 document.documentElement.lang='zh-CN';observer();
 assert(text().includes('未独立重跑'));
 const evidence=JSON.parse(fs.readFileSync(__dirname+'/BENCHMARK_EVIDENCE.json','utf8')).h3_metal;
 for(const row of evidence.rows.slice(2)){
  assert.equal(Number((73.3/row.warm_s).toFixed(2)),row.warm_speedup_vs_h3c);
  assert.equal(Number((134.6/row.warm_s).toFixed(2)),row.warm_speedup_vs_mlx);
 }
 assert(card.includes(evidence.source));
 console.log('PASS: h3-metal static content, EN/ZH round trip, evidence qualifiers, pinned source and ratios.');
}
