import type { LocationResponse, LocationsQueryParams } from "../types/location";
import client from "./client";

export async function getLocations(
  params?: LocationsQueryParams,
): Promise<LocationResponse[]> {
  const response = await client.get<LocationResponse[]>("/locations", {
    params,
  });
  return response.data;
}
