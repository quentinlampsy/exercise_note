const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../..'),destination=path.join(root,'dist');
const config={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'workout/config.js'),'utf8'),config);
if(!process.argv.includes('--local')&&!['apiKey','authDomain','projectId','appId'].every(key=>config.window.FORM_CONFIG.firebase[key]?.trim()))throw Error('Set the public Firebase configuration in workout/config.js. See README.md.');
const files=['index.html','manifest.webmanifest','sw.js','.nojekyll','workout/styles.css','workout/config.js','workout/icon.svg','workout/icon-192.png','workout/icon-512.png',...['core','store','cloud','app'].map(n=>'workout/'+n+'.mjs')];
const hash=createHash('sha256');for(const file of files)hash.update(file).update(fs.readFileSync(path.join(root,file)));
const version=hash.digest('hex').slice(0,16);
if(fs.existsSync(destination)){if(path.resolve(destination)!==path.join(root,'dist'))throw Error('Invalid build folder');fs.rmSync(destination,{recursive:true,force:true});}
for(const file of files){const target=path.join(destination,file);fs.mkdirSync(path.dirname(target),{recursive:true});if(file==='sw.js')fs.writeFileSync(target,fs.readFileSync(path.join(root,file),'utf8').replace("const VERSION = 'form-dev';",`const VERSION = '${version}';`));else fs.copyFileSync(path.join(root,file),target);}
console.log(`FORM built: ${files.length} public files in ${destination}. Cache version ${version}.`);
