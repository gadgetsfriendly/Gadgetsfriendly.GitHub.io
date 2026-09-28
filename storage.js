/* GadgetsFriendly Stage 3 local database layer.
   Uses IndexedDB so product images and customer records are not limited by localStorage's small quota.
   This is still browser-local storage; Stage 4/5 can replace this layer with a real server database. */
(function(){
  const DB_NAME='GadgetsFriendlyDB';
  const DB_VERSION=1;
  const ADMIN_PRODUCTS_KEY='gf_admin_products_v2';
  const ADMIN_WA='2349071073992';

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        if(!db.objectStoreNames.contains('products')) db.createObjectStore('products',{keyPath:'id'});
        if(!db.objectStoreNames.contains('repairs')) db.createObjectStore('repairs',{keyPath:'id'});
        if(!db.objectStoreNames.contains('purchases')) db.createObjectStore('purchases',{keyPath:'id'});
        if(!db.objectStoreNames.contains('meta')) db.createObjectStore('meta',{keyPath:'key'});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Could not open local database.'));
    });
  }
  function tx(store,mode='readonly'){
    return openDB().then(db=>({db,transaction:db.transaction(store,mode),store:db.transaction(store,mode).objectStore(store)}));
  }
  async function getAll(store){
    const db=await openDB();
    return new Promise((resolve,reject)=>{const t=db.transaction(store,'readonly');const r=t.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error||new Error('Database read failed.'));});
  }
  async function get(store,id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{const t=db.transaction(store,'readonly');const r=t.objectStore(store).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error||new Error('Database read failed.'));});
  }
  async function put(store,value){
    const db=await openDB();
    return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=()=>resolve(value);t.onerror=()=>reject(t.error||new Error('Database save failed.'));});
  }
  async function remove(store,id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).delete(id);t.oncomplete=resolve;t.onerror=()=>reject(t.error||new Error('Database delete failed.'));});
  }
  async function clear(store){
    const db=await openDB();
    return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).clear();t.oncomplete=resolve;t.onerror=()=>reject(t.error||new Error('Database clear failed.'));});
  }
  async function metaGet(key){const v=await get('meta',key);return v?v.value:null;}
  async function metaSet(key,value){return put('meta',{key,value});}

  async function dataUrlToBlob(src){
    if(!src) return null;
    try{return await fetch(src).then(r=>r.blob());}catch(e){return null;}
  }

  async function migrateProducts(){
    const migrated=await metaGet('productsMigratedV1');
    if(migrated) return;
    let old=[];
    try{old=JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)||'[]');}catch(e){old=[];}
    const existing=await getAll('products');
    if(!existing.length && Array.isArray(old) && old.length){
      for(const p of old){
        const copy={...p,imageBlob:null};
        if(p.image) copy.imageBlob=await dataUrlToBlob(p.image);
        delete copy.image;
        await put('products',copy);
      }
    }
    try{localStorage.removeItem(ADMIN_PRODUCTS_KEY);}catch(e){}
    await metaSet('productsMigratedV1',true);
  }

  function waUrl(message){return 'https://wa.me/'+ADMIN_WA+'?text='+encodeURIComponent(message);}
  function notifyWhatsApp(message){window.open(waUrl(message),'_blank','noopener');}
  function formatNaira(n){return '₦'+Number(n||0).toLocaleString('en-NG');}
  function makeId(prefix){return prefix+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);}

  window.GFDB={openDB,getAll,get,put,remove,clear,migrateProducts,waUrl,notifyWhatsApp,formatNaira,makeId,ADMIN_WA};
})();
