import assert from 'node:assert/strict';
import test from 'node:test';
import { loadStorage } from './helpers/load-storage.mjs';
import { storageFixture } from './helpers/storage-fixtures.mjs';

test('storage GET uses existing API origin and bearer authentication', async () => {
  let request;
  const { service } = await loadStorage(async (url, options) => { request = { url, ...options }; return Response.json(storageFixture()); });
  const result = await service.getAdminStorageStats();
  assert.equal(request.url, 'https://api.test/admin/storage/stats');
  assert.equal(request.headers.get('Authorization'), 'Bearer storage-test-token');
  assert.equal(request.body, undefined);
  assert.equal(result.total.bytes, 16000000);
  assert.equal(result.gallery.images.averageBytes, 1000000);
});

for (const scenario of ['complete', 'partial', 'unavailable', 'empty', 'warning', 'zeroBytes', 'zeroByteOnly']) {
  test(`adapter preserves the real ${scenario} measurement semantics`, async () => {
    const fixture = storageFixture(scenario);
    const { service } = await loadStorage();
    const result = service.parseStorageStats(fixture);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), fixture);
    if (scenario === 'partial' || scenario === 'unavailable') {
      assert.equal(result.total.bytes, null); assert.equal(result.percentages.images, null);
    }
    if (scenario === 'empty') assert.equal(result.total.files, 0);
  });
}

test('unknown metadata and server paths never pass through the adapter', async () => {
  const fixture = storageFixture();
  fixture.serverPath = '/srv/private/uploads'; fixture.gallery.images.directory = 'C:/private/uploads';
  const { service } = await loadStorage();
  const result = service.parseStorageStats(fixture);
  assert.equal(JSON.stringify(result).includes('private'), false);
});

test('malformed and internally contradictory snapshots are rejected instead of fabricated', async () => {
  const { service } = await loadStorage();
  const mutations = [
    value => { value.total.bytes++; }, value => { value.observed.files++; }, value => { value.percentages.images = 100; },
    value => { value.gallery.images.count = '3'; }, value => { value.gallery.images.totalBytes = -1; },
    value => { value.gallery.images.averageBytes = NaN; }, value => { value.gallery.images.largestBytes = Infinity; },
    value => { value.gallery.images.status = 'unknown'; }, value => { value.status = 'partial'; },
    value => { value.measuredAt = 'bad timestamp'; }, value => { value.scanStartedAt = '2026-10-16T10:00:00Z'; },
    value => { value.warnings = [{ category: 'gallery.images', code: '/srv/private/path' }]; },
    value => { delete value.events; }, value => { value.total.files = Number.MAX_SAFE_INTEGER + 1; },
  ];
  for (const mutate of mutations) { const value = storageFixture(); mutate(value); assert.throws(() => service.parseStorageStats(value)); }
  for (const value of [null, [], {}, '<html>proxy error</html>']) assert.throws(() => service.parseStorageStats(value));
});

test('unmeasured and partial values cannot be presented as complete empty measurements', async () => {
  const { service } = await loadStorage();
  const fixture = storageFixture('partial');
  fixture.gallery.videos.count = 0;
  assert.throws(() => service.parseStorageStats(fixture));
  const other = storageFixture('partial'); other.total = { files: 0, bytes: 0 };
  assert.throws(() => service.parseStorageStats(other));
});

test('byte formatting retains zero, fractional averages, and decimal units', async () => {
  const { presentation } = await loadStorage();
  for (const [bytes, expected] of [[0, '0 B'], [0.5, '0.5 B'], [1000, '1 KB'], [1000000, '1 MB'], [2500000000, '2.5 GB']]) {
    assert.equal(presentation.formatStorageBytes(bytes), expected);
  }
  assert.equal(presentation.formatStorageBytes(null), 'Not measured');
  assert.equal(presentation.formatStorageBytes(NaN), 'Not measured');
});

for (const status of [401, 403, 404, 500]) {
  test(`HTTP ${status} produces a safe storage error without server path disclosure`, async () => {
    const { service, presentation } = await loadStorage(async () => Response.json({ message: 'Failed /srv/private/uploads' }, { status }));
    await assert.rejects(service.getAdminStorageStats(), error => {
      assert.equal(error.status, status);
      assert.equal(presentation.storageErrorMessage(error).includes('/srv'), false);
      return true;
    });
  });
}

test('warnings are displayed through a safe allowlist with a generic future-code fallback', async () => {
  const { presentation } = await loadStorage();
  assert.match(presentation.storageWarningMessage('directory_missing'), /does not exist/);
  assert.match(presentation.storageWarningMessage('future_warning'), /additional measurement warning/);
  assert.equal(presentation.storageWarningMessage('/srv/private/uploads').includes('/srv'), false);
});


test('storage percentages preserve zero/unknown distinctions without invented shares', async () => {
  const { presentation } = await loadStorage();
  assert.equal(presentation.formatStoragePercent(0), '0%');
  assert.equal(presentation.formatStoragePercent(18.75), '18.75%');
  for (const value of [null, NaN, Infinity, -1, 101]) assert.equal(presentation.formatStoragePercent(value), 'Not available');
});

test('capacity simulation uses only administrator-entered available space and assumed image size', async () => {
  const { presentation } = await loadStorage();
  for (const [space, unit, average, expected] of [['1','GB',1,1000],['1','GB',0.5,2000],['1','GB',5,200],['1','GB',10,100],['500','MB',2,250],['0','GB',1,0],['1','MB',5,0]]) {
    assert.equal(presentation.estimateUploadCapacity(space,unit,average), expected);
  }
});

test('capacity simulation has no fake default and rejects unsupported or unsafe numbers', async () => {
  const { presentation } = await loadStorage();
  for (const value of ['', ' ', '-1', 'Infinity', '1e309', '1e100', 'not a number']) assert.equal(presentation.estimateUploadCapacity(value,'GB',1), null);
  for (const average of [0, -1, NaN, Infinity, 1e-100, 1e100]) assert.equal(presentation.estimateUploadCapacity('1','GB',average), null);
  assert.equal(presentation.estimateUploadCapacity('1','TB',1), null);
});
