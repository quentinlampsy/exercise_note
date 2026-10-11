import { clone, uid, winner, validRecord } from './core.mjs';
const PREFIX = 'form-workouts-v1:';
export class Store {
  constructor(storage = localStorage) { this.storage=storage; this.scope='guest'; this.listeners=[]; this.load(); }
  load() {
    const raw=this.storage.getItem(PREFIX+this.scope);
    try { this.records=raw ? JSON.parse(raw) : []; if (!Array.isArray(this.records) || !this.records.every(validRecord)) throw Error(); }
    catch { this.records=[]; this.error='Saved workout data could not be opened. It has been preserved; export a backup before making changes.'; this.corrupt=raw; }
  }
  switchScope(scope) { this.scope=scope; this.error=''; this.corrupt=null; this.load(); this.notify(); }
  onChange(fn) { this.listeners.push(fn); return ()=>this.listeners=this.listeners.filter(l=>l!==fn); }
  notify() { this.listeners.forEach(fn=>fn()); }
  list(type) { return this.records.filter(r=>r.type===type&&!r.deleted).map(r=>clone(r.data)); }
  persist(records) { if(this.corrupt) throw Error(this.error); try { this.storage.setItem(PREFIX+this.scope,JSON.stringify(records)); } catch { throw Error('Your device could not save this change. Export a backup or free browser storage, then try again.'); } }
  commit(entries) {
    const stamp=new Date().toISOString();
    const changes=entries.map(({type,data,id,deleted=false})=>({id:id||data.id,type,updatedAt:stamp,deleted,data:deleted?null:clone(data)}));
    if(!changes.every(validRecord)) throw Error('This workout could not be saved. Check its date, sets and repeat settings.');
    const next=clone(this.records);
    for(const r of changes) { const index=next.findIndex(x=>x.type===r.type&&x.id===r.id); if(index<0)next.push(r);else next[index]=r; }
    this.persist(next); this.records=next; this.notify(); return changes;
  }
  merge(incoming) {
    const next=clone(this.records); let changed=false;
    for(const r of incoming.filter(validRecord)) { const i=next.findIndex(x=>x.id===r.id&&x.type===r.type); const chosen=winner(next[i],r); if(JSON.stringify(chosen)!==JSON.stringify(next[i])) { if(i<0)next.push(clone(chosen));else next[i]=clone(chosen); changed=true; } }
    if(changed) { this.persist(next);this.records=next;this.notify(); }
  }
  history(action,before,after,scope='day') {
    const item=after||before;
    return {type:'history',data:{id:uid(),timestamp:new Date().toISOString(),date:item.date,exercise:item.exercise,group:item.group,action,scope,before:before?clone(before):null,after:after?clone(after):null}};
  }
  export() { return this.corrupt || JSON.stringify({app:'FORM',version:1,exportedAt:new Date().toISOString(),records:this.records},null,2); }
  import(text) { const backup=JSON.parse(text); if(backup.app!=='FORM'||backup.version!==1||!Array.isArray(backup.records)||!backup.records.every(validRecord))throw Error('Choose an original FORM workout backup (.json).'); if(this.corrupt)throw Error(this.error);this.merge(backup.records); }
}
