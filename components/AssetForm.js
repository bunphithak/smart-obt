import { useState, useEffect } from 'react';
import { ASSET_STATUS, ASSET_STATUS_LABELS } from '../lib/constants';
import dynamic from 'next/dynamic';

// Import Map component with SSR disabled
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

export default function AssetForm({ asset, villages, categories = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    villageId: '',
    description: '',
    status: ASSET_STATUS.AVAILABLE,
    value: '',
    purchaseDate: '',
    locationName: '',
    locationAddress: '',
    latitude: null,
    longitude: null
  });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (asset) {
      // แปลง purchase_date เป็นรูปแบบ YYYY-MM-DD สำหรับ input type="date"
      const formattedAsset = {
        ...asset,
        purchaseDate: asset.purchaseDate 
          ? new Date(asset.purchaseDate).toISOString().split('T')[0] 
          : ''
      };
      setFormData(formattedAsset);
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      locationAddress: address || ''
    }));
    setShowMap(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อทรัพย์สิน <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น โต๊ะทำงาน"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รหัสทรัพย์สิน <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          disabled={!!asset}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="เช่น AST-001"
        />
      </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 หมวดหมู่
               </label>
               <select
                 name="category"
                 value={formData.category}
                 onChange={handleChange}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="">เลือกหมวดหมู่</option>
             {categories.filter(cat => cat.isActive).map(category => (
               <option key={category.id} value={category.name}>
                 {category.name}
               </option>
             ))}
               </select>
             </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมู่บ้าน <span className="text-red-500">*</span>
        </label>
        <select
          name="villageId"
          value={formData.villageId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกหมู่บ้าน</option>
          {villages && villages.map(village => (
            <option key={village.id} value={village.id}>
              {village.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          สถานะ
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ASSET_STATUS.AVAILABLE}>{ASSET_STATUS_LABELS[ASSET_STATUS.AVAILABLE]}</option>
          <option value={ASSET_STATUS.DAMAGED}>{ASSET_STATUS_LABELS[ASSET_STATUS.DAMAGED]}</option>
          <option value={ASSET_STATUS.DETERIORATED}>{ASSET_STATUS_LABELS[ASSET_STATUS.DETERIORATED]}</option>
          <option value={ASSET_STATUS.LOST}>{ASSET_STATUS_LABELS[ASSET_STATUS.LOST]}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            มูลค่า (บาท)
          </label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น 2500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่ซื้อ
          </label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อสถานที่ติดตั้ง
        </label>
        <input
          type="text"
          name="locationName"
          value={formData.locationName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น สำนักงานใหญ่, ห้องประชุม, ห้อง 301"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ที่อยู่ / เลือกตำแหน่งบนแผนที่
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ระบุที่อยู่ หรือคลิก 'ปักหมุด' เพื่อเลือกจากแผนที่"
          />
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ปักหมุด
          </button>
        </div>
        {formData.latitude && formData.longitude && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <strong>พิกัดที่เลือก:</strong> {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รายละเอียด
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="รายละเอียดเพิ่มเติม..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-md hover:shadow-lg"
        >
          {asset ? 'บันทึกการแก้ไข' : 'เพิ่มทรัพย์สิน'}
        </button>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">เลือกตำแหน่งบนแผนที่</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <MapPicker
                initialLat={formData.latitude || 13.7563}
                initialLng={formData.longitude || 100.5018}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

