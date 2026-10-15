export type StorageDirectoryStatus = "ok" | "missing" | "unavailable" | "unsafe" | "partial";
export type StorageMeasurementStatus = "ok" | "partial" | "unavailable";
export type StorageCategory = "gallery.images" | "gallery.videos" | "events.posters";

export interface MediaDirectoryStats {
  status: StorageDirectoryStatus;
  count: number | null;
  totalBytes: number | null;
  averageBytes: number | null;
  largestBytes: number | null;
}
export interface StorageTotals { files: number | null; bytes: number | null }
export interface StorageWarning { category: StorageCategory; code: string }

/** Mirrors the Phase 1 NestJS StorageStatsDto, not hosting disk capacity. */
export interface StorageStats {
  measuredAt: string;
  scanStartedAt: string;
  status: StorageMeasurementStatus;
  cacheTtlMs: number;
  gallery: { images: MediaDirectoryStats; videos: MediaDirectoryStats };
  events: { posters: MediaDirectoryStats };
  total: StorageTotals;
  observed: StorageTotals;
  percentages: { images: number | null; videos: number | null; posters: number | null };
  warnings: StorageWarning[];
}
