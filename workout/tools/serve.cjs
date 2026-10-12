const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
// Serve the explicit public build only. Source, account keys and backups are never exposed.
const publicRoot=path.join(root,'dist');
const DEFAULT_PORT=4174;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
function createServer({offline=false}={}){return http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}if(pathname.startsWith('/form/'))pathname=pathname.slice(5);if(pathname==='/form'){res.writeHead(302,{Location:'/form/'});return res.end();}const relative=pathname.replace(/^\//,'')||'index.html';const target=path.resolve(publicRoot,relative);if(offline&&relative==='workout/config.js'){res.writeHead(200,{'Content-Type':types['.js']});return res.end('window.FORM_CONFIG={firebase:{}};');}if(!target.startsWith(publicRoot+path.sep)||relative.split('/').some(x=>x.startsWith('.'))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(target).pipe(res);});}
if(require.main===module){
  require('./build.cjs');
  // FORM_PORT is app-specific. A shared PORT variable must not send FORM back
  // to the calendar's 4173 address. Launchers explicitly select 4174 as well.
  const option=process.argv.find(arg=>arg.startsWith('--port='));
  const port=Number(option?option.slice(7):(process.env.FORM_PORT||DEFAULT_PORT));
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('FORM port must be a whole number between 1 and 65535.');
  const server=createServer({offline:process.argv.includes('--offline')});
  server.on('error',error=>{
    if(error.code==='EADDRINUSE')console.error(`FORM cannot start because port ${port} is already in use. Close the earlier FORM preview, then retry. Your calendar uses port 4173 and can stay open.`);
    else console.error(error.message);
    process.exitCode=1;
  });
  server.listen(port,'127.0.0.1',()=>console.log(`FORM preview: http://localhost:${port}/form/\nCalendar stays at http://localhost:4173/bazi-planner-web/\nKeep this window open. Press Ctrl+C to stop.`));
}
module.exports={createServer,DEFAULT_PORT};
