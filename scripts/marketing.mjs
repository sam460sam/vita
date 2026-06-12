import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const DIR = resolve('store/candy'); const OUT = resolve('store/marketing'); mkdirSync(OUT,{recursive:true});
const SLIDES = [
  ['light-01-home.png','Tutta la tua vita,\nin un posto','Salute, abitudini, note e momentum'],
  ['light-02-habits.png','Abitudini\nche durano','Streak e progressi, giorno per giorno'],
  ['light-05-notes.png','Note con\nchecklist','Idee e liste, sempre con te'],
  ['light-03-activity.png','Connessa ad\nApple Salute','Allenamenti e anelli attività'],
  ['light-12-recap.png','Il tuo\nmomentum','Un riepilogo che ti motiva'],
];
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:645,height:1398,deviceScaleFactor:2});
let i=0;
for(const [file,head,sub] of SLIDES){
  i++;
  const b=readFileSync(resolve(DIR,file)).toString('base64');
  const html=`<!doctype html><meta charset=utf-8><style>
   *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
   body{width:645px;height:1398px;overflow:hidden;font-family:-apple-system,system-ui,sans-serif;
     background:linear-gradient(165deg,#eaf7e1 0%,#d6f3d0 45%,#bfe9b8 100%);display:flex;flex-direction:column;align-items:center}
   .head{padding:64px 56px 0;text-align:center}
   h1{font-size:50px;font-weight:850;line-height:1.05;color:#1f3d1a;letter-spacing:-1px;white-space:pre-line}
   p{font-size:23px;font-weight:600;color:#3c6b33;margin-top:16px}
   .ph{margin-top:46px;width:330px;border-radius:46px;overflow:hidden;
     box-shadow:0 30px 70px rgba(31,61,26,.30);border:7px solid #15331a}
   .ph img{width:100%;display:block}
  </style><body>
   <div class=head><h1>${head}</h1><p>${sub}</p></div>
   <div class=ph><img src="data:image/png;base64,${b}"/></div>
  </body>`;
  await p.setContent(html,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,250));await p.screenshot({path:resolve(OUT,`0${i}.png`)});
  console.log('slide',i,file);
}
await br.close(); console.log('done →',OUT);
