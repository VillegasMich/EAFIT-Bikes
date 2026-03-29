import { useCallback, useEffect, useState } from "react";
import * as eventsApi from "../api/events";
import type { Event, EventCreate, EventUpdate } from "../types/event";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshEvents = useCallback(async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const createEvent = useCallback(
    async (data: EventCreate) => {
      await eventsApi.createEvent(data);
      await refreshEvents();
    },
    [refreshEvents],
  );

  const updateEvent = useCallback(
    async (id: number, data: EventUpdate) => {
      await eventsApi.updateEvent(id, data);
      await refreshEvents();
    },
    [refreshEvents],
  );

  const deleteEvent = useCallback(
    async (id: number) => {
      await eventsApi.deleteEvent(id);
      await refreshEvents();
    },
    [refreshEvents],
  );

  return { events, loading, error, createEvent, updateEvent, deleteEvent, refreshEvents };
}
