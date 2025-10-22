import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CSS to control Leaflet z-index
const leafletCSS = `
  .leaflet-container {
    z-index: 1 !important;
  }
  .leaflet-control-container {
    z-index: 1 !important;
  }
  .leaflet-popup {
    z-index: 1 !important;
  }
`;

// Fix Leaflet default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapViewer({ 
  lat, 
  lng, 
  title = 'ตำแหน่ง',
  description = '',
  zoom = 15,
  height = '400px'
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Inject CSS to control Leaflet z-index
    const style = document.createElement('style');
    style.textContent = leafletCSS;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // แปลง lat/lng เป็น number
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!mounted || !latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div 
        className="w-full bg-gray-100 flex items-center justify-center rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">
          {!lat || !lng ? 'ไม่มีข้อมูลตำแหน่ง' : 'กำลังโหลดแผนที่...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300" style={{ height, zIndex: 1 }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm">
              <strong>{title}</strong>
              {description && (
                <>
                  <br />
                  <span className="text-gray-600">{description}</span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

