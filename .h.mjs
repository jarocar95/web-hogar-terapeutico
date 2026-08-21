import { chromium } from '@playwright/test';
const OUT='/private/tmp/claude-501/-Users-javier-proyectos-web-hogar-terapeutico/99e43d80-1be8-4682-b746-baf8d438bf41/scratchpad';
const b=await chromium.launch(); const errs=[];
const p=await b.newPage({viewport:{width:390,height:800}});
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('C: '+m.text())});
await p.goto('http://localhost:8903/',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
await p.evaluate(()=>document.getElementById('cookie-consent-banner')?.remove());

const r1 = await p.evaluate(()=>{
  const dias=[...document.querySelectorAll('#calendar-container .day-item')];
  const disp=dias.filter(d=>d.classList.contains('is-available'));
  const cta=[...document.querySelectorAll('#mobile-menu-fixed a')].pop();
  const cs=cta?getComputedStyle(cta):null;
  return {
    celda: dias[0]?Math.round(dias[0].getBoundingClientRect().width)+'x'+Math.round(dias[0].getBoundingClientRect().height):null,
    diasTabbables: disp.filter(d=>d.getAttribute('tabindex')==='0').length,
    diasDisponibles: disp.length,
    conRole: disp.filter(d=>d.getAttribute('role')==='button').length,
    hint: document.getElementById('calendar-hint')?.textContent || null,
    zonaHoraria: document.querySelector('#booking-calendar h3')?.textContent.includes('peninsular'),
    urgencias: !!document.body.textContent.match(/no es un servicio de urgencias/i),
    menuCta: cs?{align:cs.textAlign, radio:cs.borderRadius, display:cs.display}:null,
    bodyPad: getComputedStyle(document.body).paddingBottom,
  };
});
console.log('ESTADO', JSON.stringify(r1,null,1));

// seleccion vs hover
await p.locator('#booking-calendar').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
const dia = p.locator('#calendar-container .day-item.is-available').first();
await dia.click();
await p.waitForTimeout(900);
const sel = await dia.evaluate(e=>getComputedStyle(e).backgroundColor);
const panelVisible = await p.evaluate(()=>{
  const el=document.getElementById('available-times').getBoundingClientRect();
  return el.top < window.innerHeight && el.bottom > 0;
});
console.log('TRAS TOCAR: fondo', sel, '| panel de horas visible:', panelVisible);

// pie
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(900);
const pie = await p.evaluate(()=>{
  const c=[...document.querySelectorAll('footer span')].find(s=>s.textContent.includes('©'));
  const bar=document.getElementById('mobile-cta-bar');
  return {copyrightBottom:Math.round(c.getBoundingClientRect().bottom),
    barraVisible:bar.classList.contains('is-visible'),
    tapado: bar.classList.contains('is-visible') && c.getBoundingClientRect().bottom > bar.getBoundingClientRect().top};
});
console.log('PIE', JSON.stringify(pie));
await p.screenshot({path:`${OUT}/harden-mob.png`});
console.log('errs:', errs.length?errs:'ninguno');
await b.close();
