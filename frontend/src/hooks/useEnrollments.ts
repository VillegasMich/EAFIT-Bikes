import { useCallback, useEffect, useState } from "react";
import * as eventsApi from "../api/events";
import type { Enrollment } from "../types/event";

export function useEnrollments(eventId: number | null) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshEnrollments = useCallback(async () => {
    if (eventId === null) {
      setEnrollments([]);
      return;
    }
    setLoading(true);
    try {
      const data = await eventsApi.getEnrollments(eventId);
      setEnrollments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  const enroll = useCallback(
    async (userId: string) => {
      if (eventId === null) return;
      await eventsApi.createEnrollment(eventId, { user_id: userId });
      await refreshEnrollments();
    },
    [eventId, refreshEnrollments],
  );

  const cancel = useCallback(
    async (enrollmentId: number) => {
      if (eventId === null) return;
      await eventsApi.cancelEnrollment(eventId, enrollmentId);
      await refreshEnrollments();
    },
    [eventId, refreshEnrollments],
  );

  return { enrollments, loading, error, enroll, cancel, refreshEnrollments };
}
