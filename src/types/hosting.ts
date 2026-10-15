export interface HostingStorageStats {
  status: "ok" | "unavailable" | "unlimited" | "not_configured";
  source: "cpanel_uapi";
  measuredAt: string | null;
  quotaBytes: number | null;
  usedBytes: number | null;
  availableBytes: number | null;
  usagePercent: number | null;
  isUnlimited: boolean;
  errorCode?: string;
}
