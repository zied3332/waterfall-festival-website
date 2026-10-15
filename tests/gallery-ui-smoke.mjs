import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

// Windows Edge smoke test of the production bundle. All API data is disposable.
// Default runs block remote requests. GALLERY_VERIFY_PUBLIC_MEDIA=1 permits
// only the optional public GET/media checks; admin mutations stay mocked.
const browserPath = process.env.GALLERY_TEST_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile = await mkdtemp(join(tmpdir(), 'gallery-smoke-'));
const operationId = '7358c4c1-4ee7-4cdd-8a83-f10d602bcab8';
const baseItem = { title: 'Test photo', description: '', altText: 'Disposable image', status: 'DRAFT', isFeatured: false, sortOrder: 0, publicId: 'gallery/images/test.webp', thumbnailUrl: null, duration: null, width: null, height: null, showOnHomepage: false, homepageSortOrder: 0, eventId: null, event: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
let items = [1, 2, 3].map(id => ({ ...baseItem, id, title: id === 3 ? 'Test video' : `Test photo ${id}`, mediaType: id === 3 ? 'VIDEO' : 'IMAGE', isFeatured: id === 1, thumbnailUrl: id === 3 ? '/uploads/photo.svg' : null, imageUrl: id === 3 ? '/uploads/clip.webm' : id === 2 ? '/uploads/missing.webp' : '/uploads/photo.svg' }));
let publicMode = "mixed";
let fixtureVideo;
let contractAvailable = false;
let failDelete = true;
let deleteCalls = 0;
let lastPatch;
let operation;
const requests = [];
const allowedPublicMedia = new Set();
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
  if (req.url === '/settings/public') return json({ galleryPageEnabled: true, eventsPageEnabled: false, experiencePageEnabled: false, faqPageEnabled: false });
  if (req.url === '/gallery') {
    if (publicMode === 'fail') return json({ message: 'Fixture API unavailable' }, 503);
    if (publicMode === 'album') return json([
      ...Array.from({ length: 14 }, (_, index) => ({ ...baseItem, id: 101 + index, title: `Album photo ${index + 1}`, mediaType: 'IMAGE', status: 'PUBLISHED', isFeatured: index === 13, sortOrder: index, imageUrl: index === 1 ? '/uploads/missing.webp' : '/uploads/photo.svg' })),
      { ...items[2], status: 'PUBLISHED' },
    ]);
    return json(items.filter(item => publicMode !== 'videos' || item.mediaType === 'VIDEO').map(item => ({ ...item, status: 'PUBLISHED' })));
  }
  if (req.url === '/gallery/homepage-videos') return json(items.filter(item => item.mediaType === 'VIDEO').map(item => ({ ...item, status: 'PUBLISHED', showOnHomepage: true })));
  if (req.url === '/uploads/clip.webm') { res.writeHead(200, { 'Content-Type': 'video/webm', 'Content-Length': fixtureVideo.length }); return res.end(fixtureVideo); }

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
    if (message.id) { const request = pending.get(message.id); pending.delete(message.id); if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`)); else request.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      const allowed = [origin, apiOrigin].includes(new URL(request.url).origin) || (allowedPublicMedia.has(request.url) && ['GET', 'HEAD'].includes(request.method));
      // A reload can detach the old page before its paused request is resumed.
      void send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', { requestId, ...(allowed ? {} : { errorReason: 'BlockedByClient' }) }).catch(() => {});
    }
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('waterfall_access_token','fixture-token');` });
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
  const encodedVideo = await evaluate(`new Promise(resolve => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
    const context = canvas.getContext('2d'); context.fillStyle = '#6548d8'; context.fillRect(0,0,160,90);
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
    const chunks = []; recorder.ondataavailable = event => chunks.push(event.data);
    recorder.onstop = () => { const reader = new FileReader(); reader.onload = () => { stream.getTracks().forEach(track => track.stop()); resolve(reader.result.split(',')[1]); }; reader.readAsDataURL(new Blob(chunks, {type:'video/webm'})); };
    recorder.start(); setTimeout(() => { context.fillStyle = '#22d3ee'; context.fillRect(0,0,160,90); }, 80); setTimeout(() => recorder.stop(), 250);
  })`);
  fixtureVideo = Buffer.from(encodedVideo, 'base64');
  await send('Page.navigate', { url: `${origin}/gallery` });
  await waitFor(() => evaluate(`document.querySelectorAll('.gallery-card').length === 3`), 'public gallery records');
  await waitFor(() => evaluate(`document.querySelector('.gallery-card img')?.naturalWidth > 0`), 'public image decoded across origins');
  await waitFor(() => evaluate(`document.querySelector('.gallery-card video')?.videoWidth > 0`), 'public video decoded across origins');
  await waitFor(() => evaluate(`document.querySelector('.gallery-card .gallery-media-fallback') !== null`), 'public missing-image fallback');
  assert.equal(await evaluate(`[...document.querySelectorAll('.gallery-card img')].some(image => image.src.endsWith('.webm'))`), false);
  for (const [label, count] of [['Photos', 2], ['Videos', 1], ['Featured', 1], ['All moments', 3]]) {
    await evaluate(`[...document.querySelectorAll('.gallery-filter')].find(button => button.textContent.trim() === ${JSON.stringify(label)}).click()`);
    await waitFor(() => evaluate(`document.querySelectorAll('.gallery-card').length === ${count}`), `public ${label} filter`);
  }
  for (const [width, columns] of [[320, 2], [375, 2], [768, 3], [1024, 4], [1365, 4]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gallery-grid')).gridTemplateColumns.split(' ').length`), columns);
    assert.equal(await evaluate(`(() => { const tile = document.querySelector('.gallery-tile').getBoundingClientRect(); return Math.abs(tile.width - tile.height) < 1 && document.documentElement.scrollWidth <= ${width}; })()`), true, `public square grid at ${width}px`);
  }
  if (process.env.GALLERY_PUBLIC_SCREENSHOT) {
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GALLERY_PUBLIC_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  await evaluate(`document.querySelector('.gallery-card--featured').click()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-lightbox__image')?.naturalWidth > 0`), 'featured image lightbox');
  await evaluate(`document.querySelector('.gallery-lightbox__close').click()`);
  await evaluate(`document.querySelector('.gallery-card video').closest('button').click()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-lightbox__image')?.videoWidth > 0`), 'public video lightbox');
  assert.equal(await evaluate(`document.querySelector('.gallery-lightbox__image').controls`), true);
  await send('Page.navigate', { url: origin });
  await waitFor(() => evaluate(`document.querySelectorAll('.gallery-preview-photo').length === 2`), 'homepage backend photos');
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-photo img')?.naturalWidth > 0`), 'homepage image decoded');
  await waitFor(() => evaluate(`document.querySelector('.festival-reel-card video')?.videoWidth > 0`), 'homepage reel decoded');
  await evaluate(`document.querySelectorAll('.gallery-preview-photo')[1].scrollIntoView()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-photo .gallery-media-fallback') !== null`), 'homepage failure shown without stock substitution');
  assert.equal(await evaluate(`[...document.querySelectorAll('.gallery-preview-photo img')].some(image => image.src.includes('/images/gallery/'))`), false);
  await evaluate(`document.querySelector('.gallery-preview-photo').click()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-lightbox__image')?.naturalWidth > 0`), 'homepage photo lightbox');
  await evaluate(`document.querySelector('.gallery-preview-lightbox__close').click()`);
  publicMode = 'album';
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelectorAll('.gallery-preview-photo').length === 12`), '12-photo homepage limit');
  assert.equal(await evaluate(`document.querySelector('.gallery-preview-photo').getAttribute('aria-label')`), 'Open Album photo 14', 'existing featured-first ordering is preserved');
  assert.equal(await evaluate(`document.querySelector('.gallery-preview-card__featured') === null && document.querySelector('.gallery-preview-album--more') !== null`), true);
  await evaluate(`document.querySelector('.gallery-preview-favorite').click()`);
  assert.equal(await evaluate(`document.querySelector('.gallery-preview-favorite').getAttribute('aria-pressed') === 'true' && !document.querySelector('.gallery-preview-lightbox').open`), true, 'favorite does not open the viewer');
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('waterfall.gallery.favorites.v1'))`), ['114']);
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-favorite')?.getAttribute('aria-pressed') === 'true'`), 'favorite survives reload');
  await evaluate(`document.querySelector('.gallery-preview-favorite').click(); document.querySelector('.gallery-preview-favorite').click()`);
  assert.deepEqual(await evaluate(`JSON.parse(localStorage.getItem('waterfall.gallery.favorites.v1'))`), ['114'], 'favorites remain unique');
  for (const [width, columns] of [[320, 3], [375, 3], [767, 3], [768, 4], [1023, 4], [1024, 5], [1365, 5]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.gallery-preview-grid')).gridTemplateColumns.split(' ').length`), columns, `column count at ${width}px`);
    assert.equal(await evaluate(`(() => { const tile = document.querySelector('.gallery-preview-tile').getBoundingClientRect(); return Math.abs(tile.width - tile.height) < 1 && document.querySelector('.gallery-preview').scrollWidth <= ${width}; })()`), true, `square tiles without preview overflow at ${width}px`);
    assert.equal(await evaluate(`document.querySelector('.gallery-preview-favorite').getBoundingClientRect().width >= 44`), true);
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  if (process.env.GALLERY_PREVIEW_SCREENSHOT) {
    await evaluate(`document.querySelector('.gallery-preview').scrollIntoView({block:'start'})`);
    await delay(300);
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.GALLERY_PREVIEW_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
  }
  await evaluate(`document.querySelector('.gallery-preview-photo').click()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-lightbox').open`), 'native modal opens');
  assert.equal(await evaluate(`document.activeElement === document.querySelector('.gallery-preview-lightbox__close') && document.body.style.overflow === 'hidden'`), true, 'viewer focuses close and locks background scrolling');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', modifiers: 8 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', modifiers: 8 });
  assert.equal(await evaluate(`document.activeElement.getAttribute('aria-label')`), 'Next image', 'Shift+Tab wraps focus inside modal');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-lightbox__counter').textContent.includes('Photo 2 of 12')`), 'keyboard next');
  await evaluate(`(() => { const viewer = document.querySelector('.gallery-preview-lightbox__viewer'); const start = new Touch({identifier:1,target:viewer,clientX:250,clientY:250}); const end = new Touch({identifier:1,target:viewer,clientX:80,clientY:260}); viewer.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[start],changedTouches:[start]})); viewer.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[end]})); })()`);
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-lightbox__counter').textContent.includes('Photo 3 of 12')`), 'touch swipe next');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await waitFor(() => evaluate(`!document.querySelector('.gallery-preview-lightbox').open`), 'Escape closes viewer');
  assert.equal(await evaluate(`document.activeElement === document.querySelector('.gallery-preview-photo') && document.body.style.overflow !== 'hidden'`), true, 'focus and scrolling restored');
  await evaluate(`localStorage.setItem('waterfall.gallery.favorites.v1', 'invalid JSON')`);
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelectorAll('.gallery-preview-photo').length === 12`), 'corrupt browser storage does not break the album');
  assert.equal(await evaluate(`document.querySelector('.gallery-preview-favorite').getAttribute('aria-pressed')`), 'false');
  await evaluate(`document.querySelector('.gallery-preview-cta').click()`);
  await waitFor(() => evaluate(`location.pathname === '/gallery' && document.querySelectorAll('.gallery-card').length > 0`), 'existing full Gallery navigation');
  publicMode = 'videos';
  await send('Page.navigate', { url: origin });
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-status')?.textContent.includes('No gallery photos')`), 'honest photo empty state for video-only API');
  publicMode = 'fail';
  await send('Page.reload');
  await waitFor(() => evaluate(`document.querySelector('.gallery-preview-status')?.textContent.includes('could not be loaded')`), 'visible homepage API failure');
  publicMode = 'mixed';
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
  if (process.env.GALLERY_VERIFY_PUBLIC_MEDIA === '1') {
    // Optional READ-ONLY hosting check. Never load production admin routes or
    // send POST/PATCH/DELETE requests outside the disposable fixture server.
    const config = await readFile(resolve('.env.production'), 'utf8');
    const apiBase = config.match(/^VITE_API_URL=(.+)$/m)?.[1].trim();
    assert.ok(apiBase, 'Configure VITE_API_URL for the optional hosting check');
    const response = await fetch(`${apiBase}/gallery`, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200);
    const records = await response.json();
    const results = [];
    for (const record of records.slice(0, 10)) {
      const url = new URL(record.imageUrl, apiBase);
      if (url.origin !== new URL(apiBase).origin || !url.pathname.startsWith('/uploads/gallery/')) continue;
      allowedPublicMedia.add(url.href);
      const result = await evaluate(`new Promise(resolve => {
        const media = document.createElement(${JSON.stringify(record.mediaType === 'VIDEO' ? 'video' : 'img')});
        const finish = loaded => { clearTimeout(timer); const result = { id: ${record.id}, type: ${JSON.stringify(record.mediaType)}, loaded, width: media.videoWidth || media.naturalWidth || 0 }; media.removeAttribute('src'); if (media.load) media.load(); media.remove(); resolve(result); };
        const timer = setTimeout(() => finish(false), 15000);
        media.onload = () => finish(true); media.onloadeddata = () => finish(true); media.onerror = () => finish(false);
        media.muted = true; media.preload = 'auto'; media.style.width = '160px'; document.body.appendChild(media);
        media.src = ${JSON.stringify(url.href)};
      })`);
      results.push(result);
    }
    console.log('Read-only live API browser decoding:', JSON.stringify(results));
    assert.ok(results.length > 0 && results.every(result => result.loaded && result.width > 0), 'Published local media must decode successfully');
  }
  assert.deepEqual(browserErrors, []);
  console.log('Homepage album passed: 12-photo limit, stable sorting, 3/4/5 columns from 320px, square tiles, favorite isolation/persistence/rapid toggles, corrupt storage, modal focus/keyboard/swipe/scroll recovery, and full Gallery navigation.');
  console.log('Public media smoke passed: decoded backend images/videos, featured and video lightboxes, homepage photos/reels, explicit missing-media and API failure states.');
  console.log('Browser smoke passed: API gate, partial selection, images-only Select All, hidden selection confirmation, 409 preservation, duplicate-submit protection, partial/pending/preserved results, cleanup retry, metadata-only editing, image fallbacks, preview isolation, and tablet/mobile overflow.');
  console.log(`Mocked API requests: ${requests.length}. Real backend mutations: 0. Optional live checks use public GET/media reads only.`);
} finally {
  if (ws?.readyState === WebSocket.OPEN) { try { await send('Browser.close'); } catch { /* browser may close before reply */ } ws.close(); }
  browser.kill();
  apiServer.closeAllConnections(); apiServer.close();
  staticServer.closeAllConnections(); staticServer.close();
  await delay(500);
  if (profile.startsWith(resolve(tmpdir()) + sep) && profile.includes('gallery-smoke-')) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
