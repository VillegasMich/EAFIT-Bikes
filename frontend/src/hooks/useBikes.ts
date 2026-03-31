import { useCallback, useEffect, useState } from "react";
import * as bikesApi from "../api/bikes";
import type { Bike, BikeCreate, BikeUpdate } from "../types/bike";

export function useBikes() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshBikes = useCallback(async () => {
    try {
      const data = await bikesApi.getBikes();
      setBikes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBikes();
  }, [refreshBikes]);

  const createBike = useCallback(
    async (data: BikeCreate) => {
      await bikesApi.createBike(data);
      await refreshBikes();
    },
    [refreshBikes],
  );

  const updateBike = useCallback(
    async (id: number, data: BikeUpdate) => {
      await bikesApi.updateBike(id, data);
      await refreshBikes();
    },
    [refreshBikes],
  );

  const deleteBike = useCallback(
    async (id: number) => {
      await bikesApi.deleteBike(id);
      await refreshBikes();
    },
    [refreshBikes],
  );

  return { bikes, loading, error, createBike, updateBike, deleteBike, refreshBikes };
}
