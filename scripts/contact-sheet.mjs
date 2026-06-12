import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, '../store/candy');
const LABELS = { '01-home':'Home','02-habits':'Abitudini','03-activity':'Attività','04-journal':'Diario','05-notes':'Note','06-projects':'Progetti','07-goals':'Obiettivi','07-stella':'Assistente','08-weight':'Peso','09-finances':'Finanze','10-more':'Altro','11-rewards':'Premi','12-recap':'Recap' };
const br = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
async function sheet(theme,bg,ink){
  const files = readdirSync(DIR).filter(f=>f.startsWith(theme+'-')&&f.endsWith('.png')&&!f.startsWith('_')).sort();
  const cards = files.map(f=>{
    const b=readFileSync(resolve(DIR,f)).toString('base64');
    const key=f.replace(theme+'-','').replace('.png','');
    const label=LABELS[key]||key;
    return `<figure><img src="data:image/png;base64,${b}"/><figcaption>${label}</figcaption></figure>`;
  }).join('');
  const html=`<!doctype html><meta charset=utf-8><style>
    *{margin:0;box-sizing:border-box}
    body{background:${bg};font-family:-apple-system,system-ui,sans-serif;padding:40px}
    h1{color:${ink};font-size:34px;font-weight:800;margin:0 0 28px;letter-spacing:-.5px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}
    figure{display:flex;flex-direction:column;align-items:center;gap:12px}
    img{width:100%;border-radius:26px;box-shadow:0 14px 40px rgba(40,25,10,.18)}
    figcaption{font-size:21px;font-weight:700;color:${ink}}
  </style><body><h1>Vyta — ${theme==='light'?'Tema chiaro':'Tema scuro'}</h1><div class=grid>${cards}</div></body>`;
  const p=await br.newPage();
  await p.setViewport({width:1640,height:1000,deviceScaleFactor:2});
  await p.setContent(html,{waitUntil:'networkidle0'});
  await p.screenshot({path:resolve(DIR,`_sheet-${theme}.png`),fullPage:true});
  console.log('sheet',theme); await p.close();
}
await sheet('light','#f8f1e6','#2a2018');
await sheet('dark','#16130f','#f6f1e9');
await br.close();
