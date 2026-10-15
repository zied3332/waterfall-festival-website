import { api } from "./api.service";
import type { MediaDirectoryStats, StorageCategory, StorageDirectoryStatus, StorageMeasurementStatus, StorageStats, StorageTotals } from "../types/storage";

const invalidResponse = () => new Error("The storage API returned an unsupported or inconsistent measurement. No new statistics were displayed.");
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidResponse();
  return value as Record<string, unknown>;
}
function number(value: unknown, nullable = true, integer = true): number | null {
  if (value === null && nullable) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER || (integer && !Number.isSafeInteger(value))) throw invalidResponse();
  return value;
}
function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) || !Number.isFinite(Date.parse(value))) throw invalidResponse();
  return value;
}
const close = (left: number, right: number) => Math.abs(left - right) <= Math.max(1, Math.abs(right)) * 1e-9;
function directory(value: unknown): MediaDirectoryStats {
  const data = record(value);
  if (!["ok", "missing", "unavailable", "unsafe", "partial"].includes(String(data.status))) throw invalidResponse();
  const available = data.status === "ok" || data.status === "partial";
  const result: MediaDirectoryStats = {
    status: data.status as StorageDirectoryStatus,
    count: number(data.count), totalBytes: number(data.totalBytes),
    averageBytes: number(data.averageBytes, true, false), largestBytes: number(data.largestBytes),
  };
  const values = [result.count, result.totalBytes, result.averageBytes, result.largestBytes];
  if (available ? values.some(value => value === null) : values.some(value => value !== null)) throw invalidResponse();
  if (available) {
    const count = result.count!, bytes = result.totalBytes!, average = result.averageBytes!, largest = result.largestBytes!;
    if (count === 0 ? bytes !== 0 || average !== 0 || largest !== 0 : !close(average, bytes / count) || largest > bytes || largest < average) throw invalidResponse();
  }
  return result;
}
function totals(value: unknown): StorageTotals {
  const data = record(value);
  return { files: number(data.files), bytes: number(data.bytes) };
}

/** Validate known fields and build a new object: never forward server paths or arbitrary metadata. */
export function parseStorageStats(value: unknown): StorageStats {
  const data = record(value), gallery = record(data.gallery), events = record(data.events);
  const images = directory(gallery.images), videos = directory(gallery.videos), posters = directory(events.posters);
  const categories = [images, videos, posters];
  const complete = categories.every(category => category.status === "ok");
  const expectedStatus = complete ? "ok" : categories.some(category => category.count !== null) ? "partial" : "unavailable";
  if (data.status !== expectedStatus) throw invalidResponse();
  const total = totals(data.total), observed = totals(data.observed);
  const observedFiles = categories.reduce((sum, category) => sum + (category.count ?? 0), 0);
  const observedBytes = categories.reduce((sum, category) => sum + (category.totalBytes ?? 0), 0);
  if (!Number.isSafeInteger(observedFiles) || !Number.isSafeInteger(observedBytes)) throw invalidResponse();
  if ((observed.files !== null && observed.files !== observedFiles) || (observed.bytes !== null && observed.bytes !== observedBytes)) throw invalidResponse();
  if (complete ? total.files !== observedFiles || total.bytes !== observedBytes : total.files !== null || total.bytes !== null) throw invalidResponse();
  const shares = record(data.percentages);
  const percentages = { images: number(shares.images, true, false), videos: number(shares.videos, true, false), posters: number(shares.posters, true, false) };
  [percentages.images, percentages.videos, percentages.posters].forEach((share, index) => {
    const expected = complete ? observedBytes ? categories[index].totalBytes! / observedBytes * 100 : 0 : null;
    if (expected === null ? share !== null : share === null || !close(share, expected)) throw invalidResponse();
  });
  if (!Array.isArray(data.warnings)) throw invalidResponse();
  const warnings = data.warnings.map(value => {
    const warning = record(value);
    if (!["gallery.images", "gallery.videos", "events.posters"].includes(String(warning.category)) || typeof warning.code !== "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(warning.code)) throw invalidResponse();
    return { category: warning.category as StorageCategory, code: warning.code };
  });
  const measuredAt = timestamp(data.measuredAt), scanStartedAt = timestamp(data.scanStartedAt);
  if (Date.parse(measuredAt) < Date.parse(scanStartedAt)) throw invalidResponse();
  return {
    measuredAt, scanStartedAt, status: data.status as StorageMeasurementStatus, cacheTtlMs: number(data.cacheTtlMs, false)!,
    gallery: { images, videos }, events: { posters }, total, observed, percentages, warnings,
  };
}

export async function getAdminStorageStats(): Promise<StorageStats> {
  return parseStorageStats(await api.get<unknown>("/admin/storage/stats"));
}
