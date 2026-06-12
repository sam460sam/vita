import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
mkdirSync('store/widgets',{recursive:true});
const v = readFileSync('public/vyta-v.png').toString('base64');
// habit heatmap (7x7) random-ish
function heat(color,seed){let s='<div style="display:flex;gap:3px">';for(let w=0;w<7;w++){s+='<div style="display:flex;flex-direction:column;gap:3px">';for(let d=0;d<7;d++){const r=((w*7+d+seed)*2654435761>>>0)%10;const st=r<2?0:r<4?1:2;const bg=st===2?color:st===1?color+'44':'rgba(120,120,120,.16)';s+=`<div style="width:11px;height:11px;border-radius:2px;background:${bg}"></div>`;}s+='</div>';}s+='</div>';return s;}
const droplet=(f)=>`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${f?'#0EA5E9':'none'}" stroke="${f?'none':'rgba(14,165,233,.45)'}" stroke-width="1.6">${f?'<path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/>':'<path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/>'}</svg>`;
const dropIcon='<svg viewBox="0 0 24 24" width="16" height="16" fill="#0EA5E9"><path d="M12 2C8 8 5 11.5 5 15a7 7 0 0 0 14 0c0-3.5-3-7-7-13z"/></svg>';
const flame='<svg viewBox="0 0 24 24" width="14" height="14" fill="#16a34a"><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1 1-2 1-2s-3 1-3 5a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>';
// water drops with + on empty
function drops(total,done,cols,gap){let s=`<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap}px;margin-top:6px">`;for(let i=0;i<total;i++){const f=i<done;s+=`<div style="aspect-ratio:1;position:relative">${droplet(f)}${f?'':'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#0EA5E9;font-weight:800;font-size:13px">+</span>'}</div>`;}s+='</div>';return s;}
// weekly tracker
const HABITS=[['Sveglia 5:00','#f59e0b',[2,2,0,2,2,2,2]],['Doccia fredda','#0EA5E9',[2,0,2,2,2,2,2]],['Corsa','#16a34a',[2,2,0,2,2,2,2]],['Leggere','#8b5cf6',[2,0,0,2,2,2,2]]];
function circle(st,c){const bg=st===2?c:st===1?c+'29':'rgba(120,120,120,.16)';return `<div style="width:22px;height:22px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">${st===2?'<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>':''}</div>`;}
function tracker(){const days=['L','M','M','G','V','S','D'];let h=`<div style="display:flex;align-items:center"><div style="width:92px;font-size:11px;font-weight:800;color:#8a857c">9 – 15 Giu</div>${days.map(d=>`<div style="flex:1;text-align:center;font-size:10px;font-weight:800;color:#8a857c">${d}</div>`).join('')}</div>`;for(const [n,c,wk] of HABITS){h+=`<div style="display:flex;align-items:center;margin-top:8px"><div style="width:92px;display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:${c}"></span><span style="font-size:12.5px;color:#2a2018;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</span></div>${wk.map(s=>`<div style="flex:1;display:flex;justify-content:center">${circle(s,c)}</div>`).join('')}</div>`;}return h;}
const html=`<!doctype html><meta charset=utf-8><style>
 *{margin:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;font-family:-apple-system,system-ui,sans-serif}
 body{width:440px;height:1040px;overflow:hidden;position:relative;background:radial-gradient(120% 80% at 50% 0%,#56c97e 0%,#1ba14d 45%,#0c7e3c 100%)}
 .bar{height:50px;display:flex;align-items:center;justify-content:space-between;padding:14px 28px 0;color:#fff}
 .bar .t{font-weight:700;font-size:16px} .bar .r{font-size:13px;font-weight:700}
 .grid{padding:6px 22px;display:flex;flex-direction:column;gap:20px}
 .rowsmall{display:flex;gap:20px}
 .w{background:#f8f1e6;border-radius:26px;box-shadow:0 12px 30px rgba(6,50,24,.30);color:#2a2018;overflow:hidden}
 .small{width:186px;height:186px;padding:15px;display:flex;flex-direction:column}
 .medium{padding:16px;display:flex;flex-direction:column}
 .cap{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#7c7263}
 .cnt{margin-left:auto;color:#0EA5E9}
 .btns{margin-top:auto;display:flex;gap:8px;padding-top:8px}
 .btn{flex:1;background:#0EA5E9;color:#fff;font-weight:800;font-size:12.5px;border-radius:999px;height:32px;display:flex;align-items:center;justify-content:center;gap:4px}
 .hname{font-size:13px;font-weight:800;color:#2a2018}
 .dock{position:absolute;bottom:20px;left:22px;right:22px;height:88px;border-radius:32px;background:rgba(255,255,255,.22);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-around;padding:0 18px}
 .ic{width:58px;height:58px;border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.18)} .ic img{width:40px} .ic.g{background:linear-gradient(160deg,#34c265,#0c7d39)}
</style><body>
 <div class=bar><span class=t>9:41</span><span class=r>●●●● 5G ▮▮</span></div>
 <div class=grid>
   <!-- habit heatmaps (small) -->
   <div class=rowsmall>
     <div class="w small"><div style="display:flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:50%;background:#16a34a"></span><span class=hname>Corsa</span></div><div style="margin-top:auto">${heat('#16a34a',3)}</div></div>
     <div class="w small"><div style="display:flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:50%;background:#8b5cf6"></span><span class=hname>Meditazione</span></div><div style="margin-top:auto">${heat('#8b5cf6',7)}</div></div>
   </div>
   <!-- weekly tracker (medium) -->
   <div class="w medium">${tracker()}</div>
   <!-- water large interactive -->
   <div class="w medium"><div class=cap>${dropIcon} Acqua <span class=cnt>5/10</span></div>${drops(10,5,5,8)}<div class=btns><div class=btn>＋ 1 L</div></div></div>
 </div>
 <div class=dock><div class="ic g"><img src="data:image/png;base64,${v}"/></div><div class=ic style="background:#34c759"></div><div class=ic style="background:#0EA5E9"></div><div class=ic style="background:#ff9500"></div></div>
</body>`;
const br=await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await br.newPage(); await p.setViewport({width:440,height:1040,deviceScaleFactor:2.5});
await p.setContent(html,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,300));
await p.screenshot({path:'store/widgets/home-mock.png'});
await br.close(); console.log('ok');
