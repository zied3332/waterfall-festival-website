import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock3, FileImage, Film, HardDrive, Images, LoaderCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { ApiError } from "../../services/api.service";
import { getAdminStorageStats } from "../../services/storage.service";
import type { StorageStats } from "../../types/storage";
import { formatStorageBytes, formatStorageCount, storageErrorMessage, STORAGE_CATEGORY_LABELS, STORAGE_DIRECTORY_LABELS, storageWarningMessage } from "../utils/storage";
import AdminStorageBreakdown from "../components/AdminStorageBreakdown";
import AdminStorageEstimator from "../components/AdminStorageEstimator";
import "../style/admin-storage.css";

export default function AdminStorage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);
  const pending = useRef(true);

  useEffect(() => {
    let active = true;
    getAdminStorageStats().then(result => {
      if (active) setStats(result);
    }).catch((error: unknown) => {
      if (!active) return;
      setError(storageErrorMessage(error));
      if (error instanceof ApiError && [401, 403].includes(error.status)) setStats(null);
    }).finally(() => {
      if (active) { pending.current = false; setIsLoading(false); }
    });
    return () => { active = false; };
  }, [requestVersion]);

  function refresh() {
    if (pending.current) return;
    pending.current = true;
    setIsLoading(true);
    setError(null);
    setRequestVersion(version => version + 1);
  }

  const categories = stats ? [
    { label: "Gallery Images", stats: stats.gallery.images, icon: Images },
    { label: "Gallery Videos", stats: stats.gallery.videos, icon: Film },
    { label: "Event Posters", stats: stats.events.posters, icon: FileImage },
  ] : [];
  const complete = stats?.status === "ok";

  return <section className="admin-storage" aria-labelledby="storage-title" aria-busy={isLoading}>
    <header className="admin-storage__header">
      <div><span className="admin-storage__eyebrow"><HardDrive size={16} aria-hidden="true" />LOCAL MEDIA MONITORING</span>
        <h1 id="storage-title">Storage &amp; Media</h1>
        <p>Measured media files on the backend server. Hosting capacity is a separate measurement.</p>
      </div>
      <button className="admin-storage__refresh" type="button" disabled={isLoading} onClick={refresh}>
        {isLoading ? <LoaderCircle className="admin-storage__spinner" size={17} aria-hidden="true" /> : <RefreshCw size={17} aria-hidden="true" />}
        {isLoading ? "Measuring..." : "Refresh"}
      </button>
    </header>
    {error && <div className="admin-storage__alert admin-storage__alert--error" role="alert">
      <AlertTriangle size={19} aria-hidden="true" /><div><strong>Measurement request failed</strong><p>{error}</p>
        {stats && <p>Showing the last successful response below; it has not been refreshed.</p>}
        <button type="button" disabled={isLoading} onClick={refresh}>Try again</button>
        {error.startsWith("Your session") && <Link to="/admin/login">Sign in</Link>}
      </div>
    </div>}
    {isLoading && !stats && <div className="admin-storage__loading" role="status"><LoaderCircle className="admin-storage__spinner" size={25} aria-hidden="true" /><p>Measuring supported media files...</p></div>}
    {stats && <>
      <div className="admin-storage__measurement" role="status" aria-live="polite">
        <span className={`admin-storage__status admin-storage__status--${stats.status}`}>{complete ? "Measurement complete" : stats.status === "partial" ? "Measurement incomplete" : "Measurement unavailable"}</span>
        <span><Clock3 size={14} aria-hidden="true" /> Last measured <time dateTime={stats.measuredAt}>{new Date(stats.measuredAt).toLocaleString()}</time></span>
      </div>
      {(stats.status !== "ok" || stats.warnings.length > 0) && <div className="admin-storage__alert" role="status">
        <AlertTriangle size={19} aria-hidden="true" /><div>
          <strong>{complete ? "Measurement notes" : "Some media could not be measured completely"}</strong>
          {!complete && <p>Overall totals and storage percentages are unavailable. Observed values are incomplete and are not authoritative totals.</p>}
          {stats.warnings.length > 0 && <ul>{stats.warnings.map((warning, index) => <li key={`${warning.category}-${warning.code}-${index}`}>
            <strong>{STORAGE_CATEGORY_LABELS[warning.category]}:</strong> {storageWarningMessage(warning.code)}
          </li>)}</ul>}
        </div>
      </div>}
      {complete && stats.total.files === 0 && <div className="admin-storage__empty" role="status"><Images size={22} aria-hidden="true" /><div><strong>No supported local media files found</strong><p>All three directories were measured successfully and contain no supported files.</p></div></div>}
      <div className="admin-storage__overview">
        {categories.map(category => <article className="admin-storage__card" key={category.label}>
          <div className="admin-storage__card-heading"><span>{category.label}</span><category.icon size={19} aria-hidden="true" /></div>
          <strong className="admin-storage__card-value">{formatStorageCount(category.stats.count)}</strong>
          <p>{formatStorageBytes(category.stats.totalBytes)} <span>{category.stats.totalBytes !== null ? "on disk" : ""}</span></p>
          <small>{STORAGE_DIRECTORY_LABELS[category.stats.status]}</small>
        </article>)}
        <article className="admin-storage__card admin-storage__card--total">
          <div className="admin-storage__card-heading"><span>Total Media Storage</span><HardDrive size={19} aria-hidden="true" /></div>
          <strong className="admin-storage__card-value">{complete ? formatStorageBytes(stats.total.bytes) : "Not available"}</strong>
          <p>{complete ? `${formatStorageCount(stats.total.files)} measured files` : `${formatStorageBytes(stats.observed.bytes)} observed only`}</p>
          <small>{complete ? "Supported local media only" : "Incomplete measurement"}</small>
        </article>
      </div>
    </>}
    <div className="admin-storage__insights">
      {stats && <AdminStorageBreakdown stats={stats} />}
      <AdminStorageEstimator />
    </div>
    {stats && <>
      <section className="admin-storage__panel" aria-labelledby="storage-details-title">
        <div className="admin-storage__panel-heading"><h2 id="storage-details-title">File size details</h2><p>For incomplete categories, sizes describe only the files observed.</p></div>
        <dl className="admin-storage__details">
          <div><dt>Average image size</dt><dd>{formatStorageBytes(stats.gallery.images.averageBytes)}</dd></div>
          <div><dt>Average video size</dt><dd>{formatStorageBytes(stats.gallery.videos.averageBytes)}</dd></div>
          <div><dt>Largest image</dt><dd>{formatStorageBytes(stats.gallery.images.largestBytes)}</dd></div>
          <div><dt>Largest video</dt><dd>{formatStorageBytes(stats.gallery.videos.largestBytes)}</dd></div>
          <div><dt>Total media files</dt><dd>{complete ? formatStorageCount(stats.total.files) : "Not available"}</dd></div>
        </dl>
      </section>
      <p className="admin-storage__scope">Counts describe supported local files, not database records, Cloudinary assets, or hosting-wide disk usage. Sizes use decimal units (1 MB = 1,000,000 bytes). Complete snapshots may be cached by the API for up to {stats.cacheTtlMs / 1000} seconds. Refresh requests a measurement; it does not modify files.</p>
    </>}
  </section>;
}
