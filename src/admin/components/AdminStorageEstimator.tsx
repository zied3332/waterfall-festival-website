import { useId, useState } from "react";
import { Calculator, Unplug } from "lucide-react";
import { estimateUploadCapacity } from "../utils/storage";
import { estimateHostingUploads } from "../utils/hosting";
import { formatStorageBytes } from "../utils/storage";

export default function AdminStorageEstimator({ availableBytes = null }: { availableBytes?: number | null }) {
  const id = useId();
  const [averageMB, setAverageMB] = useState(1);
  const [space, setSpace] = useState("");
  const [unit, setUnit] = useState<"MB" | "GB">("GB");
  const [manual, setManual] = useState(false);
  const [reserve, setReserve] = useState("0");
  const liveAvailable = availableBytes !== null && Number.isSafeInteger(availableBytes) && availableBytes >= 0;
  const live = liveAvailable && !manual;
  const reservePercent = reserve.trim() === "" ? NaN : Number(reserve);
  const estimate = live ? estimateHostingUploads(availableBytes, averageMB, reservePercent) : estimateUploadCapacity(space, unit, averageMB);
  const invalid = space.trim() !== "" && estimate === null;
  return <section className="admin-storage__panel admin-storage__estimator" aria-labelledby={`${id}-title`}>
    <div className="admin-storage__panel-heading"><h2 id={`${id}-title`}><Calculator size={17} aria-hidden="true" />Upload Capacity Estimator</h2></div>
    <p className="admin-storage__capacity-status"><Unplug size={16} aria-hidden="true" />{live ? "Real Hosting Capacity" : "Simulation — not connected to live hosting capacity."}</p>
    <label className="admin-storage__field" htmlFor={`${id}-mode`}>Estimator mode
      <select id={`${id}-mode`} value={live ? "live" : "manual"} onChange={event => setManual(event.target.value === "manual")}>
        <option value="live" disabled={!liveAvailable}>Real hosting capacity{!liveAvailable ? " (unavailable)" : ""}</option><option value="manual">Manual simulation</option>
      </select>
    </label>
    <p className="admin-storage__capacity-copy">{live ? `${formatStorageBytes(availableBytes)} available in the latest verified hosting response. Other account activity may change this capacity.` : "Enter hypothetical space below. Local media usage alone cannot determine remaining hosting capacity."}</p>
    <label className="admin-storage__field" htmlFor={`${id}-average`}>Assumed average image size
      <select id={`${id}-average`} value={averageMB} onChange={event => setAverageMB(Number(event.target.value))}>
        {[0.5, 1, 2, 5, 10].map(size => <option key={size} value={size}>{size} MB</option>)}
      </select>
    </label>
    {live ? <fieldset className="admin-storage__simulation"><legend>Real capacity estimate</legend>
      <label className="admin-storage__field" htmlFor={`${id}-reserve`}>Safety reserve (%)
        <input id={`${id}-reserve`} type="number" min="0" max="100" step="any" value={reserve} onChange={event => setReserve(event.target.value)} aria-invalid={estimate === null} aria-describedby={`${id}-reserve-help`} />
      </label>
      <p id={`${id}-reserve-help`}>Keep 0–100% of available space unused. A reserve is optional; 0% uses all available bytes.</p>
      {estimate === null && <p className="admin-storage__input-error" role="alert">Enter a reserve between 0 and 100%.</p>}
      <output className="admin-storage__estimate" htmlFor={`${id}-reserve ${id}-average`} aria-live="polite" aria-atomic="true">{estimate === null ? <span>No estimate yet</span> : <><strong>{new Intl.NumberFormat().format(estimate)}</strong><span>estimated additional images using hosting capacity</span></>}</output>
      <p className="admin-storage__simulation-note">Estimate only, not a guaranteed upload count. Excludes filesystem overhead and future account activity; existing upload limits still apply.</p>
    </fieldset> : <fieldset className="admin-storage__simulation">
      <legend>Optional simulation</legend>
      <p id={`${id}-simulation-help`}>Enter hypothetical available space. This is not a live hosting measurement.</p>
      <div className="admin-storage__simulation-fields">
        <label className="admin-storage__field" htmlFor={`${id}-space`}>Hypothetical available space
          <input id={`${id}-space`} type="number" inputMode="decimal" min="0" step="any" value={space} placeholder="Enter a value"
            onChange={event => setSpace(event.target.value)} aria-invalid={invalid} aria-describedby={`${id}-simulation-help${invalid ? ` ${id}-error` : ""}`} />
        </label>
        <label className="admin-storage__field" htmlFor={`${id}-unit`}>Unit
          <select id={`${id}-unit`} value={unit} onChange={event => setUnit(event.target.value as "MB" | "GB")}><option value="GB">GB</option><option value="MB">MB</option></select>
        </label>
      </div>
      {invalid && <p id={`${id}-error`} className="admin-storage__input-error" role="alert">Enter a finite, non-negative amount within the supported numeric range.</p>}
      <output className="admin-storage__estimate" htmlFor={`${id}-space ${id}-unit ${id}-average`} aria-live="polite" aria-atomic="true">
        {estimate === null ? <span>No estimate yet</span> : <><strong>{new Intl.NumberFormat().format(estimate)}</strong><span>additional images in this simulation</span></>}
      </output>
      <p className="admin-storage__simulation-note">Simulation only, not an actual upload limit. It excludes filesystem overhead and reserved space, and does not change existing upload size limits. Uses decimal MB and GB.</p>
    </fieldset>}
  </section>;
}
