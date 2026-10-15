import { api } from "./api.service";
import type { HostingStorageStats } from "../types/hosting";

export function parseHostingStats(value: unknown): HostingStorageStats {
  const invalid = () => { throw new Error("Invalid hosting measurement response"); };
  if (!value || typeof value !== "object" || Array.isArray(value)) return invalid();
  const data = value as Record<string, unknown>;
  if (!["ok", "unavailable", "unlimited", "not_configured"].includes(String(data.status)) || data.source !== "cpanel_uapi" || typeof data.isUnlimited !== "boolean") return invalid();
  if (data.measuredAt !== null && (typeof data.measuredAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(data.measuredAt) || !Number.isFinite(Date.parse(data.measuredAt)))) return invalid();
  for (const key of ["quotaBytes", "usedBytes", "availableBytes", "usagePercent"]) {
    const number = data[key];
    if (number !== null && (typeof number !== "number" || !Number.isFinite(number) || number < 0 || (key !== "usagePercent" && !Number.isSafeInteger(number)))) return invalid();
  }
  if (data.errorCode !== undefined && (typeof data.errorCode !== "string" || !/^[a-z][a-z0-9_]{0,63}$/.test(data.errorCode))) return invalid();
  const success = data.status === "ok" || data.status === "unlimited";
  if (data.isUnlimited !== (data.status === "unlimited") || (success && data.measuredAt === null)) return invalid();
  if (!success && [data.quotaBytes, data.usedBytes, data.availableBytes, data.usagePercent, data.measuredAt].some(field => field !== null)) return invalid();
  if (data.isUnlimited && [data.quotaBytes, data.availableBytes, data.usagePercent].some(field => field !== null)) return invalid();
  const { quotaBytes: quota, usedBytes: used, availableBytes: available, usagePercent: percent } = data as unknown as HostingStorageStats;
  if (quota !== null && used !== null) {
    if (available !== null && available !== Math.max(0, quota - used)) return invalid();
    if (percent !== null && (quota === 0 || Math.abs(percent - used / quota * 100) > 0.000001)) return invalid();
  }
  if (percent !== null && (quota === null || quota === 0)) return invalid();
  return {
    status: data.status as HostingStorageStats["status"], source: "cpanel_uapi", measuredAt: data.measuredAt as string | null,
    quotaBytes: quota, usedBytes: used, availableBytes: available, usagePercent: percent, isUnlimited: data.isUnlimited,
    ...(data.errorCode === undefined ? {} : { errorCode: data.errorCode as string }),
  };
}

export async function getAdminHostingStats(): Promise<HostingStorageStats> {
  return parseHostingStats(await api.get<unknown>("/admin/storage/hosting"));
}
