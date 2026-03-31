import { useCallback, useEffect, useState } from "react";
import * as reservationsApi from "../api/reservations";
import type { ReservationCreate, ReservationResponse } from "../types/reservation";

export function useReservations() {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshReservations = useCallback(async () => {
    try {
      const data = await reservationsApi.getReservations();
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReservations();
  }, [refreshReservations]);

  const createReservation = useCallback(
    async (data: ReservationCreate) => {
      const result = await reservationsApi.createReservation(data);
      await refreshReservations();
      return result;
    },
    [refreshReservations],
  );

  const isBikeReserved = useCallback(
    (bikeId: number | string): boolean => {
      const id = String(bikeId);
      const now = new Date();
      return reservations.some(
        (r) =>
          r.bike_id === id &&
          new Date(r.start_date) <= now &&
          new Date(r.end_date) >= now,
      );
    },
    [reservations],
  );

  return { reservations, loading, error, refreshReservations, createReservation, isBikeReserved };
}
