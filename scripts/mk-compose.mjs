import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
const CAND=resolve('store/candy/mk');
const CAP=['home','habits','notes','activity','recap'];
const COPY={
  it:{out:resolve('store/mk-it'),s:[['Tutta la tua vita,\nin un posto','Salute, abitudini, note e momentum'],['Abitudini\nche durano','Streak e progressi, giorno per giorno'],['Note con\nchecklist','Idee e liste, sempre con te'],['Connessa ad\nApple Salute','Allenamenti e anelli attività'],['Il tuo\nmomentum','Un riepilogo che ti motiva']]},
  en:{out:resolve('store/mk-en'),s:[['Your whole life,\nin one place','Health, habits, notes & momentum'],['Habits\nthat stick','Streaks and progress, day by day'],['Notes with\nchecklists','Ideas and lists, always with you'],['Connected to\nApple Health','Workouts and activity rings'],['Your\nmomentum','A recap that keeps you going']]},
};
// realistic iOS status bar (cream bg matches the app) + Dynamic Island
const SIGNAL='<svg width="18" height="12" viewBox="0 0 18 12"><g fill="#1c1c1c"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></g></svg>';
const WIFI='<svg width="17" height="12" viewBox="0 0 17 12" fill="#1c1c1c"><path d="M8.5 2.4c2.5 0 4.8 1 6.5 2.5l-1.3 1.4C12.3 5.1 10.5 4.3 8.5 4.3S4.7 5.1 3.3 6.3L2 4.9C3.7 3.4 6 2.4 8.5 2.4zm0 3.5c1.5 0 2.9.6 3.9 1.6l-1.4 1.4c-.7-.6-1.6-1-2.5-1s-1.8.4-2.5 1L4.6 7.5C5.6 6.5 7 5.9 8.5 5.9zm0 3.3c.7 0 1.3.3 1.7.8L8.5 11.6 6.8 10c.4-.5 1-.8 1.7-.8z"/></svg>';
const BATT='<svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.6" y="0.6" width="22" height="11.8" rx="3.2" fill="none" stroke="#1c1c1c" stroke-opacity="0.35" stroke-width="1.2"/><rect x="2.2" y="2.2" width="15.5" height="8.6" rx="2" fill="#1c1c1c"/><path d="M24.3 4.3c.9.3.9 4.1 0 4.4z" fill="#1c1c1c" fill-opacity="0.4"/></svg>';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const comp=await br.newPage(); await comp.setViewport({width:645,height:1398,deviceScaleFactor:2});
for(const lang of ['it','en']){
  const {out,s}=COPY[lang]; mkdirSync(out,{recursive:true});
  for(let i=0;i<CAP.length;i++){
    const [head,sub]=s[i];
    const b=readFileSync(resolve(CAND,`${lang}-${CAP[i]}.png`)).toString('base64');
    const html=`<!doctype html><meta charset=utf-8><style>
     *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
     body{width:645px;height:1398px;overflow:hidden;font-family:-apple-system,system-ui,sans-serif;
       background:linear-gradient(165deg,#eaf7e1 0%,#d6f3d0 45%,#bfe9b8 100%);
       display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px}
     .head{padding:0 50px;text-align:center}
     h1{font-size:52px;font-weight:850;line-height:1.05;color:#1f3d1a;letter-spacing:-1px;white-space:pre-line}
     p{font-size:24px;font-weight:600;color:#3c6b33;margin-top:16px}
     .phone{width:352px;border-radius:52px;overflow:hidden;background:#f8f1e6;
       border:9px solid #11140f;box-shadow:0 34px 80px rgba(20,30,16,.34)}
     .bar{height:42px;position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 30px}
     .bar .t{font-size:16px;font-weight:700;color:#1c1c1c;letter-spacing:.2px}
     .bar .r{display:flex;align-items:center;gap:7px}
     .island{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:92px;height:26px;background:#000;border-radius:14px}
     .screen img{width:100%;display:block;margin-top:-2px}
    </style><body>
      <div class=head><h1>${head}</h1><p>${sub}</p></div>
      <div class=phone>
        <div class=bar><span class=t>9:41</span><div class=island></div><span class=r>${SIGNAL}${WIFI}${BATT}</span></div>
        <div class=screen><img src="data:image/png;base64,${b}"/></div>
      </div>
    </body>`;
    await comp.setContent(html,{waitUntil:'load'});await sleep(220);
    await comp.screenshot({path:resolve(out,`0${i+1}.png`)});
  }
  console.log('done',lang);
}
await br.close();
