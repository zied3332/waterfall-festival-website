import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real TypeScript services with isolated browser globals and mocked HTTP.
export async function loadGallery(fetchImpl = async () => Response.json([])) {
  const context = vm.createContext({
    window: { location: { hostname: 'localhost' } },
    Headers, FormData, Response, fetch: fetchImpl, console,
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
      initializeImportMeta(meta) { meta.env = { VITE_API_URL: 'http://api.test:3000' }; },
    });
    modules.set(filename, module);
    await module.link(specifier => load(resolve(dirname(filename), `${specifier}.ts`)));
    return module;
  }
  const service = await load(resolve('src/services/gallery.service.ts'));
  await service.evaluate();
  const api = modules.get(resolve('src/services/api.service.ts'));
  return { gallery: service.namespace, api: api.namespace };
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
