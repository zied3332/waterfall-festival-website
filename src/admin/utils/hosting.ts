import { ApiError } from "../../services/api.service";
import type { HostingStorageStats } from "../../types/hosting";

export function hostingMessage(stats: HostingStorageStats): string {
  if (stats.errorCode === "permission_denied") return "cPanel denied access to hosting statistics. Check the API token permissions or hosting API access settings.";
  if (stats.status === "not_configured") return "Hosting monitoring is not configured. Ask the server administrator to configure the backend hosting integration.";
  if (stats.status === "unavailable") return "Hosting statistics could not be retrieved. Local media measurements remain available independently.";
  if (stats.status === "unlimited") return "No finite account quota is available. Usage is shown only where measured; remaining capacity cannot be estimated.";
  return "Verified account-wide measurements from cPanel, separate from local media usage. Missing metrics are shown as dashes.";
}
export function hostingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Sign in again to view hosting statistics.";
    if (error.status === 403) return "Your admin account does not have permission to view hosting statistics.";
    if (error.status === 404) return "Hosting monitoring is not available on this API deployment yet.";
  }
  return "Hosting statistics could not be loaded or validated. Check the API connection and try again.";
}
export function hostingPercent(value: number | null): string {
  return value === null ? "—" : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`;
}
export function utilizationLevel(percent: number): "normal" | "caution" | "warning" | "critical" {
  return percent >= 95 ? "critical" : percent >= 85 ? "warning" : percent >= 70 ? "caution" : "normal";
}
export function estimateHostingUploads(bytes: number | null, averageMB: number, reservePercent: number): number | null {
  if (bytes === null || !Number.isSafeInteger(bytes) || bytes < 0 || !Number.isFinite(averageMB) || averageMB * 1e6 < 1 || !Number.isFinite(reservePercent) || reservePercent < 0 || reservePercent > 100) return null;
  return Math.floor(bytes * (1 - reservePercent / 100) / (averageMB * 1e6));
}
