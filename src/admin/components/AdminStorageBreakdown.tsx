import { ChartNoAxesCombined } from "lucide-react";
import type { StorageStats } from "../../types/storage";
import { formatStorageBytes, formatStoragePercent } from "../utils/storage";

type Props = { stats: StorageStats };
export default function AdminStorageBreakdown({ stats }: Props) {
  const complete = stats.status === "ok";
  const categories = [
    { key: "images", label: "Gallery images", bytes: stats.gallery.images.totalBytes, percentage: stats.percentages.images },
    { key: "videos", label: "Gallery videos", bytes: stats.gallery.videos.totalBytes, percentage: stats.percentages.videos },
    { key: "posters", label: "Event posters", bytes: stats.events.posters.totalBytes, percentage: stats.percentages.posters },
  ];
  return <section className="admin-storage__panel admin-storage__breakdown" aria-labelledby="storage-breakdown-title">
    <div className="admin-storage__panel-heading"><h2 id="storage-breakdown-title">Measured media breakdown</h2><p>Share of measured media bytes, not hosting disk utilization.</p></div>
    <div className="admin-storage__breakdown-total"><strong>{complete ? formatStorageBytes(stats.total.bytes) : "Total not available"}</strong><span>{complete ? "across supported local media files" : "A complete scan is required for percentages"}</span></div>
    {complete ? <>
      <div className="admin-storage__segments" role="img" aria-label={categories.map(category => `${category.label}: ${formatStorageBytes(category.bytes)}, ${formatStoragePercent(category.percentage)}`).join("; ")}>
        {categories.map(category => <span key={category.key} className={`admin-storage__segment admin-storage__segment--${category.key}`} style={{ width: `${category.percentage ?? 0}%` }} aria-hidden="true" />)}
      </div>
      {stats.total.bytes === 0 && <p className="admin-storage__chart-note">{stats.total.files === 0 ? "No measured media bytes yet." : "Measured files contain no bytes."}</p>}
    </> : <div className="admin-storage__chart-unavailable"><ChartNoAxesCombined size={24} aria-hidden="true" /><p>Storage shares are unavailable while any category is missing, unsafe, or incomplete.</p></div>}
    <ul className="admin-storage__legend">
      {categories.map(category => <li key={category.key}>
        <span className="admin-storage__legend-label"><span className={`admin-storage__swatch admin-storage__segment--${category.key}`} aria-hidden="true" />{category.label}</span>
        <span className="admin-storage__legend-value"><strong>{formatStorageBytes(category.bytes)}</strong><small>{formatStoragePercent(category.percentage)}</small></span>
      </li>)}
    </ul>
  </section>;
}
