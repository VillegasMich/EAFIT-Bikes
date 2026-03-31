import { Fragment, useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { useEnrollments } from "../hooks/useEnrollments";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "../contexts/AuthContext";
import type { Event, EventCreate, EventType, EventStatus } from "../types/event";
import { EVENT_TYPES, EVENT_STATUSES } from "../types/event";
import axios from "axios";

type TypeFilter = "all" | EventType;
type StatusFilter = "all" | EventStatus;

const TYPE_LABELS: Record<EventType, string> = {
  competencia: "Competencia",
  ciclovia: "Ciclovia",
  ruta_recreativa: "Ruta Recreativa",
};

const STATUS_LABELS: Record<EventStatus, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const emptyForm: EventCreate = {
  nombre: "",
  descripcion: "",
  tipo: "competencia",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "activo",
  ubicacion: "",
  capacidad_maxima: 1,
};

function EnrollmentPanel({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { enrollments, loading, enroll, cancel } = useEnrollments(event.id);
  const { addNotification } = useNotification();
  const [enrolling, setEnrolling] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const confirmedCount = enrollments.filter(
    (e) => e.estado === "confirmado",
  ).length;

  async function handleEnroll() {
    setEnrolling(true);
    try {
      await enroll(user?.uid ?? "anonymous");
      addNotification("Enrolled successfully", "success");
    } catch (err) {
      let message = "Failed to enroll";
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        const apiError: string = err.response.data.error;
        if (apiError.includes("capacity") || apiError.includes("full")) {
          message = "Event is full";
        } else if (
          apiError.includes("already") ||
          apiError.includes("enrolled")
        ) {
          message = "You are already enrolled in this event";
        } else if (apiError.includes("inactive") || apiError.includes("activo")) {
          message = "Event is not active";
        } else {
          message = apiError;
        }
      }
      addNotification(message, "error");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleCancel(enrollmentId: number) {
    setCancellingId(enrollmentId);
    try {
      await cancel(enrollmentId);
      addNotification("Enrollment cancelled", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel enrollment";
      addNotification(message, "error");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="border-t bg-blue-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Enrollments — {confirmedCount} / {event.capacidad_maxima} spots taken
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {enrolling ? "Enrolling..." : "Enroll Me"}
          </button>
          <button
            onClick={onClose}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading enrollments...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-gray-500">No enrollments yet.</p>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b bg-blue-100">
              <th className="px-3 py-1">User ID</th>
              <th className="px-3 py-1">Date</th>
              <th className="px-3 py-1">Status</th>
              <th className="px-3 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="border-b hover:bg-blue-50">
                <td className="px-3 py-1 font-mono text-xs">
                  {enrollment.user_id}
                </td>
                <td className="px-3 py-1">
                  {new Date(enrollment.fecha_inscripcion).toLocaleDateString()}
                </td>
                <td className="px-3 py-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      enrollment.estado === "confirmado"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {enrollment.estado}
                  </span>
                </td>
                <td className="px-3 py-1">
                  {enrollment.estado === "confirmado" && (
                    <button
                      onClick={() => handleCancel(enrollment.id)}
                      disabled={cancellingId === enrollment.id}
                      className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {cancellingId === enrollment.id
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Events() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } =
    useEvents();
  const { addNotification } = useNotification();

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventCreate>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  function openCreate() {
    setEditingEvent(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setForm({
      nombre: event.nombre,
      descripcion: event.descripcion ?? "",
      tipo: event.tipo,
      fecha_inicio: event.fecha_inicio.slice(0, 10),
      fecha_fin: event.fecha_fin.slice(0, 10),
      estado: event.estado,
      ubicacion: event.ubicacion ?? "",
      capacidad_maxima: event.capacidad_maxima,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.fecha_fin <= form.fecha_inicio) {
      setFormError("End date must be after start date");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form);
        addNotification("Event updated successfully", "success");
      } else {
        await createEvent(form);
        addNotification("Event created successfully", "success");
      }
      closeForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      addNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    try {
      await deleteEvent(id);
      addNotification("Event deleted successfully", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete event";
      addNotification(message, "error");
    } finally {
      setDeletingId(null);
      setSubmitting(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    if (typeFilter !== "all" && event.tipo !== typeFilter) return false;
    if (statusFilter !== "all" && event.estado !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Event
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded border border-gray-200 bg-gray-50 p-4"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingEvent ? "Edit Event" : "New Event"}
          </h2>
          {formError && (
            <p className="mb-3 text-sm text-red-600">{formError}</p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select
                required
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as EventType })
                }
                className="w-full rounded border px-3 py-2"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Estado</label>
              <select
                value={form.estado}
                onChange={(e) =>
                  setForm({ ...form, estado: e.target.value as EventStatus })
                }
                className="w-full rounded border px-3 py-2"
              >
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Fecha Inicio
              </label>
              <input
                type="date"
                required
                value={form.fecha_inicio}
                onChange={(e) =>
                  setForm({ ...form, fecha_inicio: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Fecha Fin
              </label>
              <input
                type="date"
                required
                value={form.fecha_fin}
                onChange={(e) =>
                  setForm({ ...form, fecha_fin: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Capacidad Máxima
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.capacidad_maxima}
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacidad_maxima: parseInt(e.target.value, 10),
                  })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Ubicación
              </label>
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) =>
                  setForm({ ...form, ubicacion: e.target.value })
                }
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                rows={2}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Type filter tabs */}
        <div className="flex gap-1 border-b">
          {(["all", ...EVENT_TYPES] as TypeFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                typeFilter === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all" ? "All Types" : TYPE_LABELS[tab]}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded border px-3 py-1 text-sm"
        >
          <option value="all">All Statuses</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">
          {events.length === 0
            ? "No events found. Add one to get started."
            : "No events match the selected filters."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Inicio</th>
                <th className="px-4 py-2">Fin</th>
                <th className="px-4 py-2">Ubicación</th>
                <th className="px-4 py-2">Capacidad</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <Fragment key={event.id}>
                  <tr
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 font-medium">{event.nombre}</td>
                    <td className="px-4 py-2">{TYPE_LABELS[event.tipo]}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.estado === "activo"
                            ? "bg-green-100 text-green-700"
                            : event.estado === "finalizado"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {STATUS_LABELS[event.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(event.fecha_inicio).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(event.fecha_fin).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {event.ubicacion ?? "—"}
                    </td>
                    <td className="px-4 py-2">{event.capacidad_maxima}</td>
                    <td className="flex flex-wrap gap-2 px-4 py-2">
                      <button
                        onClick={() =>
                          setExpandedEventId(
                            expandedEventId === event.id ? null : event.id,
                          )
                        }
                        className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        {expandedEventId === event.id
                          ? "Hide Enrollments"
                          : "Enrollments"}
                      </button>
                      <button
                        onClick={() => openEdit(event)}
                        className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      {deletingId === event.id ? (
                        <span className="flex gap-1">
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={submitting}
                            className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded border px-3 py-1 text-xs hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeletingId(event.id)}
                          className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedEventId === event.id && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <EnrollmentPanel
                          event={event}
                          onClose={() => setExpandedEventId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Events;
