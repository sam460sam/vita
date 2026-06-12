import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
mkdirSync('store/widgets',{recursive:true});
const v = readFileSync('public/vyta-v.png').toString('base64');
const REM=[['08:00','Acqua'],['09:00','Frase del giorno'],['13:00','Allenamento'],['18:00','Diario'],['21:00','Peso']];
const TODO=['Chiamare il traslocatore','Pubblicare in produzione','Prenotare dentista','Comprare lampade','Esercizi TypeScript'];
const remRows=(n)=>REM.slice(0,n).map(([t,l])=>`<div class=row><span class=pill>${t}</span><span class=l>${l}</span></div>`).join('');
const todoRows=(n)=>TODO.slice(0,n).map(t=>`<div class=row><span class=circ></span><span class=l>${t}</span></div>`).join('');
// droplet svg, fill param
const droplet=(f)=>`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${f?'#0EA5E9':'rgba(14,165,233,.3)'}"><path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/></svg>`;
const bell='<svg viewBox="0 0 24 24" width="16" height="16" fill="#16a34a"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-5v-1l-1.6-1.6V10a5.4 5.4 0 0 0-4-5.2V4a1.4 1.4 0 0 0-2.8 0v.8A5.4 5.4 0 0 0 6.6 10v3.4L5 15v2z"/></svg>';
const check='<svg viewBox="0 0 24 24" width="16" height="16" fill="#16a34a"><path d="M3 6h11v2H3zm0 5h11v2H3zm0 5h7v2H3zm15.5-9L20 7l-5.5 5.5L11 9l1.5-1.5 2 2z"/></svg>';
const dropIcon='<svg viewBox="0 0 24 24" width="16" height="16" fill="#0EA5E9"><path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/></svg>';
// water drops grid: total, done
function drops(total,done,cols,gap){let s=`<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}px;margin-top:6px">`;for(let i=0;i<total;i++){s+=`<div style="aspect-ratio:1">${droplet(i<done)}</div>`;}s+='</div>';return s;}
const html=`<!doctype html><meta charset=utf-8><style>
 *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;font-family:-apple-system,system-ui,sans-serif}
 body{width:440px;height:980px;overflow:hidden;position:relative;background:radial-gradient(120% 80% at 50% 0%,#56c97e 0%,#1ba14d 45%,#0c7e3c 100%)}
 .bar{height:50px;display:flex;align-items:center;justify-content:space-between;padding:14px 28px 0;color:#fff}
 .bar .t{font-weight:700;font-size:16px} .bar .r{font-size:13px;font-weight:700}
 .grid{padding:6px 22px;display:flex;flex-direction:column;gap:20px}
 .rowsmall{display:flex;gap:20px}
 .w{background:#f8f1e6;border-radius:26px;box-shadow:0 12px 30px rgba(6,50,24,.30);color:#2a2018;overflow:hidden}
 .small{width:186px;height:186px;padding:15px;display:flex;flex-direction:column}
 .medium{height:186px;padding:16px;display:flex;flex-direction:column} .large{height:300px;padding:18px;display:flex;flex-direction:column}
 .cap{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#7c7263}
 .cnt{margin-left:auto;color:#0EA5E9}
 .btns{margin-top:auto;display:flex;gap:8px;padding-top:8px}
 .btn{flex:1;background:#0EA5E9;color:#fff;font-weight:800;font-size:12.5px;border-radius:999px;height:32px;display:flex;align-items:center;justify-content:center;gap:4px}
 .row{display:flex;align-items:center;gap:8px;padding:4px 0}
 .pill{font-size:12px;font-weight:800;color:#16a34a;background:rgba(22,163,74,.14);padding:2px 7px;border-radius:999px}
 .circ{width:15px;height:15px;border-radius:50%;border:2px solid #16a34a;flex-shrink:0}
 .l{font-size:13px;color:#2a2018;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .tag{position:absolute;top:9px;right:14px;font-size:10px;font-weight:800;color:#fff;background:rgba(0,0,0,.28);padding:3px 9px;border-radius:999px}
 .wrap{position:relative}
 .dock{position:absolute;bottom:20px;left:22px;right:22px;height:88px;border-radius:32px;background:rgba(255,255,255,.22);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-around;padding:0 18px}
 .ic{width:58px;height:58px;border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.18)} .ic img{width:40px} .ic.g{background:linear-gradient(160deg,#34c265,#0c7d39)}
</style><body>
 <div class=bar><span class=t>9:41</span><span class=r>●●●● 5G ▮▮</span></div>
 <div class=grid>
   <div class="w medium"><div class=cap>${dropIcon} Acqua <span class=cnt>5/10</span></div>${drops(10,5,8,7)}<div class=btns><div class=btn>＋ Bicchiere</div><div class=btn>＋ 1 L</div></div></div>
   <div class=rowsmall>
     <div class="w small"><div class=cap>${dropIcon} Acqua <span class=cnt>5/10</span></div>${drops(8,5,4,6)}<div class=btns><div class=btn>＋ Bicchiere</div></div></div>
     <div class="wrap" style="width:186px"><div class="w small"><div class=cap>${check} To-Do</div><div style="margin-top:5px">${todoRows(3)}</div></div><span class=tag>To-Do</span></div>
   </div>
   <div class=rowsmall>
     <div class="wrap" style="flex:1"><div class="w large" style="height:248px"><div class=cap>${bell} Promemoria</div><div style="margin-top:6px">${remRows(5)}</div></div><span class=tag>Oggi</span></div>
   </div>
 </div>
 <div class=dock><div class="ic g"><img src="data:image/png;base64,${v}"/></div><div class=ic style="background:#34c759"></div><div class=ic style="background:#0EA5E9"></div><div class=ic style="background:#ff9500"></div></div>
</body>`;
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:440,height:980,deviceScaleFactor:2.5});
await p.setContent(html,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,300));
await p.screenshot({path:'store/widgets/home-mock.png'});
await br.close(); console.log('ok');
