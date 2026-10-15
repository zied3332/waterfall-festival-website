export function storageFixture(mode = 'complete') {
  const ok = (count, totalBytes, largestBytes) => ({ status: 'ok', count, totalBytes, averageBytes: count ? totalBytes / count : 0, largestBytes });
  const unknown = status => ({ status, count: null, totalBytes: null, averageBytes: null, largestBytes: null });
  let images = ok(3, 3000000, 2000000), videos = ok(2, 12000000, 8000000), posters = ok(4, 1000000, 400000);
  let warnings = [];
  if (mode === 'empty') images = videos = posters = ok(0, 0, 0);
  if (mode === 'zeroBytes') images = ok(1, 0, 0);
  if (mode === 'partial') {
    images = { ...ok(2, 2000000, 1000000), status: 'partial' }; videos = unknown('missing');
    warnings = [{ category: 'gallery.images', code: 'metadata_unavailable' }, { category: 'gallery.videos', code: 'directory_missing' }];
  }
  if (mode === 'unavailable') {
    images = unknown('unsafe'); videos = unknown('unavailable'); posters = unknown('missing');
    warnings = [{ category: 'gallery.images', code: 'unsafe_directory' }, { category: 'gallery.videos', code: 'directory_unavailable' }, { category: 'events.posters', code: 'directory_missing' }];
  }
  if (mode === 'warning') warnings = [{ category: 'gallery.images', code: 'symlink_skipped' }];
  const categories = [images, videos, posters];
  const complete = categories.every(item => item.status === 'ok');
  const observed = { files: categories.reduce((sum, item) => sum + (item.count ?? 0), 0), bytes: categories.reduce((sum, item) => sum + (item.totalBytes ?? 0), 0) };
  const percentage = bytes => complete ? observed.bytes ? bytes / observed.bytes * 100 : 0 : null;
  return {
    measuredAt: '2026-10-15T10:00:01.000Z', scanStartedAt: '2026-10-15T10:00:00.000Z', cacheTtlMs: 5000,
    status: complete ? 'ok' : categories.some(item => item.count !== null) ? 'partial' : 'unavailable',
    gallery: { images, videos }, events: { posters }, total: complete ? { ...observed } : { files: null, bytes: null }, observed,
    percentages: { images: percentage(images.totalBytes), videos: percentage(videos.totalBytes), posters: percentage(posters.totalBytes) }, warnings,
  };
}
