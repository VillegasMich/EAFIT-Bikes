import { useEffect, useRef, useState } from "react";
import { getLocations } from "../api/locations";
import type { LocationResponse } from "../types/location";

const POLL_INTERVAL_MS = 5000;

function deduplicateByBicycleId(
  locations: LocationResponse[],
): LocationResponse[] {
  const map = new Map<string, LocationResponse>();
  for (const loc of locations) {
    const existing = map.get(loc.bicycle_id);
    if (!existing || loc.updated_at > existing.updated_at) {
      map.set(loc.bicycle_id, loc);
    }
  }
  return Array.from(map.values());
}

export function usePollingLocations() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLocations() {
      try {
        const data = await getLocations({ latest: true });
        if (!cancelled) {
          setLocations(deduplicateByBicycleId(data));
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { locations, loading, error };
}
