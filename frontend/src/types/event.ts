export type EventType = "competencia" | "ciclovia" | "ruta_recreativa";
export type EventStatus = "activo" | "finalizado" | "cancelado";
export type EnrollmentStatus = "confirmado" | "cancelado";

export const EVENT_TYPES: EventType[] = [
  "competencia",
  "ciclovia",
  "ruta_recreativa",
];
export const EVENT_STATUSES: EventStatus[] = [
  "activo",
  "finalizado",
  "cancelado",
];

export interface Event {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: EventType;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EventStatus;
  ubicacion?: string;
  capacidad_maxima: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreate {
  nombre: string;
  descripcion?: string;
  tipo: EventType;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: EventStatus;
  ubicacion?: string;
  capacidad_maxima: number;
}

export interface EventUpdate {
  nombre?: string;
  descripcion?: string;
  tipo?: EventType;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EventStatus;
  ubicacion?: string;
  capacidad_maxima?: number;
}

export interface Enrollment {
  id: number;
  event_id: number;
  user_id: string;
  fecha_inscripcion: string;
  estado: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentCreate {
  user_id: string;
}
