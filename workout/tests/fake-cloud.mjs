// Browser-test transport only. Never included in the public build.
let authCallback, subscriber, activeUid;
const key=uid=>'test-cloud:'+uid;
const read=uid=>JSON.parse(localStorage.getItem(key(uid))||'[]');
export async function connect(){return{
 onAuthChanged(fn){authCallback=fn;window.testSwitchUser=user=>{localStorage.setItem('test-auth',JSON.stringify(user));fn(user);};fn(JSON.parse(localStorage.getItem('test-auth')||'null'));},
 async signIn(email){const user={uid:email.split('@')[0],email};window.testSwitchUser(user);return{user};},
 async signUp(email){return this.signIn(email);},
 async signOut(){window.testSwitchUser(null);},
 async resetPassword(){},
 subscribe(uid,receive){activeUid=uid;subscriber=receive;queueMicrotask(()=>{if(activeUid===uid)receive(read(uid));});return()=>{subscriber=null;};},
 async send(uid,records){
   if(window.testFailWrite){window.testFailWrite=false;throw{code:'permission-denied'};}
   window.testWrites=(window.testWrites||[]).concat([records]);
   const current=read(uid);for(const r of records){const i=current.findIndex(x=>x.id===r.id&&x.type===r.type);if(i<0)current.push(r);else current[i]=r;}
   localStorage.setItem(key(uid),JSON.stringify(current));
   queueMicrotask(()=>{if(activeUid===uid)subscriber?.(current);});
   return records;
 }
};}
