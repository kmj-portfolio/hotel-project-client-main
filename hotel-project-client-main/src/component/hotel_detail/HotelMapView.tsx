import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { HotelDetail } from '@/types/hotel';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function HotelMapView({ hotelDetail }: { hotelDetail: HotelDetail }) {
  const position: [number, number] = [hotelDetail.latitude, hotelDetail.longitude];

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">위치</h2>
      <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
        <svg className="h-4 w-4 shrink-0 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        {hotelDetail.address}
      </p>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{hotelDetail.name}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
