import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamic import for MapPicker
const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">กำลังโหลดแผนที่...</div>
});

export default function MapModal({ 
  isOpen, 
  onClose, 
  initialLat, 
  initialLng, 
  initialAddress,
  onConfirm,
  showConfirmButton = true,
  readonly = false
}) {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');

  if (!isOpen) return null;

  const handleLocationSelect = (lat, lng, address) => {
    if (!readonly) {
      // เก็บค่าชั่วคราวไว้ ไม่เรียก callback ทันที
      setSelectedCoordinates({ lat, lng });
      setSelectedAddress(address || '');
    }
  };

  const handleConfirm = () => {
    if (selectedCoordinates) {
      if (onConfirm) {
        onConfirm(selectedCoordinates.lat, selectedCoordinates.lng, selectedAddress);
      }
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedCoordinates(null);
    setSelectedAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">เลือกตำแหน่งบนแผนที่</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-hidden">
          <MapPicker
            initialLat={selectedCoordinates?.lat || initialLat || 13.7563}
            initialLng={selectedCoordinates?.lng || initialLng || 100.5018}
            initialAddress={selectedAddress || initialAddress || ''}
            onLocationSelect={readonly ? undefined : handleLocationSelect}
            readonly={readonly}
          />
        </div>

        {showConfirmButton && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {selectedCoordinates 
                  ? `พิกัด: ${selectedCoordinates.lat.toFixed(6)}, ${selectedCoordinates.lng.toFixed(6)}` 
                  : 'คลิกบนแผนที่เพื่อเลือกตำแหน่ง'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedCoordinates}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ใช้ตำแหน่ง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

