import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AlertModal from './AlertModal';

// Fix Leaflet default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      console.log('🗺️ MapUpdater: flying to', center, 'zoom:', zoom);
      map.flyTo(center, zoom, {
        duration: 1.5 // Smooth animation
      });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPicker({ initialLat, initialLng, onLocationSelect }) {
  const [position, setPosition] = useState([initialLat || 13.7563, initialLng || 100.5018]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const searchTimeoutRef = useRef(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'error' });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Search location using Nominatim (OpenStreetMap)
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      // Add "ประเทศไทย" or "Thailand" to improve Thai location search
      const searchQuery = `${query}, ประเทศไทย`;
      console.log('🔍 Searching for:', searchQuery);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&accept-language=th`
      );
      const data = await response.json();
      console.log('📍 Search results:', data);
      
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleSelectResult = (result) => {
    console.log('🎯 Selected result:', result);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    console.log('📍 New position:', lat, lng);
    
    setPosition([lat, lng]);
    setMapZoom(16); // Zoom in when selecting search result
    setSearchQuery(result.display_name);
    setShowResults(false);
    
    // Force update after a small delay to ensure state is updated
    setTimeout(() => {
      setMapZoom(16);
      console.log('🔄 Map should update now');
    }, 100);
  };

  const handleConfirm = () => {
    if (position) {
      // Simple address format from coordinates
      const address = `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`;
      onLocationSelect(position[0], position[1], address);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          setAlertModal({
            isOpen: true,
            message: 'ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้: ' + error.message,
            type: 'error'
          });
        }
      );
    } else {
      setAlertModal({
        isOpen: true,
        message: 'เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง',
        type: 'warning'
      });
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">กำลังโหลดแผนที่...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 คำแนะนำ:</strong> ค้นหาสถานที่ด้านล่าง หรือคลิกบนแผนที่เพื่อปักหมุดตำแหน่ง
        </p>
        {position && (
          <p className="text-sm text-blue-700 mt-1">
            📍 พิกัดที่เลือก: <strong>{position[0].toFixed(6)}, {position[1].toFixed(6)}</strong>
          </p>
        )}
      </div>

      {/* Search Box */}
      <div className="mb-3 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            placeholder="🔍 ค้นหาสถานที่... (เช่น ระยอง, กรุงเทพ, สยาม, ม.เกษตร)"
            className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searching && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {(() => {
          console.log('Rendering search results:', { showResults, searchResults: searchResults.length, searchQuery });
          return null;
        })()}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-blue-500 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(result)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{result.display_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {result.lat}, {result.lon}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500">ไม่พบสถานที่ &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-gray-400 mt-1">ลองพิมพ์ชื่อเต็มๆ หรือเพิ่มคำว่า &quot;จังหวัด&quot;</p>
          </div>
        )}
      </div>

      <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapUpdater center={position} zoom={mapZoom} />
        </MapContainer>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          ใช้ตำแหน่งปัจจุบัน
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!position}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ยืนยันตำแหน่ง
        </button>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.type === 'error' ? 'เกิดข้อผิดพลาด' : 'แจ้งเตือน'}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
