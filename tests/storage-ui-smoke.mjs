import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { storageFixture } from './helpers/storage-fixtures.mjs';

// This smoke test serves only disposable fixtures and blocks all remote origins.
const browserPath = process.env.GALLERY_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = await mkdtemp(join(tmpdir(), 'storage-smoke-'));
let mode = 'complete';
let responseDelay = 0;
const requests = [];
const apiServer = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  requests.push({ method: req.method, path: req.url, token: req.headers.authorization });
  const json = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
  if (req.url === '/auth/me') return json({ id: 1, email: 'storage@example.invalid', firstName: 'Storage', lastName: 'Admin', role: 'ADMIN' });
  if (req.url === '/admin/storage/stats') {
    const currentMode = mode;
    await new Promise(resolve => setTimeout(resolve, responseDelay));
    if (currentMode.startsWith('http')) return json({ message: 'Internal failure /srv/private/uploads' }, Number(currentMode.slice(4)));
    if (currentMode === 'malformed') return json({ status: 'ok', total: { files: 0, bytes: 0 }, serverPath: '/srv/private/uploads' });
    return json(storageFixture(currentMode));
  }
  if (req.url === '/admin/gallery') return json([]);
  if (req.url === '/admin/gallery/operations') return json([]);
  if (req.url?.includes('unread-count')) return json({ count: 0 });
  if (req.url?.includes('notification')) return json({ items: [], unreadCount: 0 });
  return json({});
});
await new Promise(resolve => apiServer.listen(0, '127.0.0.1', resolve));
const apiOrigin = `http://127.0.0.1:${apiServer.address().port}`;
const distRoot = resolve('dist');
const staticServer = createServer(async (req, res) => {
  try {
    let filename = resolve(distRoot, `.${new URL(req.url, 'http://local').pathname}`);
    if (filename !== distRoot && !filename.startsWith(distRoot + sep)) throw new Error('Invalid path');
    if (!extname(filename)) filename = join(distRoot, 'index.html');
    let data = await readFile(filename);
    if (extname(filename) === '.js') data = Buffer.from(data.toString().replaceAll('https://api.waterfallpartykohphangan.com', apiOrigin));
    const contentTypes = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg' };
    res.writeHead(200, { 'Content-Type': contentTypes[extname(filename)] || 'application/octet-stream' }); res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => staticServer.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${staticServer.address().port}`;
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
let id = 0;
const pending = new Map();
const browserErrors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(fn, label) {
  for (let i = 0; i < 100; i++) { try { if (await fn()) return; } catch { /* wait for browser state */ } await delay(100); }
  console.error('Browser state:', await evaluate(`({url: location.href, text: document.body.innerText.slice(0, 2000)})`).catch(() => null));
  throw new Error(`Timed out: ${label}`);
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject, method }); ws.send(JSON.stringify({ id: requestId, method, params })); });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
try {
  let port;
  await waitFor(async () => { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; return port; }, 'Edge debug port');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) { const request = pending.get(message.id); pending.delete(message.id); if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      const allowed = [origin, apiOrigin].includes(new URL(request.url).origin);
      void send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', { requestId, ...(allowed ? {} : { errorReason: 'BlockedByClient' }) }).catch(() => {});
    }
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('waterfall_access_token','storage-browser-token'); localStorage.setItem('waterfall-admin-theme','light');` });
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${origin}/admin/storage` });
  await waitFor(() => evaluate(`document.querySelectorAll('.admin-storage__card').length === 4`), 'storage route');
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.admin-storage__card-value')].map(element=>element.textContent)`), ['3','2','4','16 MB']);
  assert.equal(await evaluate(`document.querySelector('.admin-nav a[href="/admin/storage"]').getAttribute('aria-current')`), 'page');
  assert.equal(await evaluate(`document.querySelector('.admin-storage time').getAttribute('datetime')`), '2026-10-15T10:00:01.000Z');
  assert.equal(requests.find(request => request.path === '/admin/storage/stats').token, 'Bearer storage-browser-token');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__segments').getAttribute('aria-label').includes('75%')`), true);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.admin-storage__segment')].map(segment=>parseFloat(segment.style.width))`), [18.75,75,6.25]);
  assert.equal(await evaluate(`document.querySelector('.admin-storage__estimator').textContent.includes('Hosting capacity not connected') && document.querySelector('.admin-storage__estimate').textContent.includes('No estimate yet')`), true);
  async function setSpace(value) {
    await evaluate(`(() => { const input=document.querySelector('.admin-storage__simulation input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)}); input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  }
  await setSpace('1');
  await waitFor(() => evaluate(`document.querySelector('.admin-storage__estimate strong')?.textContent.replace(/[^0-9]/g,'') === '1000'`), 'hypothetical 1GB simulation');
  await evaluate(`document.querySelector('.admin-storage__estimator select').value='5'; document.querySelector('.admin-storage__estimator select').dispatchEvent(new Event('change',{bubbles:true}))`);
  await waitFor(() => evaluate(`document.querySelector('.admin-storage__estimate strong')?.textContent === '200'`), 'average image assumption updates simulation');
  await setSpace('0');
  await waitFor(() => evaluate(`document.querySelector('.admin-storage__estimate strong')?.textContent === '0'`), 'zero hypothetical free space');
  await setSpace('-1');
  await waitFor(() => evaluate(`document.querySelector('.admin-storage__input-error') !== null && document.querySelector('.admin-storage__simulation input').getAttribute('aria-invalid') === 'true'`), 'invalid hypothetical space');
  await setSpace('');
  await waitFor(() => evaluate(`document.querySelector('.admin-storage__estimate').textContent.includes('No estimate yet')`), 'cleared simulation');

  const storageCalls = () => requests.filter(request => request.path === '/admin/storage/stats').length;
  const before = storageCalls(); responseDelay = 200;
  await evaluate(`document.querySelector('.admin-storage__refresh').click(); document.querySelector('.admin-storage__refresh').click()`);
  assert.equal(await evaluate(`document.querySelector('.admin-storage__refresh').disabled`), true);
  await waitFor(() => evaluate(`!document.querySelector('.admin-storage__refresh').disabled`), 'manual refresh completed');
  assert.equal(storageCalls(), before + 1, 'rapid refresh sends only one request'); responseDelay = 0;
  for (const [width, columns] of [[320,2], [375,2], [768,2], [1365,4]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.admin-storage__overview')).gridTemplateColumns.split(' ').length`), columns);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= ${width}`), true, `no overflow at ${width}px`);
    assert.equal(await evaluate(`[...document.querySelectorAll('.admin-storage__card, .admin-storage__panel')].every(panel => { const bounds=panel.getBoundingClientRect(); return bounds.left >= 0 && bounds.right <= innerWidth; })`), true, `storage panels stay within ${width}px viewport`);
  }
  async function refreshScenario(next, expected) {
    mode = next;
    await evaluate(`document.querySelector('.admin-storage__refresh').click()`);
    await waitFor(() => evaluate(`!document.querySelector('.admin-storage__refresh').disabled && document.querySelector('.admin-storage').textContent.includes(${JSON.stringify(expected)})`), next);
  }
  await refreshScenario('partial', 'Measurement incomplete');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__card--total .admin-storage__card-value').textContent`), 'Not available');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__empty') === null`), true, 'partial is not empty');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__segments') === null && document.querySelector('.admin-storage__chart-unavailable') !== null`), true, 'partial results never invent percentages');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__alert').textContent.includes('directory does not exist')`), true);
  await refreshScenario('unavailable', 'Measurement unavailable');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__card-value').textContent`), 'Not measured');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__empty') === null`), true, 'unreadable is not empty');
  await refreshScenario('empty', 'No supported local media files found');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__card--total .admin-storage__card-value').textContent`), '0 B');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__segments').textContent.includes('NaN')`), false);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.admin-storage__segment')].map(segment=>segment.style.width)`), ['0%','0%','0%']);
  await refreshScenario('zeroByteOnly', 'Measured files contain no bytes');
  assert.equal(await evaluate(`document.querySelector('.admin-storage__empty') === null`), true, 'a measured zero-byte file is not an empty directory');
  await refreshScenario('warning', 'Measurement notes');
  await refreshScenario('http500', 'Showing the last successful response');
  assert.equal(await evaluate(`document.body.textContent.includes('/srv/private')`), false);
  await refreshScenario('malformed', 'could not be loaded or validated');
  for (const [status, text] of [[401,'Your session has expired'],[403,'does not have permission'],[404,'not available on the configured API']]) {
    await refreshScenario(`http${status}`, text);
    assert.equal(await evaluate(`document.querySelector('.admin-storage__overview') === null`), true);
  }
  await refreshScenario('complete', 'Measurement complete');
  await evaluate(`document.querySelector('.admin-mobile-menu-button').click()`);
  await evaluate(`document.querySelector('.admin-nav a[href="/admin/gallery"]').click()`);
  await waitFor(() => evaluate(`location.pathname === '/admin/gallery' && document.querySelector('.admin-gallery') !== null`), 'existing admin gallery navigation');
  await send('Page.navigate', { url: `${origin}/admin/storage` });
  await waitFor(() => evaluate(`document.querySelectorAll('.admin-storage__card').length === 4`), 'storage route after gallery navigation');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 1000, deviceScaleFactor: 1, mobile: true });
  await evaluate(`document.querySelector('.admin-sidebar-close').click()`);
  await send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
  await delay(350);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.admin-storage__insights')).gridTemplateColumns.split(' ').length`), 1, 'mobile panels use a single column');

  if (process.env.STORAGE_MOBILE_SCREENSHOT) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.STORAGE_MOBILE_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
  if (process.env.STORAGE_SCREENSHOT) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.STORAGE_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  const lightSurface = await evaluate(`getComputedStyle(document.querySelector('.admin-storage__card')).backgroundColor`);
  await evaluate(`document.querySelector('[aria-label="Switch to dark mode"]').click()`);
  await waitFor(() => evaluate(`document.documentElement.dataset.adminTheme === 'dark'`), 'existing admin dark theme');
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('.admin-storage__card')).backgroundColor`), lightSurface);
  if (process.env.STORAGE_DARK_SCREENSHOT) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.STORAGE_DARK_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  const noPollingCount = storageCalls(); await delay(250);
  assert.equal(storageCalls(), noPollingCount, 'the page does not poll automatically');
  await evaluate(`localStorage.removeItem('waterfall_access_token'); document.querySelector('.admin-nav a[href="/admin/gallery"]').click()`);
  await waitFor(() => evaluate(`location.pathname === '/admin/login'`), 'existing auth protection when session is removed');
  assert.deepEqual(browserErrors, []);
  assert.equal(requests.some(request => !['GET','OPTIONS'].includes(request.method)), false);
  console.log('Storage browser smoke passed: protected route/navigation, bearer auth, real contract fixtures, refresh locking, partial/unavailable/empty states, safe errors, correct complete-only percentages, hypothetical capacity calculations, 2/4-card layouts, and existing gallery navigation. Real API requests: 0.');
} finally {
  if (ws?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch { /* browser can close before replying */ } ws.close(); }
  browser.kill();
  apiServer.closeAllConnections(); apiServer.close(); staticServer.closeAllConnections(); staticServer.close();
  await delay(500);
  if (profile.startsWith(resolve(tmpdir()) + sep) && profile.includes('storage-smoke-')) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
