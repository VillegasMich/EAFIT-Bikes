import { useState } from "react";
import { createReservation, ReservationConflictError } from "../api/reservations";
import { useNotification } from "../hooks/useNotification";

interface ReservationModalProps {
  bikeId: string;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ReservationModal({ bikeId, userId, onClose, onSuccess }: ReservationModalProps) {
  const { addNotification } = useNotification();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (endDate <= startDate) {
      setValidationError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      await createReservation({
        bike_id: bikeId,
        user_id: userId,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });
      addNotification("Reservation created successfully", "success");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ReservationConflictError) {
        const count = err.conflict.conflicting_reservations.length;
        addNotification(
          `Bike is already reserved: ${count} conflicting reservation${count > 1 ? "s" : ""} in that time range.`,
          "error",
        );
      } else {
        const message = err instanceof Error ? err.message : "Failed to create reservation";
        addNotification(message, "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Reserve Bike</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Bike ID</label>
            <input
              type="text"
              value={bikeId}
              readOnly
              className="w-full rounded border bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start Date & Time</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date & Time</label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          {validationError && (
            <p className="text-sm text-red-600">{validationError}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Reserving..." : "Reserve"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;
