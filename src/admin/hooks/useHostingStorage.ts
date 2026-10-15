import { useEffect, useRef, useState } from "react";
import { getAdminHostingStats } from "../../services/hosting.service";
import type { HostingStorageStats } from "../../types/hosting";
import { hostingErrorMessage } from "../utils/hosting";

export default function useHostingStorage() {
  const [stats, setStats] = useState<HostingStorageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const pending = useRef(true);
  useEffect(() => {
    let active = true;
    getAdminHostingStats().then(result => { if (active) setStats(result); })
      .catch((reason: unknown) => { if (active) { setStats(null); setError(hostingErrorMessage(reason)); } })
      .finally(() => { if (active) { pending.current = false; setLoading(false); } });
    return () => { active = false; };
  }, [version]);
  function refresh() {
    if (pending.current) return;
    pending.current = true;
    setStats(null);
    setError(null);
    setLoading(true);
    setVersion(value => value + 1);
  }
  return { stats, error, loading, refresh };
}
