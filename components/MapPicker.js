import { useState, useEffect, useRef, useMemo } from 'react';
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

function LocationMarker({ position, setPosition, onPositionChange, readonly = false }) {
  const markerRef = useRef(null);
  
  useMapEvents({
    click(e) {
      if (!readonly) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        // เรียก callback ทันทีเมื่อคลิกบนแผนที่
        if (onPositionChange) {
          onPositionChange(newPos);
        }
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        if (!readonly) {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            const posArray = [newPos.lat, newPos.lng];
            setPosition(posArray);
            // เรียก callback ทันทีเมื่อลากหมุด
            if (onPositionChange) {
              onPositionChange(posArray);
            }
          }
        }
      },
    }),
    [setPosition, onPositionChange, readonly],
  );

  return position ? (
    <Marker 
      position={position} 
      draggable={!readonly}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  ) : null;
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

export default function MapPicker({ initialLat, initialLng, onLocationSelect, readonly = false, showButtons = true }) {
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

  // Update position when initial coordinates change
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

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

  // Helper function สำหรับเรียก onLocationSelect
  const handlePositionChange = (newPos) => {
    if (newPos && newPos[0] && newPos[1]) {
      const address = `${newPos[0].toFixed(6)}, ${newPos[1].toFixed(6)}`;
      onLocationSelect(newPos[0], newPos[1], address);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(currentPos);
          // ใช้ helper function
          handlePositionChange(currentPos);
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
          <strong>💡 วิธีใช้งาน:</strong> ค้นหา คลิกบนแผนที่ หรือลากหมุดไปยังตำแหน่งที่ต้องการ (อัปเดตทันที)
        </p>
        {position && (
          <p className="text-sm text-blue-700 mt-1">
            📍 พิกัดที่เลือก: <strong>{Number(position[0]).toFixed(6)}, {Number(position[1]).toFixed(6)}</strong>
          </p>
        )}
      </div>

      {/* Search Box */}
      <div className="mb-3">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
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

        </div>
      </div>
      
      <div className="mb-3 relative">

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
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onPositionChange={readonly ? undefined : handlePositionChange}
            readonly={readonly}
          />
          <MapUpdater center={position} zoom={mapZoom} />
        </MapContainer>
      </div>

      {showButtons && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              // ใช้ตำแหน่งปัจจุบันจาก marker
              if (position && position[0] && position[1]) {
                handlePositionChange(position);
              }
            }}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors shadow-md whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ใช้ตำแหน่ง
          </button>
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-md whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ใช้ตำแหน่งปัจจุบัน
          </button>
        </div>
      )}


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
