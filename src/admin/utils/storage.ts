import { ApiError } from "../../services/api.service";
import type { StorageCategory, StorageDirectoryStatus } from "../../types/storage";

export const STORAGE_CATEGORY_LABELS: Record<StorageCategory, string> = {
  "gallery.images": "Gallery images", "gallery.videos": "Gallery videos", "events.posters": "Event posters",
};
export const STORAGE_DIRECTORY_LABELS: Record<StorageDirectoryStatus, string> = {
  ok: "Measured", partial: "Observed only", missing: "Directory missing", unavailable: "Unavailable", unsafe: "Safety check failed",
};
const warnings: Record<string, string> = {
  directory_missing: "The media directory does not exist, so its contents could not be measured.",
  directory_unavailable: "The media directory could not be read.",
  unsafe_directory: "A storage safety check prevented measurement.",
  symlink_skipped: "Symbolic links were skipped and are not included in supported file counts.",
  invalid_file_size: "A file size could not be measured safely; this category is incomplete.",
  file_disappeared: "A file changed or disappeared during measurement; this category is incomplete.",
  metadata_unavailable: "Some file metadata could not be read; this category is incomplete.",
};
export function storageWarningMessage(code: string) {
  return Object.prototype.hasOwnProperty.call(warnings, code) ? warnings[code] : "The backend reported an additional measurement warning. Ask the server administrator to review it.";
}

/** Decimal units, with the original API byte values retained separately. */
export function formatStorageBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return "Not measured";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const index = bytes === 0 ? 0 : Math.min(Math.max(0, Math.floor(Math.log10(bytes) / 3)), units.length - 1);
  const value = bytes / 1000 ** index;
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)} ${units[index]}`;
}
export function formatStorageCount(count: number | null): string {
  return count === null ? "Not measured" : new Intl.NumberFormat().format(count);
}
export function storageErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const messages: Record<number, string> = {
      401: "Your session has expired. Sign in again to view storage measurements.",
      403: "Your account does not have permission to view storage measurements.",
      404: "Storage statistics are not available on the configured API deployment yet.",
    };
    return messages[error.status] ?? "The server could not provide storage measurements. Please try again.";
  }
  // Server error text is deliberately not rendered: it may contain internal paths.
  return "Storage measurements could not be loaded or validated. Check the API connection and try again.";
}
