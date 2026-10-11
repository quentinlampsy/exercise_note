const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let chromium;
try{({chromium}=require('playwright'));}catch{console.error('Browser checks need Playwright. Install it locally with npm install --no-save playwright, then npx playwright install chromium. Day-to-day use and npm test need no extra packages.');process.exit(1);}
const {createServer}=require('./serve.cjs');
async function run(){
 const server=createServer({offline:true});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}/form/`;
 const edge='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
 const output=path.resolve(__dirname,'../tests/screenshots');fs.mkdirSync(output,{recursive:true});
 // Browser profiles, downloads and temporary artifacts stay inside the project.
 const temp=path.resolve(__dirname,'../../test-results/form-browser-tmp');fs.mkdirSync(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;
 const browser=await chromium.launch({headless:true,...(fs.existsSync(edge)?{executablePath:edge}:{})});
 const errors=[];
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1050},timezoneId:'Asia/Hong_Kong'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.getByRole('heading',{name:'Your week, in motion.'}).waitFor();
 assert.equal(await page.locator('.day').count(),7);assert.equal(await page.locator('.exercise-card').count(),0);
 // A genuine routine with unequal reps/weights, saved results and a future recurrence.
 await page.locator('.day').nth(1).getByRole('button',{name:/Add exercise/}).click();
 await page.getByLabel('Movement',{exact:true}).fill('Cable row');
 await page.getByRole('button',{name:'4 sets',exact:true}).click();
 assert.equal(await page.locator('.set-row').count(),4);
 for(let i=0;i<4;i++){await page.getByRole('spinbutton',{name:`Set ${i+1} weight`,exact:true}).fill(String(30+i*5));await page.getByRole('spinbutton',{name:`Set ${i+1} reps`,exact:true}).fill(String(12-i*2));}
 const date=await page.getByLabel('Workout day',{exact:true}).inputValue();
 await page.getByLabel('Repeat this workout',{exact:true}).selectOption('weekly');
 await page.getByLabel('A note for yourself',{exact:false}).fill('Keep elbows close.');
 await page.getByRole('button',{name:'Set 1 complete',exact:true}).click();
 await page.getByRole('button',{name:/Save exercise/}).click();
 assert.equal(await page.locator('.exercise-card').count(),1);
 assert.ok((await page.locator('.card-summary').textContent()).includes('12 / 10 / 8 / 6'));
 await page.getByRole('button',{name:'Next week',exact:true}).click();
 assert.equal(await page.locator('.exercise-card').count(),1);
 assert.equal(await page.locator('.set-dot.done').count(),0);
 await page.getByRole('button',{name:'Today',exact:true}).click();
 await page.getByRole('button',{name:/Edit Cable row on/}).click();
 assert.equal(await page.getByRole('spinbutton',{name:'Set 2 reps',exact:true}).inputValue(),'10');
 await page.getByRole('spinbutton',{name:'Set 2 reps',exact:true}).fill('8');
 await page.getByRole('button',{name:/Save exercise/}).click();
 await page.reload();await page.locator('.exercise-card').waitFor();
 assert.equal(await page.locator('.set-dot.done').count(),1);
 await page.getByRole('button',{name:'Complete Cable row',exact:true}).click();
 assert.equal(await page.locator('.set-dot.done').count(),4);
 await page.locator('.main-nav').getByRole('link',{name:'History',exact:true}).click();
 assert.equal(await page.locator('.history-entry').count(),3);
 await page.locator('.history-entry').first().locator('summary').click();
 assert.ok((await page.locator('.history-entry').first().textContent()).includes('Set 2: 35 kg × 8 reps'));
 await page.getByRole('tab',{name:'Workout log',exact:true}).click();
 assert.equal(await page.locator('.log-card').count(),1);
 await page.screenshot({path:path.join(output,'desktop-history.png'),fullPage:true});
 await page.locator('.main-nav').getByRole('link',{name:'This week',exact:true}).click();
 // One-day edits, removal and future routine edits preserve previous workouts.
 await page.getByRole('button',{name:'Next week',exact:true}).click();
 await page.getByRole('button',{name:/Edit Cable row on/}).click();
 await page.getByLabel('Apply changes to',{exact:true}).selectOption('future');
 await page.getByRole('spinbutton',{name:'Set 1 weight',exact:true}).fill('55');
 await page.getByRole('button',{name:/Save exercise/}).click();
 await page.getByRole('button',{name:'Today',exact:true}).click();
 await page.getByRole('button',{name:/Edit Cable row on/}).click();
 assert.equal(await page.getByRole('spinbutton',{name:'Set 1 weight',exact:true}).inputValue(),'30');
 await page.getByRole('button',{name:'Close editor',exact:true}).click();
 await page.getByRole('button',{name:'Next week',exact:true}).click();
 await page.getByRole('button',{name:/Edit Cable row on/}).click();
 assert.equal(await page.getByRole('spinbutton',{name:'Set 1 weight',exact:true}).inputValue(),'55');
 await page.getByRole('button',{name:'Remove',exact:true}).click();
 await page.locator('#confirm-ok').click();
 assert.equal(await page.locator('.exercise-card').count(),0);
 await page.getByRole('button',{name:'Next week',exact:true}).click();
 assert.equal(await page.locator('.exercise-card').count(),1);
 // Unsafe text renders as text, not markup. Mobile editor, repeat intervals and touch set selection.
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('.week-board').evaluate(el=>getComputedStyle(el).flexDirection),'column');
 await page.locator('#mobile-add').click();
 assert.equal(await page.getByRole('button',{name:'Remove',exact:true}).isVisible(),false);
 await page.getByLabel('Movement',{exact:true}).fill('<img src=x onerror=alert(1)>');
 await page.getByRole('button',{name:'5 sets',exact:true}).click();
 assert.equal(await page.locator('.set-row').count(),5);
 await page.getByLabel('Repeat this workout',{exact:true}).selectOption('interval');
 await page.getByLabel('Number of days between workouts',{exact:true}).fill('2');
 await page.getByRole('spinbutton',{name:'Set 1 reps',exact:true}).fill('8');
 await page.screenshot({path:path.join(output,'mobile-editor.png')});
 await page.getByRole('button',{name:/Save exercise/}).click();
 assert.equal(await page.locator('.exercise-card img').count(),0);
 assert.equal(await page.locator('#editor').evaluate(el=>el.open),false,await page.locator('#editor-error').textContent());
 assert.ok((await page.locator('.card-name').allTextContents()).includes('<img src=x onerror=alert(1)>'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(output,'mobile-week.png'),fullPage:true});
 // Backup export/import, activity search and reload persist the exact recorded reps.
 await page.getByRole('button',{name:/Your account:/}).click();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:false}).click();const download=await downloadPromise;assert.ok(download.suggestedFilename().startsWith('FORM-workouts-'));
 await download.saveAs(path.join(output,'backup.json'));
 await page.locator('#backup-file').setInputFiles(path.join(output,'backup.json'));await page.locator('#confirm-ok').click();
 await page.getByRole('button',{name:'Close account',exact:true}).click();
 await page.locator('.mobile-nav').getByRole('link',{name:'History',exact:true}).click();
 await page.getByRole('tab',{name:'Activity & changes',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search exercise history',exact:true}).fill('No matching movement');
 assert.equal(await page.locator('.history-entry').count(),0);
 await page.getByRole('searchbox',{name:'Search exercise history',exact:true}).fill('Cable row');
 assert.equal(await page.locator('.history-entry').count(),5);
 await page.screenshot({path:path.join(output,'mobile-history.png'),fullPage:true});
 // Clean representative sample overview, isolated from the real Firebase project.
 await context.close();
 const sampleContext=await browser.newContext({viewport:{width:1440,height:1050},timezoneId:'Asia/Hong_Kong'});
 const samplePage=await sampleContext.newPage();samplePage.on('pageerror',e=>errors.push(e.message));
 await samplePage.goto(url);
 await samplePage.getByRole('button',{name:'Try a sample week ↗',exact:true}).click();await samplePage.locator('#confirm-ok').click();
 assert.equal(await samplePage.locator('.exercise-card').count(),8);
 await samplePage.locator('#toast').evaluate(el=>el.classList.remove('visible'));
 await samplePage.screenshot({path:path.join(output,'desktop-week.png'),fullPage:true});
 await samplePage.setViewportSize({width:390,height:844});await samplePage.screenshot({path:path.join(output,'mobile-sample.png'),fullPage:true});
 // The published shell can survive a reload with no internet after initial caching.
 await samplePage.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;});
 await samplePage.reload();await samplePage.locator('.exercise-card').first().waitFor();
 await sampleContext.setOffline(true);await samplePage.reload();await samplePage.getByRole('heading',{name:'Your week, in motion.'}).waitFor();
 assert.equal(await samplePage.locator('.exercise-card').count(),8);
 await sampleContext.setOffline(false);
 // Exercise account isolation, pending writes, errors and reconnect through a
 // deterministic transport. No real credentials or production writes are used.
 const cloudContext=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Hong_Kong'});
 const cloudPage=await cloudContext.newPage();cloudPage.on('pageerror',e=>errors.push(e.message));
 await cloudPage.route('**/workout/cloud.mjs',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.resolve(__dirname,'../tests/fake-cloud.mjs'),'utf8')}));
 // The server's isolated configuration is replaced with an inert test identifier.
 await cloudPage.route('**/workout/config.js',route=>route.fulfill({contentType:'text/javascript',body:'window.FORM_CONFIG={firebase:{apiKey:"test"}};'}));
 await cloudPage.goto(url);
 await cloudPage.locator('#mobile-add').click();await cloudPage.getByLabel('Movement',{exact:true}).fill('Guest pull-up');await cloudPage.getByRole('button',{name:/Save exercise/}).click();
 await cloudPage.getByRole('button',{name:/Your account:/}).click();
 await cloudPage.getByLabel('Email',{exact:true}).fill('user-a@example.com');await cloudPage.getByLabel('Password',{exact:true}).fill('test-only-password');await cloudPage.getByRole('button',{name:'Sign in',exact:false}).click();
 await cloudPage.waitForFunction(()=>document.querySelector('#account-label').textContent==='Cloud synced');
 assert.equal(await cloudPage.locator('.exercise-card').count(),0);
 await cloudPage.getByRole('button',{name:'Copy device workouts to my account',exact:true}).click();await cloudPage.locator('#confirm-ok').click();
 await cloudPage.waitForFunction(()=>JSON.parse(localStorage.getItem('test-cloud:user-a')||'[]').length===2);
 await cloudPage.getByRole('button',{name:'Close account',exact:true}).click();
 assert.equal(await cloudPage.locator('.exercise-card').count(),1);
 await cloudPage.evaluate(()=>window.testWrites=[]);
 await cloudContext.setOffline(true);
 await cloudPage.getByRole('button',{name:/Edit Guest pull-up on/}).click();await cloudPage.getByRole('spinbutton',{name:'Set 1 reps',exact:true}).fill('8');await cloudPage.getByRole('button',{name:/Save exercise/}).click();
 assert.equal(await cloudPage.locator('#account-label').textContent(),'Saved offline');
 assert.equal(await cloudPage.evaluate(()=>window.testWrites.length),0);
 await cloudContext.setOffline(false);
 await cloudPage.waitForFunction(()=>document.querySelector('#account-label').textContent==='Cloud synced');
 assert.equal(await cloudPage.evaluate(()=>window.testWrites.flat().length),2);
 // A rejected write stays local; retry uploads it without losing the audit entry.
 await cloudPage.evaluate(()=>window.testFailWrite=true);
 await cloudPage.getByRole('button',{name:'Complete Guest pull-up',exact:true}).click();
 await cloudPage.waitForFunction(()=>document.querySelector('#account-label').textContent==='Sync needs attention');
 await cloudPage.getByRole('button',{name:/Your account:/}).click();assert.ok((await cloudPage.locator('#account-body').textContent()).includes('rules need updating'));
 await cloudPage.getByRole('button',{name:'Retry sync',exact:true}).click();await cloudPage.waitForFunction(()=>document.querySelector('#account-label').textContent==='Cloud synced');
 await cloudPage.getByRole('button',{name:'Sign out',exact:true}).click();await cloudPage.getByRole('button',{name:'Close account',exact:true}).click();
 assert.equal(await cloudPage.locator('.set-dot.done').count(),0);
 await cloudPage.getByRole('button',{name:/Your account:/}).click();await cloudPage.getByLabel('Email',{exact:true}).fill('user-b@example.com');await cloudPage.getByLabel('Password',{exact:true}).fill('test-only-password');await cloudPage.getByRole('button',{name:'Sign in',exact:false}).click();
 await cloudPage.waitForFunction(()=>document.querySelector('#account-label').textContent==='Cloud synced');await cloudPage.getByRole('button',{name:'Close account',exact:true}).click();assert.equal(await cloudPage.locator('.exercise-card').count(),0);
 await cloudPage.locator('#mobile-add').click();await cloudPage.getByLabel('Movement',{exact:true}).fill('Should not cross accounts');
 await cloudPage.evaluate(()=>window.testSwitchUser({uid:'user-a',email:'user-a@example.com'}));
 await cloudPage.getByRole('button',{name:/Save exercise/}).click();assert.ok((await cloudPage.locator('#editor-error').textContent()).includes('account changed'));
 await cloudContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop and phone layouts; per-set edits; completion; recurrence; routine edits; day removal; persistence; XSS escaping; history; backups; PWA offline reload; isolated account-sync simulation (offline retry, rejected writes, account isolation).');
 console.log(`Screenshots: ${output}`);
 await sampleContext.close();
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
