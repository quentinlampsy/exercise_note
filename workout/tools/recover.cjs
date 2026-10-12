const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'recover.html'));
function createRecoveryServer(){return http.createServer((req,res)=>{
  if(req.method!=='GET'){res.writeHead(405);return res.end();}
  let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400);return res.end();}
  if(pathname==='/'){res.writeHead(302,{Location:'/form-recovery/'});return res.end();}
  if(pathname!=='/form-recovery/'){res.writeHead(404);return res.end('This is the FORM backup recovery tool. Open /form-recovery/.');}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(html);
});}
if(require.main===module){
  const server=createRecoveryServer();
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port 4173 is busy. Temporarily close the calendar and any old FORM preview terminal, then retry this recovery tool. No running program has been stopped.':error.message);process.exitCode=1;});
  server.listen(4173,'127.0.0.1',()=>console.log('FORM backup recovery: http://localhost:4173/form-recovery/\nUse the SAME browser/profile you used for the old FORM website.\nThis tool only reads FORM browser storage. It does not connect to Firebase or delete data.\nAfter exporting, press Ctrl+C and close this window before restarting your calendar.'));
}
module.exports={createRecoveryServer};
