import { useState } from "react";
import { useBikes } from "../hooks/useBikes";
import { useReservations } from "../hooks/useReservations";
import { useNotification } from "../hooks/useNotification";
import { useAuth } from "../contexts/AuthContext";
import ReservationModal from "../components/ReservationModal";
import type { Bike, BikeCreate, BikeType } from "../types/bike";
import { BIKE_TYPES } from "../types/bike";

type FilterTab = "all" | "reserved" | "available";

const emptyForm: BikeCreate = { marca: "", tipo: "Cross", color: "" };

function Bikes() {
  const { bikes, loading, error, createBike, updateBike, deleteBike } =
    useBikes();
  const { isBikeReserved, refreshReservations } = useReservations();
  const { addNotification } = useNotification();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [form, setForm] = useState<BikeCreate>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reservingBikeId, setReservingBikeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  function openCreate() {
    setEditingBike(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(bike: Bike) {
    setEditingBike(bike);
    setForm({ marca: bike.marca, tipo: bike.tipo, color: bike.color });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingBike(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBike) {
        await updateBike(editingBike.id, form);
        addNotification("Bike updated successfully", "success");
      } else {
        await createBike(form);
        addNotification("Bike created successfully", "success");
      }
      closeForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Operation failed";
      addNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setSubmitting(true);
    try {
      await deleteBike(id);
      addNotification("Bike deleted successfully", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete bike";
      addNotification(message, "error");
    } finally {
      setDeletingId(null);
      setSubmitting(false);
    }
  }

  const filteredBikes = bikes.filter((bike) => {
    if (activeTab === "reserved") return isBikeReserved(bike.id);
    if (activeTab === "available") return !isBikeReserved(bike.id);
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Loading bikes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error loading bikes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Bike
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded border border-gray-200 bg-gray-50 p-4"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingBike ? "Edit Bike" : "New Bike"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Marca</label>
              <input
                type="text"
                required
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select
                required
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as BikeType })
                }
                className="w-full rounded border px-3 py-2"
              >
                {BIKE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Color</label>
              <input
                type="text"
                required
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
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

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1 border-b">
        {(["all", "reserved", "available"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredBikes.length === 0 ? (
        <p className="text-center text-gray-500">
          {bikes.length === 0
            ? "No bikes found. Add one to get started."
            : "No bikes match the selected filter."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Marca</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Color</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBikes.map((bike) => {
                const reserved = isBikeReserved(bike.id);
                return (
                  <tr key={bike.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{bike.id}</td>
                    <td className="px-4 py-2">{bike.marca}</td>
                    <td className="px-4 py-2">{bike.tipo}</td>
                    <td className="px-4 py-2">{bike.color}</td>
                    <td className="px-4 py-2">
                      {reserved ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          Reserved
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="flex flex-wrap gap-2 px-4 py-2">
                      <button
                        onClick={() => openEdit(bike)}
                        className="rounded bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setReservingBikeId(String(bike.id))}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                      >
                        Reserve
                      </button>
                      {deletingId === bike.id ? (
                        <span className="flex gap-1">
                          <button
                            onClick={() => handleDelete(bike.id)}
                            disabled={submitting}
                            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeletingId(bike.id)}
                          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservation Modal */}
      {reservingBikeId !== null && (
        <ReservationModal
          bikeId={reservingBikeId}
          userId={user?.uid ?? "anonymous"}
          onClose={() => setReservingBikeId(null)}
          onSuccess={() => {
            refreshReservations();
            setReservingBikeId(null);
          }}
        />
      )}
    </div>
  );
}

export default Bikes;
