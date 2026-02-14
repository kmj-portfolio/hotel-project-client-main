// MapView.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { HotelDetail } from '@/types/hotel';

// 안전하게 아이콘 설정
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
  return (
    <div className="flex w-full flex-col">
      <div className="text-primary-500 mb-2 text-2xl">위치</div>
      <MapContainer
        center={[37.5665, 126.978]}
        zoom={18}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[37.5665, 126.978]}>
          <Popup>{hotelDetail.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
