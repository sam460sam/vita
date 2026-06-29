import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const BASE='http://localhost:5051/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const CAND=resolve('store/candy/mk'); mkdirSync(CAND,{recursive:true});
const CAP=[['home','#/oggi'],['habits','#/abitudini'],['notes','#/note'],['activity','#/attivita'],['recap','#/recap']];
const NOTES={
  it:[{title:'Spesa settimana',body:'',color:'#10b981',pinned:true,checklist:[['Pane integrale',true],['Avocado',true],['Yogurt greco',false],['Caffè',false]]},
      {title:'Idee app',body:'Widget meteo + frase del giorno sulla lock screen.',color:'#8b5cf6',pinned:true,checklist:[]},
      {title:'Allenamento',body:'',color:'#ff6b57',pinned:false,checklist:[['Riscaldamento',true],['Panca 4x8',false],['Stretching',false]]},
      {title:'Viaggio Lisbona',body:'Volo 14 giu · prova i pastéis de nata!',color:'#e0992f',pinned:false,checklist:[]},
      {title:'Regali',body:'',color:'#ec4899',pinned:false,checklist:[['Mamma',true],['Luca',false],['Sara',false]]},
      {title:'Libri da leggere',body:'',color:'#0ea5e9',pinned:false,checklist:[['Atomic Habits',true],['Dune',false],['Sapiens',false]]},
      {title:'Lavoro: priorità',body:'',color:'#4f46e5',pinned:false,checklist:[['Mail clienti',true],['Report mensile',false]]},
      {title:'Ricetta torta',body:'200g farina, 3 uova, 150g zucchero, 1 limone.',color:'#f59e0b',pinned:false,checklist:[]},
      {title:'Film da vedere',body:'',color:'#16a34a',pinned:false,checklist:[['Inception',true],['Interstellar',false]]}],
  en:[{title:'Weekly groceries',body:'',color:'#10b981',pinned:true,checklist:[['Wholegrain bread',true],['Avocado',true],['Greek yogurt',false],['Coffee',false]]},
      {title:'App ideas',body:'Weather widget + quote of the day on the lock screen.',color:'#8b5cf6',pinned:true,checklist:[]},
      {title:'Workout',body:'',color:'#ff6b57',pinned:false,checklist:[['Warm-up',true],['Bench 4x8',false],['Stretching',false]]},
      {title:'Lisbon trip',body:'Flight Jun 14 · try the pastéis de nata!',color:'#e0992f',pinned:false,checklist:[]},
      {title:'Gifts',body:'',color:'#ec4899',pinned:false,checklist:[['Mom',true],['Luke',false],['Sara',false]]},
      {title:'Books to read',body:'',color:'#0ea5e9',pinned:false,checklist:[['Atomic Habits',true],['Dune',false],['Sapiens',false]]},
      {title:'Work: priorities',body:'',color:'#4f46e5',pinned:false,checklist:[['Client emails',true],['Monthly report',false]]},
      {title:'Cake recipe',body:'200g flour, 3 eggs, 150g sugar, 1 lemon.',color:'#f59e0b',pinned:false,checklist:[]},
      {title:'Films to watch',body:'',color:'#16a34a',pinned:false,checklist:[['Inception',true],['Interstellar',false]]}],
};
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:390,height:844,deviceScaleFactor:3});
p.on('dialog',async d=>{try{await d.accept()}catch{}});
for(const lang of ['it','en']){
  await p.goto(BASE,{waitUntil:'networkidle2'});
  await p.evaluate(l=>{localStorage.setItem('vita.onboarded','1');localStorage.setItem('vita.theme','light');localStorage.setItem('vita.lang',l);localStorage.setItem('vita.dailywin.shown',new Date().toISOString().slice(0,10));localStorage.setItem('vita.backup.lastAt',String(Date.now()));},lang);
  await p.goto(BASE,{waitUntil:'networkidle2'});await sleep(800);
  // seed demo (button text contains 'demo' in both langs)
  await p.evaluate(()=>{location.hash='#/impostazioni';});await sleep(1200);
  await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.toLowerCase().includes('demo'));if(b)b.click();});
  await sleep(6500);
  // seed notes for this language
  await p.evaluate(async(NL)=>{const req=indexedDB.open('vita');const db=await new Promise(r=>{req.onsuccess=()=>r(req.result)});if(![...db.objectStoreNames].includes('notes'))return;const now=Date.now();const uid=p=>p+Math.random().toString(36).slice(2,10);const rows=NL.map((n,i)=>({id:uid('not_'),title:n.title,body:n.body,color:n.color,pinned:n.pinned,checklist:n.checklist.map(([text,done])=>({id:uid('chk_'),text,done})),createdAt:now-i*1000,updatedAt:now-i*1000}));await new Promise((res,rej)=>{const tx=db.transaction('notes','readwrite');rows.forEach(r=>tx.objectStore('notes').put(r));tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});},NOTES[lang]);
  await sleep(600);
  for(const [key,hash] of CAP){
    await p.evaluate(h=>{location.hash=h;window.scrollTo(0,0);},hash);await sleep(1600);
    await p.evaluate(()=>{const r=document.querySelector('#root');if(r)r.scrollTo(0,0);});await sleep(300);
    await p.screenshot({path:resolve(CAND,`${lang}-${key}.png`)});
  }
  console.log('captured',lang);
}
await br.close();console.log('done');
