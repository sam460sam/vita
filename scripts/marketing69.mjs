import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const DIR = resolve('store/candy'); const OUT = resolve('store/marketing69'); mkdirSync(OUT,{recursive:true});
const SLIDES = [
  ['light-01-home.png','Tutta la tua vita,\nin un posto'],
  ['light-02-habits.png','Abitudini\nche durano'],
  ['light-05-notes.png','Note con\nchecklist'],
  ['light-03-activity.png','Connessa ad\nApple Salute'],
  ['light-12-recap.png','Il tuo\nmomentum'],
];
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:660,height:1434,deviceScaleFactor:2}); // → 1320×2868 (6.9")
let i=0;
for(const [file,head] of SLIDES){
  i++;
  const b=readFileSync(resolve(DIR,file)).toString('base64');
  const html=`<!doctype html><meta charset=utf-8><style>
   *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
   body{width:660px;height:1434px;overflow:hidden;font-family:-apple-system,system-ui,sans-serif;
     background:linear-gradient(165deg,#e9f7df 0%,#d3f2cc 48%,#b9e7b1 100%);
     display:flex;flex-direction:column;align-items:center}
   .head{padding:74px 50px 0;text-align:center}
   h1{font-size:70px;font-weight:850;line-height:1.02;color:#1d3a18;letter-spacing:-1.5px;white-space:pre-line}
   .ph{margin-top:50px;width:560px;border-radius:60px;overflow:hidden;
     box-shadow:0 40px 90px rgba(29,58,24,.32);border:9px solid #14311a}
   .ph img{width:100%;display:block}
  </style><body>
   <div class=head><h1>${head}</h1></div>
   <div class=ph><img src="data:image/png;base64,${b}"/></div>
  </body>`;
  await p.setContent(html,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,250));
  await p.screenshot({path:resolve(OUT,`0${i}.png`)});
  console.log('slide',i,file);
}
await br.close(); console.log('done →',OUT);
