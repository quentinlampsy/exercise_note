import { winner } from './core.mjs';
const SDK='https://www.gstatic.com/firebasejs/12.19.0/';
let loading;
export function connect(config) {
  if(!loading) loading=(async()=>{
    const [appSDK,authSDK,dbSDK]=await Promise.all(['app','auth','firestore'].map(name=>import(SDK+`firebase-${name}.js`)));
    const app=appSDK.initializeApp(config,'form-workouts'),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
    const collection=uid=>dbSDK.collection(db,'users',uid,'workoutRecords');
    return {
      onAuthChanged:fn=>authSDK.onAuthStateChanged(auth,fn),
      signIn:async(email,password)=>{await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);return authSDK.signInWithEmailAndPassword(auth,email,password);},
      signUp:async(email,password)=>{await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);return authSDK.createUserWithEmailAndPassword(auth,email,password);},
      resetPassword:email=>authSDK.sendPasswordResetEmail(auth,email),
      signOut:()=>authSDK.signOut(auth),
      subscribe:(uid,receive,fail)=>dbSDK.onSnapshot(collection(uid),{includeMetadataChanges:true},snap=>{if(!snap.metadata.fromCache)receive(snap.docs.map(d=>d.data()));},fail),
      send:async(uid,records)=>{
        // A workout and its audit entry commit together. Transactions prevent older
        // offline devices from resurrecting deleted records or replacing newer edits.
        return dbSDK.runTransaction(db,async tx=>{
          const refs=records.map(r=>dbSDK.doc(collection(uid),encodeURIComponent(r.type+':'+r.id)));
          const snapshots=await Promise.all(refs.map(ref=>tx.get(ref)));
          const chosen=records.map((r,i)=>winner(snapshots[i].exists()?snapshots[i].data():null,r));
          chosen.forEach((r,i)=>{if(JSON.stringify(r)!==JSON.stringify(snapshots[i].exists()?snapshots[i].data():null))tx.set(refs[i],r);});
          return chosen;
        });
      }
    };
  })().catch(error=>{loading=null;throw error;});
  return loading;
}
