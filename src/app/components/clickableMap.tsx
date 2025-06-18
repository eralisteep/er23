'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

type Props = {
  latLng: { lat: number; lng: number } | null;
  setLatLng: (val: { lat: number; lng: number }) => void;
};

function LocationMarker({ setLatLng }: { setLatLng: (latLng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Кастомная иконка: SVG 38x38px, красного цвета
const customIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
<svg fill="#e53935" width="38" height="38" viewBox="0 0 40 40" style="vertical-align: middle; display: block;">
  <g>
    <path d="m19.8 2.5c6.2 0 11.2 5 11.2 11.3 0 8.7-11.2 23.7-11.2 23.7s-11.3-15-11.3-23.7c0-6.3 5-11.3 11.3-11.3z m0 14.9c2 0 3.6-1.6 3.6-3.6s-1.6-3.7-3.6-3.7-3.7 1.6-3.7 3.7 1.6 3.6 3.7 3.6z"></path>
  </g>
</svg>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default function LocationMap({ latLng, setLatLng }: Props) {
  return (
    <MapContainer center={[0, 0]} zoom={1} style={{ height: '400px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker setLatLng={setLatLng} />
      {latLng && (
        <Marker position={[latLng.lat, latLng.lng]} icon={customIcon} />
      )}
    </MapContainer>
  );
}
