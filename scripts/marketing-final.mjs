import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const BASE='http://localhost:5051/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CAND=resolve('store/candy');
const CAP=[['home','#/oggi'],['habits','#/abitudini'],['notes','#/note'],['activity','#/attivita'],['recap','#/recap']];
const COPY={
  it:{
    out:resolve('store/mk-it'),
    s:[['Tutta la tua vita,\nin un posto','Salute, abitudini, note e momentum'],
       ['Abitudini\nche durano','Streak e progressi, giorno per giorno'],
       ['Note con\nchecklist','Idee e liste, sempre con te'],
       ['Connessa ad\nApple Salute','Allenamenti e anelli attività'],
       ['Il tuo\nmomentum','Un riepilogo che ti motiva']],
  },
  en:{
    out:resolve('store/mk-en'),
    s:[['Your whole life,\nin one place','Health, habits, notes & momentum'],
       ['Habits\nthat stick','Streaks and progress, day by day'],
       ['Notes with\nchecklists','Ideas and lists, always with you'],
       ['Connected to\nApple Health','Workouts and activity rings'],
       ['Your\nmomentum','A recap that keeps you going']],
  },
};
const NOTES=[
  { title:'Spesa settimana', body:'', color:'#10b981', pinned:true, checklist:[['Pane integrale',true],['Avocado',true],['Yogurt greco',false],['Caffè',false]] },
  { title:'Idee app', body:'Widget meteo + frase del giorno.', color:'#8b5cf6', pinned:true, checklist:[] },
  { title:'Allenamento', body:'', color:'#ff6b57', pinned:false, checklist:[['Riscaldamento',true],['Panca 4x8',false],['Stretching',false]] },
  { title:'Viaggio', body:'Volo 14 giu · prova i pastéis!', color:'#e0992f', pinned:false, checklist:[] },
  { title:'Regali', body:'', color:'#ec4899', pinned:false, checklist:[['Mamma',true],['Luca',false]] },
];
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const cap=await br.newPage(); await cap.setViewport({width:390,height:844,deviceScaleFactor:3});
cap.on('dialog',async d=>{try{await d.accept()}catch{}});
// seed once (lang it)
await cap.goto(BASE,{waitUntil:'networkidle2'});
await cap.evaluate(()=>{localStorage.setItem('vita.onboarded','1');localStorage.setItem('vita.theme','light');localStorage.setItem('vita.lang','it');localStorage.setItem('vita.dailywin.shown',new Date().toISOString().slice(0,10));localStorage.setItem('vita.backup.lastAt',String(Date.now()));});
await cap.goto(BASE,{waitUntil:'networkidle2'});await sleep(800);
await cap.evaluate(()=>{location.hash='#/impostazioni';});await sleep(1200);
await cap.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Carica dati demo'));if(b)b.click();});
await sleep(6000);
await cap.evaluate(async(NOTES)=>{const req=indexedDB.open('vita');const db=await new Promise(r=>{req.onsuccess=()=>r(req.result)});if(![...db.objectStoreNames].includes('notes'))return;const now=Date.now();const uid=p=>p+Math.random().toString(36).slice(2,10);const rows=NOTES.map((n,i)=>({id:uid('not_'),title:n.title,body:n.body,color:n.color,pinned:n.pinned,checklist:n.checklist.map(([text,done])=>({id:uid('chk_'),text,done})),createdAt:now-i*1000,updatedAt:now-i*1000}));await new Promise((res,rej)=>{const tx=db.transaction('notes','readwrite');rows.forEach(r=>tx.objectStore('notes').put(r));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});},NOTES);
await sleep(600);
for(const lang of ['it','en']){
  mkdirSync(resolve(CAND,'mk'),{recursive:true});
  await cap.evaluate(l=>{localStorage.setItem('vita.lang',l);},lang);
  await cap.goto(BASE,{waitUntil:'networkidle2'});await sleep(1000);
  for(const [key,hash] of CAP){
    await cap.evaluate(h=>{location.hash=h;window.scrollTo(0,0);},hash);await sleep(1600);
    await cap.evaluate(()=>{const r=document.querySelector('#root');if(r)r.scrollTo(0,0);});await sleep(300);
    await cap.screenshot({path:resolve(CAND,`mk/${lang}-${key}.png`)});
  }
  console.log('captured screens',lang);
}
// compose slides (previous layout, 1290×2796)
const comp=await br.newPage(); await comp.setViewport({width:645,height:1398,deviceScaleFactor:2});
for(const lang of ['it','en']){
  const {out,s}=COPY[lang]; mkdirSync(out,{recursive:true});
  for(let i=0;i<CAP.length;i++){
    const key=CAP[i][0]; const [head,sub]=s[i];
    const b=readFileSync(resolve(CAND,`mk/${lang}-${key}.png`)).toString('base64');
    const html=`<!doctype html><meta charset=utf-8><style>
     *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
     body{width:645px;height:1398px;overflow:hidden;font-family:-apple-system,system-ui,sans-serif;
       background:linear-gradient(165deg,#eaf7e1 0%,#d6f3d0 45%,#bfe9b8 100%);display:flex;flex-direction:column;align-items:center}
     .head{padding:64px 56px 0;text-align:center}
     h1{font-size:50px;font-weight:850;line-height:1.05;color:#1f3d1a;letter-spacing:-1px;white-space:pre-line}
     p{font-size:23px;font-weight:600;color:#3c6b33;margin-top:16px}
     .ph{margin-top:46px;width:330px;border-radius:46px;overflow:hidden;box-shadow:0 30px 70px rgba(31,61,26,.30);border:7px solid #15331a}
     .ph img{width:100%;display:block}
    </style><body><div class=head><h1>${head}</h1><p>${sub}</p></div><div class=ph><img src="data:image/png;base64,${b}"/></div></body>`;
    await comp.setContent(html,{waitUntil:'load'});await sleep(220);
    await comp.screenshot({path:resolve(out,`0${i+1}.png`)});
  }
  console.log('slides',lang,'→',out);
}
await br.close();console.log('done');
