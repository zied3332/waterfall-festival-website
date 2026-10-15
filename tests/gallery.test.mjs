import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real TypeScript services with isolated browser globals and mocked HTTP.
export async function loadGallery(fetchImpl = async () => Response.json([]), environment = {}) {
  const context = vm.createContext({
    window: { location: { hostname: 'localhost', origin: 'https://frontend.test' } },
    URL, Headers, FormData, Response, fetch: fetchImpl, console,
  });
  const modules = new Map();
  async function load(filename) {
    if (modules.has(filename)) return modules.get(filename);
    if (filename.endsWith('auth.service.ts')) {
      const auth = new vm.SyntheticModule(['getAccessToken'], function () {
        this.setExport('getAccessToken', () => 'test-token');
      }, { context });
      modules.set(filename, auth);
      return auth;
    }
    const source = await readFile(filename, 'utf8');
    const code = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
    }).outputText;
    const module = new vm.SourceTextModule(code, {
      context, identifier: filename,
      initializeImportMeta(meta) { meta.env = { VITE_API_URL: 'http://api.test:3000', DEV: false, ...environment }; },
    });
    modules.set(filename, module);
    await module.link(specifier => load(resolve(dirname(filename), `${specifier}.ts`)));
    return module;
  }
  const service = await load(resolve('src/services/gallery.service.ts'));
  await service.evaluate();
  const api = modules.get(resolve('src/services/api.service.ts'));
  const selection = await load(resolve('src/admin/utils/gallery-selection.ts'));
  await selection.evaluate();
  return { gallery: service.namespace, api: api.namespace, selection: selection.namespace };
}

const item = { id: 1, imageUrl: '/uploads/gallery/images/photo.webp', thumbnailUrl: '/uploads/gallery/images/thumb.webp' };

test('gallery lists normalize local media and thumbnail URLs across origins', async () => {
  const { gallery } = await loadGallery(async () => Response.json([item]));
  const [actual] = await gallery.getAdminGallery();
  assert.equal(actual.imageUrl, 'http://api.test:3000/uploads/gallery/images/photo.webp');
  assert.equal(actual.thumbnailUrl, 'http://api.test:3000/uploads/gallery/images/thumb.webp');
});

test('media normalization preserves Cloudinary, blob, data and already absolute URLs', async () => {
  const { api } = await loadGallery();
  for (const url of ['https://res.cloudinary.com/demo/a.jpg', 'http://api.test:3000/uploads/a.jpg', 'blob:preview', 'data:image/png;base64,abc']) {
    assert.equal(api.getApiMediaUrl(url), url);
  }
  assert.equal(api.getApiMediaUrl(null), null);
});

test('metadata PATCH keeps auth and JSON transport and normalizes its response', async () => {
  let captured;
  const { gallery } = await loadGallery(async (url, options) => {
    captured = { url, ...options };
    return Response.json(item);
  });
  const updated = await gallery.updateGalleryImage(1, { title: 'New title', description: '', status: 'DRAFT' });
  assert.equal(captured.method, 'PATCH');
  assert.equal(captured.headers.get('Authorization'), 'Bearer test-token');
  assert.deepEqual(JSON.parse(captured.body), { title: 'New title', description: '', status: 'DRAFT' });
  assert.equal(updated.imageUrl, 'http://api.test:3000/uploads/gallery/images/photo.webp');
});

test('image and video uploads preserve multipart fields and normalize returned media', async () => {
  const requests = [];
  const { gallery } = await loadGallery(async (url, options) => {
    requests.push({ url, ...options });
    return Response.json(url.endsWith('/video') ? item : { success: true, count: 1, items: [item] });
  });
  const imageResult = await gallery.uploadGalleryImages({ files: [], title: 'Photo', status: 'DRAFT', isFeatured: false, sortOrder: 0 });
  const videoResult = await gallery.uploadGalleryVideo({ file: new File(['video'], 'clip.mp4'), title: 'Clip', status: 'DRAFT', isFeatured: false, sortOrder: 0, showOnHomepage: true, homepageSortOrder: 2 });
  assert.equal(requests[0].body.get('title'), 'Photo');
  assert.equal(requests[1].body.get('showOnHomepage'), 'true');
  assert.equal(requests[1].headers.has('Content-Type'), false);
  assert.equal(imageResult.items[0].imageUrl, videoResult.imageUrl);
});

const operationId = '7358c4c1-4ee7-4cdd-8a83-f10d602bcab8';
function deletion(overrides = {}) {
  return { operationId, status: 'completed', requestedCount: 3, deletedIds: [12, 18], notFoundIds: [27], preservedAssetIds: [], cleanup: { pending: 0, succeeded: 2, failed: 0 }, ...overrides };
}

test('batch DELETE uses the real route, JSON body, auth, and no invented idempotency header', async () => {
  let request;
  const { gallery } = await loadGallery(async (url, options) => {
    request = { url, ...options };
    return Response.json(deletion());
  });
  const result = await gallery.deleteGalleryImagesBatch([12, 18, 27]);
  assert.equal(request.url, 'http://api.test:3000/admin/gallery/batch');
  assert.equal(request.method, 'DELETE');
  assert.equal(request.headers.get('Content-Type'), 'application/json');
  assert.equal(request.headers.get('Authorization'), 'Bearer test-token');
  assert.equal(request.headers.has('Idempotency-Key'), false);
  assert.deepEqual(JSON.parse(request.body), { ids: [12, 18, 27] });
  assert.equal(result.operationId, operationId);
});

test('legacy single DELETE remains body-free and reports nested cleanup outcomes', async () => {
  let options;
  const { gallery } = await loadGallery(async (_url, request) => {
    options = request;
    return Response.json({ ...item, deletion: deletion() });
  });
  const result = await gallery.deleteGalleryImage(1);
  assert.equal(options.method, 'DELETE');
  assert.equal(options.body, undefined);
  assert.equal(options.headers.has('Content-Type'), false);
  assert.equal(result.deletion.status, 'completed');
});

test('batch IDs are validated before network access', async () => {
  let calls = 0;
  const { gallery } = await loadGallery(async () => { calls++; return Response.json(deletion()); });
  for (const ids of [[], [1, 1], [0], [-1], [1.5], ['12'], [2147483648], Array.from({ length: 101 }, (_, i) => i + 1)]) {
    await assert.rejects(gallery.deleteGalleryImagesBatch(ids));
  }
  assert.equal(calls, 0);
});

for (const status of [400, 401, 403, 409, 500]) {
  test(`HTTP ${status} preserves status and server validation details`, async () => {
    const { gallery } = await loadGallery(async () => Response.json({ message: ['First detail', 'Second detail'] }, { status }));
    await assert.rejects(gallery.deleteGalleryImagesBatch([12]), error => error.status === status && error.message === 'First detail Second detail');
  });
}

test('unverified and malformed operations contracts are rejected', async () => {
  for (const response of [{ items: [] }, '<html>login</html>', [{ status: 'completed' }]]) {
    const { gallery } = await loadGallery(async () => Response.json(response));
    await assert.rejects(gallery.getGalleryCleanupOperations());
  }
  const { gallery } = await loadGallery();
  assert.equal((await gallery.getGalleryCleanupOperations()).length, 0);
});

test('batch results must match submitted IDs before UI can reconcile', async () => {
  const { gallery } = await loadGallery(async () => Response.json(deletion({ deletedIds: [88, 18] })));
  await assert.rejects(gallery.deleteGalleryImagesBatch([12, 18, 27]), /do not match/);
});

test('runtime validation rejects contradictory statuses and invalid counts or IDs', async () => {
  const { gallery } = await loadGallery();
  for (const bad of [null, {}, deletion({ status: 'unknown' }), deletion({ requestedCount: 2 }), deletion({ preservedAssetIds: [999] }), deletion({ cleanup: { pending: 1, succeeded: 0, failed: 0 } }), deletion({ deletedIds: [12, 12] })]) {
    assert.throws(() => gallery.parseGalleryDeletion(bad));
  }
});

test('status and retry use the documented operations endpoints', async () => {
  const calls = [];
  const { gallery } = await loadGallery(async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(deletion());
  });
  await gallery.getGalleryCleanupOperation(operationId);
  await gallery.retryGalleryCleanup(operationId);
  assert.equal(calls[0].url, `http://api.test:3000/admin/gallery/operations/${operationId}`);
  assert.equal(calls[1].url, `http://api.test:3000/admin/gallery/operations/${operationId}/retry`);
  assert.equal(calls[1].method, 'POST');
});

test('Select All adds only visible images and preserves hidden selections without duplicates', async () => {
  const { selection } = await loadGallery();
  const result = selection.selectVisibleImages(new Set([9, 12]), [
    { id: 12, mediaType: 'IMAGE' }, { id: 18, mediaType: 'IMAGE' }, { id: 30, mediaType: 'VIDEO' },
  ]);
  assert.deepEqual([...result], [9, 12, 18]);
});

test('refresh prunes missing selections and IDs that no longer represent images', async () => {
  const { selection } = await loadGallery();
  const result = selection.pruneGallerySelection(new Set([9, 12, 30]), [{ id: 12, mediaType: 'IMAGE' }, { id: 30, mediaType: 'VIDEO' }]);
  assert.deepEqual([...result], [12]);
});

test('confirmed deletion removes deleted/missing IDs but preserves unrelated selection and media', async () => {
  const { selection } = await loadGallery();
  const current = new Set([9, 12, 18, 27]);
  const result = selection.reconcileGalleryDeletion([{ id: 9 }, { id: 12 }, { id: 18 }, { id: 27 }, { id: 30, mediaType: 'VIDEO' }], current, deletion());
  assert.deepEqual(result.items.map(item => item.id), [9, 30]);
  assert.deepEqual([...result.selection], [9]);
  assert.deepEqual([...current], [9, 12, 18, 27]);
});

test('pending, failed, partial and preserved outcomes never claim all physical assets were deleted', async () => {
  const { gallery, selection } = await loadGallery();
  for (const status of ['cleanup_pending', 'cleanup_failed']) {
    const result = deletion({ status, preservedAssetIds: [12], cleanup: { pending: status === 'cleanup_pending' ? 2 : 0, succeeded: 0, failed: status === 'cleanup_failed' ? 2 : 0 } });
    gallery.parseGalleryDeletion(result);
    const message = selection.describeGalleryDeletion(result);
    assert.match(message, /already missing/);
    assert.match(message, /deliberately preserved/);
    assert.doesNotMatch(message, /All scheduled/);
    assert.match(message, status === 'cleanup_pending' ? /still pending/ : /could not be cleaned/);
  }
});


test('media helper resolves root uploads against backend origin, not an API prefix', async () => {
  const { api } = await loadGallery(undefined, { VITE_API_URL: 'https://backend.test/api/v1/' });
  assert.equal(api.getApiMediaUrl('/uploads/gallery/images/photo.webp'), 'https://backend.test/uploads/gallery/images/photo.webp');
  assert.equal(api.getApiMediaUrl('uploads/gallery/videos/clip.mp4'), 'https://backend.test/uploads/gallery/videos/clip.mp4');
  assert.equal(api.getApiMediaUrl(api.getApiMediaUrl('/uploads/a.jpg')), 'https://backend.test/uploads/a.jpg');
});

test('production without API config uses current origin; development uses existing local convention', async () => {
  const production = await loadGallery(undefined, { VITE_API_URL: '' });
  assert.equal(production.api.API_URL, 'https://frontend.test');
  const development = await loadGallery(undefined, { VITE_API_URL: undefined, DEV: true });
  assert.equal(development.api.API_URL, 'http://localhost:3000');
  const proxied = await loadGallery(undefined, { VITE_API_URL: '/api' });
  assert.equal(proxied.api.getApiMediaUrl('/uploads/a.jpg'), 'https://frontend.test/uploads/a.jpg');
});

test('invalid and unsafe media values return null rather than malformed requests', async () => {
  const { api } = await loadGallery();
  for (const input of [null, undefined, '', '   ', 123, {}, 'not a URL', 'null', 'undefined', 'https://', 'javascript:alert(1)', 'file:///tmp/a.jpg', 'data:text/html,test', '/uploads/a%zz.jpg', '/uploads/\\bad.jpg', '?image=1', '#photo', 'https://user:pass@example.com/a.jpg']) {
    assert.equal(api.getApiMediaUrl(input), null, String(input));
  }
  assert.equal(api.getApiMediaUrl(' /uploads/a photo.jpg '), 'http://api.test:3000/uploads/a%20photo.jpg');
  assert.equal(api.getApiMediaUrl('//cdn.example.com/a.jpg'), 'http://cdn.example.com/a.jpg');
});


test('all public gallery, homepage reel, and single-item reads normalize image and thumbnail sources', async () => {
  const { gallery } = await loadGallery(async url => Response.json(url.endsWith('/1') ? item : [item]));
  for (const read of [gallery.getGallery, gallery.getGalleryImages, gallery.getGalleryVideos, gallery.getHomepageVideos]) {
    const [actual] = await read();
    assert.equal(actual.imageUrl, 'http://api.test:3000/uploads/gallery/images/photo.webp');
    assert.equal(actual.thumbnailUrl, 'http://api.test:3000/uploads/gallery/images/thumb.webp');
  }
  assert.equal((await gallery.getGalleryImage(1)).imageUrl, 'http://api.test:3000/uploads/gallery/images/photo.webp');
});
