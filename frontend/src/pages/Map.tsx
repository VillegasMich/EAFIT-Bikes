import { useEffect } from "react";
import { getLocations } from "../api/locations";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const EAFIT_CENTER: [number, number] = [6.2006, -75.5783];
const DEFAULT_ZOOM = 15;

function Map() {
  useEffect(() => {
    getLocations({ latest: true })
      .then((data) => console.log("Locations response:", data))
      .catch((err) => console.error("Failed to fetch locations:", err));
  }, []);

  return (
    <div className="relative flex-1">
      <MapContainer
        center={EAFIT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="absolute inset-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={EAFIT_CENTER} icon={defaultIcon}>
          <Popup>EAFIT University</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Map;
