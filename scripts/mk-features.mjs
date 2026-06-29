import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const COPY={
  it:{out:resolve('store/mk-it'),title:'Tutto in una\nsola app',sub:'Le tue giornate, organizzate',
    f:[['🔥','#16a34a','Abitudini & streak','Costruisci routine che durano'],
       ['❤️','#ff6b4a','Salute','Sincronizza con Apple Salute'],
       ['📝','#e0992f','Note con checklist','Idee e liste sempre con te'],
       ['📖','#f59e0b','Diario & umore','Racconta la tua giornata'],
       ['⚡','#5b6cf0','Momentum','Il tuo punteggio giornaliero'],
       ['🔔','#9b5de5','Promemoria intelligenti','Ti avvisiamo al momento giusto']]},
  en:{out:resolve('store/mk-en'),title:'Everything in\none app',sub:'Your days, organized',
    f:[['🔥','#16a34a','Habits & streaks','Build routines that last'],
       ['❤️','#ff6b4a','Health','Sync with Apple Health'],
       ['📝','#e0992f','Notes with checklists','Ideas and lists, always with you'],
       ['📖','#f59e0b','Journal & mood','Capture your day'],
       ['⚡','#5b6cf0','Momentum','Your daily score'],
       ['🔔','#9b5de5','Smart reminders','We nudge you at the right time']]},
};
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:645,height:1398,deviceScaleFactor:2});
for(const lang of ['it','en']){
  const {out,title,sub,f}=COPY[lang]; mkdirSync(out,{recursive:true});
  const cards=f.map(([emo,col,label,desc])=>`<div class=card>
      <span class=chip style="background:${col}1f;color:${col}">${emo}</span>
      <div class=txt><div class=l>${label}</div><div class=d>${desc}</div></div>
    </div>`).join('');
  const html=`<!doctype html><meta charset=utf-8><style>
   *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
   body{width:645px;height:1398px;overflow:hidden;font-family:-apple-system,system-ui,'Apple Color Emoji',sans-serif;
     background:linear-gradient(160deg,#34c265 0%,#15a046 46%,#0c7d39 100%);
     display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 46px;gap:34px}
   .head{text-align:center}
   h1{font-size:58px;font-weight:850;line-height:1.04;color:#fff;letter-spacing:-1.2px;white-space:pre-line}
   .sub{font-size:25px;font-weight:600;color:rgba(255,255,255,.92);margin-top:14px}
   .list{display:flex;flex-direction:column;gap:16px;width:100%}
   .card{display:flex;align-items:center;gap:18px;background:#fff;border-radius:28px;padding:20px 22px;box-shadow:0 14px 34px rgba(8,60,28,.22)}
   .chip{width:62px;height:62px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0}
   .txt .l{font-size:27px;font-weight:800;color:#1d2b1a;letter-spacing:-.4px}
   .txt .d{font-size:19px;font-weight:500;color:#5a6b54;margin-top:3px}
  </style><body>
   <div class=head><h1>${title}</h1><div class=sub>${sub}</div></div>
   <div class=list>${cards}</div>
  </body>`;
  await p.setContent(html,{waitUntil:'load'});await new Promise(r=>setTimeout(r,300));
  await p.screenshot({path:resolve(out,'06.png')});
  console.log('features',lang);
}
await br.close();
