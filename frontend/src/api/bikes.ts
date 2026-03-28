import type { Bike, BikeCreate, BikeUpdate } from "../types/bike";
import client from "./client";

export async function getBikes(): Promise<Bike[]> {
  const response = await client.get<Bike[]>("/bikes");
  return response.data;
}

export async function getBike(id: number): Promise<Bike> {
  const response = await client.get<Bike>(`/bikes/${id}`);
  return response.data;
}

export async function createBike(data: BikeCreate): Promise<Bike> {
  const response = await client.post<Bike>("/bikes", data);
  return response.data;
}

export async function updateBike(id: number, data: BikeUpdate): Promise<Bike> {
  const response = await client.put<Bike>(`/bikes/${id}`, data);
  return response.data;
}

export async function deleteBike(id: number): Promise<void> {
  await client.delete(`/bikes/${id}`);
}
