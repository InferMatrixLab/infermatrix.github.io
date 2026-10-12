'use strict';
// Keep the no-JavaScript cards exactly in sync with the dynamic renderer.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=__dirname;
const script=fs.readFileSync(path.join(root,'app.js'),'utf8');
const elements=new Map();
function element(selector){if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',addEventListener(){}});return elements.get(selector)}
const ctx={document:{querySelector:element,querySelectorAll:()=>[]},window:{matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null}};
vm.createContext(ctx);
vm.runInContext(script.split("$('#project-grid').addEventListener")[0]+'\nrenderProjects();this.siteData={projects,copy,architectureAssets};',ctx);
const htmlFile=path.join(root,'index.html');
const html=fs.readFileSync(htmlFile,'utf8');
const pattern=/(<div class="project-grid" id="project-grid">)[\s\S]*?(<\/div>\s*<p class="project-footnote")/;
if(!pattern.test(html))throw Error('Could not locate the prerendered project grid');
fs.writeFileSync(htmlFile,html.replace(pattern,(_,open,close)=>open+element('#project-grid').innerHTML+close));
console.log('Updated prerendered cards from the exact application renderer.');
