'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

type Location = {
    id: number;
    lat: number;
    lng: number;
    name: string;
    order: number;
}

type MapProps = {
    locations: Location[];
};

export default function Map({ locations }: MapProps) {
    // Функция создания иконки с номером
    const createNumberedIcon = (number: number) =>
    L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-number">${number}</div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
    });

    locations.sort((a, b) => a.order - b.order); // Сортируем по порядку

    return (
        <MapContainer center={[0, 0]} zoom={1} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location) => (
                <>
                <Marker 
                key={location.id} 
                position={[location.lat, location.lng]} 
                icon={createNumberedIcon(location.order)}
                >
                    <Popup>{location.name}</Popup>
                </Marker>

                <Polyline
                    positions={locations.map(l => [l.lat, l.lng])}
                    pathOptions={{ color: 'blue', weight: 4 }}
                />
                </>
            ))}
        </MapContainer>
  );
}
