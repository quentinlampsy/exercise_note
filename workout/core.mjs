export const GROUPS = ['Back', 'Chest', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const clone = value => JSON.parse(JSON.stringify(value));
export function uid() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function parseDate(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); }
export function validDate(key) { return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseDate(key)) === key; }
export function addDays(key, amount) { const date = parseDate(key); date.setDate(date.getDate()+amount); return dateKey(date); }
export function monday(key) { const d = parseDate(key); return addDays(key,-((d.getDay()+6)%7)); }
export function daysBetween(a,b) { return Math.round((Date.UTC(...a.split('-').map((v,i)=>Number(v)-(i===1?1:0))) - Date.UTC(...b.split('-').map((v,i)=>Number(v)-(i===1?1:0))))/86400000); }
export function occurs(plan,date) {
  if (plan.deleted || date < plan.date || (plan.repeat.end && date > plan.repeat.end)) return false;
  const diff = daysBetween(date,plan.date);
  if (plan.repeat.kind === 'none') return diff === 0;
  if (plan.repeat.kind === 'weekly') return plan.repeat.weekdays.includes((parseDate(date).getDay()+6)%7);
  return diff % (plan.repeat.kind === 'daily' ? 1 : plan.repeat.interval) === 0;
}
export function occurrenceId(planId,date) { return `${planId}_${date}`; }
export function exercisesOn(plans,logs,date) {
  return plans.filter(p=>occurs(p,date)).map(plan => {
    const id = occurrenceId(plan.id,date), log = logs.find(l=>l.id === id);
    return { ...clone(plan), date, sets: plan.sets.map(s=>({...s,done:false})), ...clone(log || {}), id, planId:plan.id, repeating:plan.repeat.kind !== 'none' };
  }).filter(item=>!item.skipped).sort((a,b)=>(a.createdAt || '').localeCompare(b.createdAt || '') || a.exercise.localeCompare(b.exercise));
}
export function complete(item) { return item.sets.length > 0 && item.sets.every(s=>s.done); }
export function volume(item) { return item.sets.reduce((n,s)=>n+(s.done ? s.weight*s.reps : 0),0); }
export function validateExercise(item) {
  if (!validDate(item.date)) throw Error('Choose a valid workout date.');
  if (typeof item.exercise !== 'string' || !item.exercise.trim() || item.exercise.length > 100) throw Error('Enter a movement name (up to 100 characters).');
  if (!GROUPS.includes(item.group)) throw Error('Choose a muscle group.');
  if (!['kg','lb','bodyweight'].includes(item.unit)) throw Error('Choose a weight unit.');
  if (!Array.isArray(item.sets) || item.sets.length < 1 || item.sets.length > 12) throw Error('Choose between 1 and 12 sets.');
  for (const set of item.sets) {
    if (typeof set.weight !== 'number' || !Number.isFinite(set.weight) || set.weight < 0 || set.weight > 2000) throw Error('Weight must be between 0 and 2,000.');
    if (!Number.isInteger(set.reps) || set.reps < 1 || set.reps > 999) throw Error('Reps must be a whole number between 1 and 999.');
    if (typeof set.done !== 'boolean') throw Error('Each set needs a completion state.');
  }
  if (typeof item.notes !== 'string' || item.notes.length > 2000) throw Error('Notes can contain up to 2,000 characters.');
  const repeat = item.repeat;
  if (!repeat || !['none','daily','interval','weekly'].includes(repeat.kind)) throw Error('Choose a repeat option.');
  if (!Number.isInteger(repeat.interval) || repeat.interval < 1 || repeat.interval > 365) throw Error('Repeat interval must be between 1 and 365 days.');
  if (!Array.isArray(repeat.weekdays) || repeat.weekdays.length > 7 || repeat.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6) || (repeat.kind === 'weekly' && !repeat.weekdays.length)) throw Error('Choose at least one repeat day.');
  if (repeat.end && (!validDate(repeat.end) || repeat.end < item.date)) throw Error('The repeat end date must be on or after the workout date.');
  return true;
}
export function winner(a,b) {
  if (!a) return b; if (!b) return a;
  return a.updatedAt > b.updatedAt ? a : a.updatedAt < b.updatedAt ? b : JSON.stringify(a) > JSON.stringify(b) ? a : b;
}
export function validRecord(record) {
  if (!record || typeof record.id !== 'string' || !record.id.length || record.id.length > 180 || !['plans','logs','history'].includes(record.type) || typeof record.updatedAt !== 'string' || record.updatedAt.length > 30 || !/^\d{4}-\d{2}-\d{2}T/.test(record.updatedAt) || !Number.isFinite(Date.parse(record.updatedAt)) || typeof record.deleted !== 'boolean') return false;
  if (record.deleted) return record.type !== 'history' && record.data === null;
  if (!record.data || record.data.id !== record.id) return false;
  try {
    if (record.type !== 'history') { validateExercise(record.data); if (record.type === 'logs' && typeof record.data.planId !== 'string') return false; }
    else {
      if (!validDate(record.data.date) || typeof record.data.action !== 'string' || typeof record.data.exercise !== 'string' || typeof record.data.timestamp !== 'string' || !Number.isFinite(Date.parse(record.data.timestamp))) return false;
      for (const snap of [record.data.before,record.data.after]) if (snap) validateExercise(snap);
    }
    return true;
  } catch { return false; }
}
export function makeSample(today) {
  const start = monday(today), stamp = new Date().toISOString();
  return [
    [0,'Lat pulldown','Back',3,40,12], [0,'Seated cable row','Back',3,35,10],
    [1,'Bench press','Chest',4,50,8], [1,'Incline dumbbell press','Chest',3,18,12],
    [3,'Barbell squat','Legs',4,60,8], [3,'Romanian deadlift','Legs',3,50,10],
    [5,'Shoulder press','Shoulders',3,16,10], [5,'Lateral raise','Shoulders',3,6,12],
  ].map(([offset,exercise,group,count,weight,reps])=>({id:uid(),date:addDays(start,offset),exercise,group,unit:'kg',sets:Array.from({length:count},()=>({weight,reps,done:false})),notes:'',repeat:{kind:'weekly',interval:7,weekdays:[offset],end:''},createdAt:stamp}));
}
