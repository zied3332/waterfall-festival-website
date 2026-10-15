import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

// Windows Edge smoke test of the production bundle. All API data is disposable.
// Every remote browser request is blocked; the real backend is never contacted.
const browserPath = process.env.GALLERY_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = await mkdtemp(join(tmpdir(), 'gallery-smoke-'));
const operationId = '7358c4c1-4ee7-4cdd-8a83-f10d602bcab8';
const baseItem = { title: 'Test photo', description: '', altText: 'Disposable image', status: 'DRAFT', isFeatured: false, sortOrder: 0, publicId: 'gallery/images/test.webp', thumbnailUrl: null, duration: null, width: null, height: null, showOnHomepage: false, homepageSortOrder: 0, eventId: null, event: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
let items = [1, 2, 3].map(id => ({ ...baseItem, id, title: id === 3 ? 'Test video' : `Test photo ${id}`, mediaType: id === 3 ? 'VIDEO' : 'IMAGE', imageUrl: id === 2 ? '/uploads/missing.webp' : '/uploads/photo.svg' }));
let contractAvailable = false;
let failDelete = true;
let deleteCalls = 0;
let lastPatch;
let operation;
const requests = [];
const apiServer = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
  let body = '';
  for await (const chunk of req) body += chunk;
  requests.push(`${req.method} ${req.url}`);
  const json = (data, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
  if (req.url === '/auth/me') return json({ id: 1, email: 'test@example.invalid', firstName: 'Test', lastName: 'Admin', role: 'ADMIN' });
  if (req.url === '/admin/gallery' && req.method === 'GET') return json(items);
  if (req.url === '/admin/gallery/operations') return contractAvailable ? json(operation ? [operation] : []) : json({ message: 'Not deployed' }, 404);
  if (req.url === '/admin/gallery/batch' && req.method === 'DELETE') {
    deleteCalls++;
    if (failDelete) return json({ message: 'Fixture shared asset conflict' }, 409);
    const { ids } = JSON.parse(body);
    assert.deepEqual(ids.sort(), [1, 2]);
    await new Promise(resolve => setTimeout(resolve, 250));
    items = items.filter(item => !ids.includes(item.id));
    operation = { operationId, status: 'cleanup_pending', requestedCount: 2, deletedIds: [1], notFoundIds: [2], preservedAssetIds: [1], cleanup: { pending: 1, succeeded: 0, failed: 0 } };
    return json(operation);
  }
  if (req.url === `/admin/gallery/operations/${operationId}/retry`) {
    operation = { ...operation, status: 'completed', cleanup: { pending: 0, succeeded: 1, failed: 0 } };
    return json(operation);
  }
  if (req.url?.startsWith('/admin/gallery/operations/')) return json(operation);
  if (req.method === 'PATCH' && req.url === '/admin/gallery/1') {
    lastPatch = JSON.parse(body);
    items[0] = { ...items[0], ...lastPatch };
    return json(items[0]);
  }
  if (req.url === '/uploads/photo.svg') { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="400" height="250" fill="#6548d8"/></svg>'); }
  if (req.url?.startsWith('/uploads/')) return json({ message: 'Missing fixture media' }, 404);
  return json(req.url?.includes('notification') ? { items: [], unreadCount: 0 } : {});
});
await new Promise(resolve => apiServer.listen(0, '127.0.0.1', resolve));
const apiOrigin = `http://127.0.0.1:${apiServer.address().port}`;
const distRoot = resolve('dist');
const staticServer = createServer(async (req, res) => {
  try {
    let filename = resolve(distRoot, `.${new URL(req.url, 'http://local').pathname}`);
    if (!filename.startsWith(distRoot + sep)) throw new Error('Invalid path');
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
  throw new Error(`Timed out: ${label}`);
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); ws.send(JSON.stringify({ id: requestId, method, params })); });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
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
      void send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', { requestId, ...(allowed ? {} : { errorReason: 'BlockedByClient' }) });
    }
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('waterfall_access_token','fixture-token');` });
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${origin}/admin/gallery` });
  await waitFor(() => evaluate(`document.querySelectorAll('.admin-gallery__card').length === 3`), 'gallery fixture load');
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__api-status').textContent.includes('Bulk deletion is disabled')`), 'unsupported API gate');
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__bulk-delete').disabled`), true);
  contractAvailable = true;
  await evaluate(`document.querySelector('.admin-gallery__api-status button').click()`);
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__api-status').textContent.includes('contract verified')`), 'verified API gate');
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__media-fallback') !== null`), 'broken image fallback');
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__card img').src.startsWith('${apiOrigin}')`), true);
  await evaluate(`document.querySelector('.admin-gallery__preview-button').click()`);
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__preview-modal') !== null && document.querySelector('.admin-gallery__selection-count').textContent.includes('0 images selected')`), true);
  await evaluate(`document.querySelector('.admin-gallery__preview-modal > button').click(); document.querySelector('.admin-gallery__actions button').click()`);
  assert.equal(await evaluate(`[...document.querySelectorAll('.admin-gallery__upload-modal input')].some(input => input.readOnly && input.value.startsWith('${apiOrigin}'))`), true);
  await evaluate(`(() => {
    const input = document.querySelector('.admin-gallery__metadata-fields input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Edited fixture photo');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.admin-gallery__upload-modal').requestSubmit();
  })()`);
  await waitFor(() => lastPatch !== undefined, 'metadata PATCH');
  for (const field of ['imageUrl', 'publicId', 'thumbnailUrl', 'mediaType']) assert.equal(field in lastPatch, false);
  assert.equal(lastPatch.title, 'Edited fixture photo');
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__upload-modal') === null`), 'metadata dialog closed');
  await evaluate(`document.querySelector('.admin-gallery__selection-check input').click()`);
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__select-all input').indeterminate`), true);
  await evaluate(`document.querySelector('.admin-gallery__select-all input').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('.admin-gallery__card--selected').length`), 2);
  assert.equal(await evaluate(`document.querySelectorAll('.admin-gallery__selection-check input').length`), 2);
  await evaluate(`[...document.querySelectorAll('.admin-gallery__filter')].find(button => button.textContent.trim() === 'Videos').click()`);
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__selection-count').textContent.includes('2 hidden')`), true);
  await evaluate(`document.querySelector('.admin-gallery__bulk-delete').click()`);
  assert.equal(await evaluate(`document.querySelector('dialog').open && document.querySelector('#gallery-delete-title').textContent.includes('2')`), true);
  await evaluate(`document.querySelector('dialog button[type="submit"]').click()`);
  await waitFor(() => evaluate(`document.querySelector('[role="alert"]')?.textContent.includes('Fixture shared asset')`), '409 feedback');
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__selection-count').textContent.includes('2 images selected')`), true);
  failDelete = false;
  await evaluate(`document.querySelector('.admin-gallery__bulk-delete').click(); document.querySelector('dialog form').requestSubmit(); document.querySelector('dialog form').requestSubmit();`);
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__cleanup')?.textContent.includes('Cleanup pending')`), 'cleanup pending result');
  assert.equal(deleteCalls, 2, 'one rejected request and one successful request, no duplicate');
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__selection-count').textContent.includes('0 images selected')`), true);
  assert.equal(await evaluate(`document.querySelector('.admin-gallery__notice').textContent.includes('deliberately preserved')`), true);
  await evaluate(`[...document.querySelectorAll('.admin-gallery__cleanup button')].find(button => button.textContent === 'Retry file cleanup').click()`);
  await waitFor(() => evaluate(`document.querySelector('.admin-gallery__cleanup').textContent.includes('Cleanup completed')`), 'cleanup retry');
  await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= 768`), true, 'tablet viewport should not overflow horizontally');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= 375`), true, 'mobile viewport should not overflow horizontally');
  assert.deepEqual(browserErrors, []);
  console.log('Browser smoke passed: API gate, partial selection, images-only Select All, hidden selection confirmation, 409 preservation, duplicate-submit protection, partial/pending/preserved results, cleanup retry, metadata-only editing, image fallbacks, preview isolation, and tablet/mobile overflow.');
  console.log(`Mocked API requests: ${requests.length}. Real backend requests: 0.`);
} finally {
  if (ws?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch { /* browser may close before reply */ } ws.close(); }
  browser.kill();
  apiServer.closeAllConnections(); apiServer.close();
  staticServer.closeAllConnections(); staticServer.close();
  await delay(500);
  if (profile.startsWith(resolve(tmpdir()) + sep) && profile.includes('gallery-smoke-')) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
