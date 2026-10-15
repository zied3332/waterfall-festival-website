import { Clock3, Cloud, Gauge, HardDrive, RefreshCw, Server } from "lucide-react";
import { Link } from "react-router-dom";
import type useHostingStorage from "../hooks/useHostingStorage";
import { hostingMessage, hostingPercent, utilizationLevel } from "../utils/hosting";
import { formatStorageBytes } from "../utils/storage";

export default function AdminHostingCapacity({ hosting }: { hosting: ReturnType<typeof useHostingStorage> }) {
  const { stats, loading, error, refresh } = hosting;
  const percent = stats?.usagePercent ?? null;
  const progress = percent === null ? null : Math.min(100, Math.max(0, percent));
  const cards = [
    { title: "Total Hosting Capacity", value: stats?.isUnlimited ? "Unlimited" : stats?.quotaBytes == null ? "—" : formatStorageBytes(stats.quotaBytes), icon: Server },
    { title: "Used Hosting Storage", value: stats?.usedBytes == null ? "—" : formatStorageBytes(stats.usedBytes), icon: HardDrive },
    { title: "Available Hosting Space", value: stats?.availableBytes == null ? "—" : formatStorageBytes(stats.availableBytes), icon: Cloud },
    { title: "Storage Utilization", value: hostingPercent(percent), icon: Gauge },
  ];
  return <section className="admin-hosting" aria-labelledby="hosting-title" aria-busy={loading}>
    <header className="admin-storage__header">
      <div><span className="admin-storage__eyebrow"><Cloud size={16} aria-hidden="true" />CPANEL · ACCOUNT STORAGE</span><h2 id="hosting-title">Hosting Capacity</h2><p>Account-wide hosting measurements, independent of supported media files.</p></div>
      <button type="button" onClick={refresh} disabled={loading} aria-label="Refresh hosting statistics"><RefreshCw size={17} className={loading ? "admin-storage__spinner" : undefined} aria-hidden="true" />{loading ? "Loading hosting…" : "Refresh hosting"}</button>
    </header>
    <div className="admin-hosting__message" role="status" aria-live="polite">
      <strong>{loading ? "Loading hosting statistics…" : error || stats?.status === "unavailable" ? "Hosting statistics unavailable" : stats?.status === "not_configured" ? "Hosting monitoring is not configured" : stats?.status === "unlimited" ? "Unlimited hosting quota" : "Hosting measurements verified"}</strong>
      {!loading && <p>{error ?? (stats && hostingMessage(stats))}</p>}
      {error?.startsWith("Your session") && <Link to="/admin/login">Sign in</Link>}
    </div>
    <div className="admin-hosting__cards">{cards.map(card => <article className={`admin-hosting__card${loading ? " admin-hosting__card--loading" : ""}`} key={card.title}>
      <div className="admin-storage__card-heading"><span>{card.title}</span><card.icon size={19} aria-hidden="true" /></div>
      <strong className="admin-storage__card-value">{loading ? <span className="admin-hosting__skeleton" aria-hidden="true" /> : card.value}</strong>
    </article>)}</div>
    <div className="admin-hosting__utilization" data-level={percent === null ? "neutral" : utilizationLevel(percent)}>
      {progress === null ? <><div className="admin-hosting__track" aria-hidden="true" /><p>Utilization {stats?.isUnlimited ? "does not apply to an unlimited quota" : "is not available"}.</p></> : <>
        <div className="admin-hosting__track" role="progressbar" aria-label="Hosting storage used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${hostingPercent(percent)} used; ${hostingPercent(100 - progress)} remaining`}><span style={{ width: `${progress}%` }} /></div>
        <p><strong>{hostingPercent(percent)} used</strong><span>{hostingPercent(100 - progress)} remaining · {utilizationLevel(percent!)} usage</span></p>
        <small>Dashboard alert thresholds: caution at 70%, warning at 85%, critical at 95%. These are not provider limits.</small>
      </>}
    </div>
    <p className="admin-storage__scope"><Clock3 size={13} aria-hidden="true" /> Source: cPanel UAPI · {stats?.measuredAt ? <>Last measured <time dateTime={stats.measuredAt}>{new Date(stats.measuredAt).toLocaleString()}</time></> : "No verified measurement timestamp"}. Successful measurements may be cached for five minutes. Sizes use decimal units.</p>
  </section>;
}
