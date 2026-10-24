// Loopback preview with optional GitHub Star service; no model requests.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const {createStarService}=require('./star-service.cjs');
const starService=createStarService({clientId:process.env.GITHUB_STAR_CLIENT_ID,origin:process.env.STAR_PUBLIC_ORIGIN || `http://127.0.0.1:${process.env.MIRA_PREVIEW_PORT || 4173}`});
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8'};
const server = http.createServer((req,res)=>{
  if(req.url.startsWith('/api/stars/')){starService(req,res).catch(()=>{if(!res.headersSent)res.writeHead(500);res.end();});return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(pathname.includes('\0')){res.writeHead(400);res.end();return;}
  if(pathname.split(/[\\/]/).some(part=>part.startsWith('.'))){res.writeHead(403);res.end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.stat(file,(error,stat)=>{if(error || !stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()] || 'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD'){res.end();return;}const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
});
server.on('error',error=>{console.error(error.message);process.exit(1);});
server.listen(Number(process.env.MIRA_PREVIEW_PORT || 4173),'127.0.0.1',()=>console.log(`MIRA local preview: http://127.0.0.1:${server.address().port}`));
