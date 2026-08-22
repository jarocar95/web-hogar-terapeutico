import { chromium } from '@playwright/test';
const OUT = '/private/tmp/claude-501/-Users-javier-proyectos-web-hogar-terapeutico/99e43d80-1be8-4682-b746-baf8d438bf41/scratchpad/shots';
const b = await chromium.launch();

async function run(name, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8911/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  // dismiss nothing; capture cookie banner state first
  await p.screenshot({ path: `${OUT}/${name}-00-fold.png` });
  // measure section offsets
  const secs = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('main > section, main > div').forEach((s, i) => {
      const r = s.getBoundingClientRect();
      out.push({ i, tag: s.tagName, id: s.id || null, cls: (s.className||'').toString().slice(0,60), top: Math.round(r.top + scrollY), h: Math.round(r.height) });
    });
    return { secs: out, docH: document.body.scrollHeight };
  });
  console.log(name, JSON.stringify(secs, null, 1));
  // full page in slices
  const total = secs.docH;
  let y = 0, n = 1;
  while (y < total && n < 20) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${name}-${String(n).padStart(2,'0')}.png` });
    y += h; n++;
  }
  await ctx.close();
}
await run('d', 1440, 900);
await run('m', 390, 844);
await b.close();
