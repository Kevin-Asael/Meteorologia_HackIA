import { useCallback, useEffect, useState } from "react";
import type { AlertItem } from "./types";
import { getAlerts } from "./api";

export function useAlerts(refreshIntervalMs = 30_000) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await load();
    };
    run();
    const id = setInterval(run, refreshIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [load, refreshIntervalMs]);

  return { alerts, loading, error, lastUpdate, reload: load };
}
