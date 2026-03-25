import React from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// UZ: Leaflet ikonlarini to'g'irlash (Webpack/Vite bilan bog'liq muammo uchun)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    data: {
        id: string;
        name: string;
        lat: number;
        lng: number;
        value: number;
        status: 'stable' | 'warning' | 'critical';
    }[];
}

const EpidemicMap: React.FC<MapProps> = ({ data }) => {
    // UZ: O'zbekiston markazi (Toshkent yaqini)
    const center: [number, number] = [41.311081, 69.240562];

    const getColor = (status: string) => {
        switch (status) {
            case 'critical': return '#ff4d4f';
            case 'warning': return '#faad14';
            default: return '#52c41a';
        }
    };

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
            <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {data.map((district) => (
                    <CircleMarker
                        key={district.id}
                        center={[district.lat, district.lng]}
                        pathOptions={{ 
                            fillColor: getColor(district.status), 
                            color: getColor(district.status),
                            fillOpacity: 0.6 
                        }}
                        radius={10 + (district.value / 2)}
                    >
                        <Popup>
                            <strong>{district.name}</strong><br />
                            Holat: {district.status.toUpperCase()}<br />
                            Ko'rsatkich: {district.value}
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default EpidemicMap;
