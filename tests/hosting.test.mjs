import assert from 'node:assert/strict';
import test from 'node:test';
import { loadStorage } from './helpers/load-storage.mjs';
import { hostingFixture } from './helpers/hosting-fixtures.mjs';

test('hosting endpoint reuses API origin and bearer authentication', async () => {
  const { hosting } = await loadStorage(async (url, options) => {
    assert.equal(url, 'https://api.test/admin/storage/hosting');
    assert.equal(options.headers.get('Authorization'), 'Bearer storage-test-token');
    assert.equal(options.method ?? 'GET', 'GET');
    return Response.json(hostingFixture());
  });
  assert.equal((await hosting.getAdminHostingStats()).availableBytes, 25e9);
});
for (const mode of ['ok', 'permission_denied', 'not_configured', 'unlimited', 'partial', 'over']) {
  test(`validates ${mode} contract without fabricating fields`, async () => {
    const { hosting } = await loadStorage();
    const fixture = hostingFixture(mode);
    assert.deepEqual(JSON.parse(JSON.stringify(hosting.parseHostingStats({ ...fixture, privatePath: '/private' }))), fixture);
  });
}
test('rejects malformed, missing, contradictory and unsafe metrics', async () => {
  const { hosting } = await loadStorage();
  for (const value of [null, [], {}, hostingFixture('malformed'), { ...hostingFixture(), availableBytes: -1 }, { ...hostingFixture(), usedBytes: Infinity }, { ...hostingFixture(), quotaBytes: Number.MAX_SAFE_INTEGER + 1 }, { ...hostingFixture(), availableBytes: 5 }, { ...hostingFixture(), usagePercent: 80 }, { ...hostingFixture(), measuredAt: 'yesterday' }, { ...hostingFixture('unlimited'), availableBytes: 10 }, { ...hostingFixture('permission_denied'), usedBytes: 1 }, { ...hostingFixture(), usedBytes: undefined }]) assert.throws(() => hosting.parseHostingStats(value));
});
test('permission denial is provider status, not an expired admin login', async () => {
  const { hostingPresentation } = await loadStorage();
  assert.equal(hostingPresentation.hostingMessage(hostingFixture('permission_denied')), 'cPanel denied access to hosting statistics. Check the API token permissions or hosting API access settings.');
});
test('rejects coerced status values and success containing an error code', async () => {
  const { hosting } = await loadStorage();
  assert.throws(() => hosting.parseHostingStats({ ...hostingFixture(), status: ['ok'] }));
  assert.throws(() => hosting.parseHostingStats({ ...hostingFixture(), errorCode: 'permission_denied' }));
});
for (const status of [401, 403, 404, 500]) {
  test(`HTTP ${status} fails safely and does not expose server text`, async () => {
    const { hosting, hostingPresentation } = await loadStorage(async () => Response.json({ message: 'secret /private/config' }, { status }));
    await assert.rejects(hosting.getAdminHostingStats(), error => {
      const message = hostingPresentation.hostingErrorMessage(error);
      assert.equal(message.includes('secret'), false);
      if (status === 401) assert.match(message, /session has expired/);
      if (status === 403) assert.match(message, /admin account does not have permission/);
      return true;
    });
  });
}
test('network failures remain errors', async () => {
  const { hosting } = await loadStorage(async () => { throw new TypeError('offline'); });
  await assert.rejects(hosting.getAdminHostingStats());
});
test('formats capacity and exact over-quota percentages and alert thresholds', async () => {
  const { presentation, hostingPresentation: p } = await loadStorage();
  assert.equal(presentation.formatStorageBytes(25e9), '25 GB');
  assert.equal(presentation.formatStorageBytes(2e12), '2 TB');
  assert.equal(p.hostingPercent(null), '—');
  assert.equal(p.hostingPercent(110), '110%');
  assert.deepEqual([0,69.99,70,84.99,85,94.99,95,110].map(p.utilizationLevel), ['normal','normal','caution','caution','warning','warning','critical','critical']);
});
test('real estimates use available bytes, reserve and floor without inferred quota', async () => {
  const { hostingPresentation: p } = await loadStorage();
  assert.equal(p.estimateHostingUploads(25e9, 1, 0), 25000);
  assert.equal(p.estimateHostingUploads(25e9, 5, 10), 4500);
  assert.equal(p.estimateHostingUploads(2500001, 1, 0), 2);
  assert.equal(p.estimateHostingUploads(0, 1, 0), 0);
  assert.equal(p.estimateHostingUploads(25e9, 1, 100), 0);
  for (const args of [[null,1,0],[-1,1,0],[25e9,0,0],[25e9,1,-1],[25e9,1,101],[25e9,1,NaN]]) assert.equal(p.estimateHostingUploads(...args), null);
});
