export type BikeType = "Cross" | "Mountain bike" | "Ruta";

export const BIKE_TYPES: BikeType[] = ["Cross", "Mountain bike", "Ruta"];

export interface Bike {
  id: number;
  marca: string;
  tipo: BikeType;
  color: string;
}

export interface BikeCreate {
  marca: string;
  tipo: BikeType;
  color: string;
}

export interface BikeUpdate {
  marca?: string;
  tipo?: BikeType;
  color?: string;
}
