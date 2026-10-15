export function hostingFixture(mode = 'ok') {
  const base = { status: 'ok', source: 'cpanel_uapi', measuredAt: '2026-10-15T10:00:02.000Z', quotaBytes: 100e9, usedBytes: 75e9, availableBytes: 25e9, usagePercent: 75, isUnlimited: false };
  if (mode === 'ok') return base;
  if (mode === 'partial') return { ...base, usedBytes: null, usagePercent: null };
  if (mode === 'unlimited') return { ...base, status: 'unlimited', isUnlimited: true, quotaBytes: null, availableBytes: null, usagePercent: null };
  if (mode === 'over') return { ...base, usedBytes: 110e9, availableBytes: 0, usagePercent: 110 };
  if (mode === 'malformed') return { ...base, quotaBytes: '100 GB' };
  return { ...base, status: mode === 'not_configured' ? mode : 'unavailable', measuredAt: null, quotaBytes: null, usedBytes: null, availableBytes: null, usagePercent: null, errorCode: mode };
}
