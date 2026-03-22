import L from "leaflet";
import { Marker } from "react-leaflet";
import type { LocationResponse } from "../types/location";

function createBikeIcon(label: string) {
  return new L.DivIcon({
    html: `<div style="
      background: #3b82f6;
      color: #ef4444;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${label}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

interface BikeMarkerProps {
  location: LocationResponse;
  index: number;
}

function BikeMarker({ location, index }: BikeMarkerProps) {
  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={createBikeIcon(`B${index + 1}`)}
    />
  );
}

export default BikeMarker;
