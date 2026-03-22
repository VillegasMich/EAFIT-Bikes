export interface LocationResponse {
  id: string;
  bicycle_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export interface LocationsQueryParams {
  latest?: boolean;
}
