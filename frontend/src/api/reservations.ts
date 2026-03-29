import axios from "axios";
import type {
  ReservationResponse,
  ReservationCreate,
  ConflictResponse,
} from "../types/reservation";
import reservationsClient from "./reservationsClient";

export class ReservationConflictError extends Error {
  conflict: ConflictResponse;
  constructor(conflict: ConflictResponse) {
    super(conflict.message);
    this.name = "ReservationConflictError";
    this.conflict = conflict;
  }
}

export async function getReservations(): Promise<ReservationResponse[]> {
  const response = await reservationsClient.get<ReservationResponse[]>("/reservations");
  return response.data;
}

export async function getReservationsByBike(bikeId: string): Promise<ReservationResponse[]> {
  const response = await reservationsClient.get<ReservationResponse[]>(
    `/reservations/bike/${bikeId}`
  );
  return response.data;
}

export async function createReservation(
  data: ReservationCreate
): Promise<ReservationResponse> {
  try {
    const response = await reservationsClient.post<ReservationResponse>(
      "/reservations",
      data
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      throw new ReservationConflictError(err.response.data as ConflictResponse);
    }
    throw err;
  }
}
