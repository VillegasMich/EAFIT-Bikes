import type {
  Event,
  EventCreate,
  EventUpdate,
  EventType,
  EventStatus,
  Enrollment,
  EnrollmentCreate,
} from "../types/event";
import eventsClient from "./eventsClient";

export interface EventFilters {
  tipo?: EventType;
  estado?: EventStatus;
  fecha_inicio?: string;
}

export async function getEvents(filters?: EventFilters): Promise<Event[]> {
  const response = await eventsClient.get<Event[]>("/events", {
    params: filters,
  });
  return response.data;
}

export async function getEvent(id: number): Promise<Event> {
  const response = await eventsClient.get<Event>(`/events/${id}`);
  return response.data;
}

export async function createEvent(data: EventCreate): Promise<Event> {
  const response = await eventsClient.post<Event>("/events", data);
  return response.data;
}

export async function updateEvent(
  id: number,
  data: EventUpdate,
): Promise<Event> {
  const response = await eventsClient.put<Event>(`/events/${id}`, data);
  return response.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await eventsClient.delete(`/events/${id}`);
}

export async function getEnrollments(eventId: number): Promise<Enrollment[]> {
  const response = await eventsClient.get<Enrollment[]>(
    `/events/${eventId}/enrollments`,
  );
  return response.data;
}

export async function createEnrollment(
  eventId: number,
  data: EnrollmentCreate,
): Promise<Enrollment> {
  const response = await eventsClient.post<Enrollment>(
    `/events/${eventId}/enrollments`,
    data,
  );
  return response.data;
}

export async function cancelEnrollment(
  eventId: number,
  enrollmentId: number,
): Promise<Enrollment> {
  const response = await eventsClient.delete<Enrollment>(
    `/events/${eventId}/enrollments/${enrollmentId}`,
  );
  return response.data;
}
