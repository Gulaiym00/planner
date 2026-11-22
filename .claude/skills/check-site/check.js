// Использование: node check.js <url> [путь-к-скриншоту]
// Печатает JSON с результатами проверки страницы.
const { chromium } = require('playwright');

(async () => {
  let url = process.argv[2];
  if (!url) {
    console.error('Usage: node check.js <url> [screenshot.png]');
    process.exit(2);
  }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const shot = process.argv[3];

  const result = { url, status: null, finalUrl: null, title: null, loadError: null,
    consoleErrors: [], pageErrors: [], failedRequests: [], unlabeled: [], links: [], buttons: [] };

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') result.consoleErrors.push(m.text()); });
  page.on('pageerror', e => result.pageErrors.push(e.message));
  page.on('requestfailed', r => result.failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) result.failedRequests.push(`${r.url()} — HTTP ${r.status()}`); });

  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    result.status = res ? res.status() : null;
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    result.finalUrl = page.url();
    result.title = await page.title();

    const els = await page.$$eval('a, button, [role=button], input[type=submit], input[type=button]', nodes =>
      nodes.map(n => {
        const name = (n.getAttribute('aria-label') || n.innerText || n.value || n.title ||
          n.querySelector('img[alt]')?.alt || '').trim().replace(/\s+/g, ' ');
        return { tag: n.tagName.toLowerCase(), name, href: n.href || null,
          html: n.outerHTML.slice(0, 150) };
      }));
    for (const e of els) {
      if (e.tag === 'a') result.links.push(`${e.name || '(без подписи)'} -> ${e.href}`);
      else result.buttons.push(e.name || '(без подписи)');
      if (!e.name) result.unlabeled.push(e.html);
    }
    if (shot) await page.screenshot({ path: shot, fullPage: true });
  } catch (e) {
    result.loadError = e.message;
  }

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})();
