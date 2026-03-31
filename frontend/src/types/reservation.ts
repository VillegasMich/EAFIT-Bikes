export interface ReservationResponse {
  id: string;
  bike_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationCreate {
  bike_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
}

export interface ReservationUpdate {
  start_date?: string;
  end_date?: string;
}

export interface ConflictResponse {
  status: "conflict";
  message: string;
  bike_id: string;
  requested_start: string;
  requested_end: string;
  conflicting_reservations: ReservationResponse[];
}
