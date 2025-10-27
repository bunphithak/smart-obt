import { useState, useEffect } from 'react';
import { ASSET_STATUS, ASSET_STATUS_LABELS } from '../lib/constants';
import MapModal from './MapModal';

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
  const [generatingCode, setGeneratingCode] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (asset) {
      // แปลง purchase_date เป็นรูปแบบ YYYY-MM-DD สำหรับ input type="date"
      const formattedAsset = {
        ...asset,
        purchaseDate: asset.purchaseDate 
          ? new Date(asset.purchaseDate).toISOString().split('T')[0] 
          : '',
        category: asset.categoryId || asset.category || '' // Map categoryId to category field
      };
      setFormData(formattedAsset);
      
      // Load existing images if any
      if (asset.images) {
        const imageArray = Array.isArray(asset.images) ? asset.images : JSON.parse(asset.images);
        setImages(imageArray.map(url => ({ url, preview: url })));
      }
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate code when category is selected (only for new assets)
    if (name === 'category' && value && !asset) {
      generateAssetCode(value);
    }
  };

  const generateAssetCode = async (categoryId) => {
    if (!categoryId) return;
    
    setGeneratingCode(true);
    try {
      const res = await fetch(`/api/assets/generate-code?categoryId=${categoryId}`);
      const data = await res.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          code: data.data.code
        }));
      } else {
        console.error('Error generating code:', data.error);
      }
    } catch (error) {
      console.error('Error generating asset code:', error);
    } finally {
      setGeneratingCode(false);
    }
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.code || !formData.villageId) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    
    // Upload images first if there are new files
    if (images.some(img => img.file)) {
      setUploading(true);
      try {
        const uploadedUrls = [];
        for (const image of images) {
          if (image.file) {
            const formData = new FormData();
            formData.append('file', image.file);
            
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
              uploadedUrls.push(uploadData.url);
            }
          } else if (image.url) {
            uploadedUrls.push(image.url);
          }
        }
        
        // Transform category to categoryId for API
        const submitData = {
          ...formData,
          categoryId: formData.category,
          images: uploadedUrls
        };
        onSubmit(submitData);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        setUploading(false);
      }
    } else {
      // No new images, submit existing data
      const submitData = {
        ...formData,
        categoryId: formData.category,
        images: images.map(img => img.url).filter(Boolean)
      };
      onSubmit(submitData);
    }
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
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น เสาไฟส่องสว่าง"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมวดหมู่ <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกหมวดหมู่</option>
          {categories.filter(cat => cat.isActive).map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
          disabled={true}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder={generatingCode ? "กำลังสร้างรหัส..." : "รหัสทรัพย์สิน"}
        />
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
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={ASSET_STATUS.AVAILABLE}>{ASSET_STATUS_LABELS[ASSET_STATUS.AVAILABLE]}</option>
          <option value={ASSET_STATUS.DAMAGED}>{ASSET_STATUS_LABELS[ASSET_STATUS.DAMAGED]}</option>
          <option value={ASSET_STATUS.DETERIORATED}>{ASSET_STATUS_LABELS[ASSET_STATUS.DETERIORATED]}</option>
          <option value={ASSET_STATUS.LOST}>{ASSET_STATUS_LABELS[ASSET_STATUS.LOST]}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="min-w-0 overflow-hidden">
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
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เช่น 2500"
          />
        </div>

        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่ซื้อ <span className="text-xs text-gray-500 font-normal">(คลิกเพื่อเลือกวันที่)</span>
          </label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            style={{ maxWidth: '100%' }}
            className="w-full min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น สำนักงานใหญ่, ห้องประชุม, ห้อง 301"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ที่อยู่ / เลือกตำแหน่งบนแผนที่
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ระบุที่อยู่ หรือคลิก 'ปักหมุด' เพื่อเลือกจากแผนที่"
          />
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="รายละเอียดเพิ่มเติม..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รูปภาพทรัพย์สิน
        </label>
        <div className="space-y-4">
          <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm sm:text-base text-gray-600">คลิกเพื่ออัปโหลดรูปภาพ</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal(image)}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'กำลังอัปโหลด...' : (asset ? 'บันทึกการแก้ไข' : 'เพิ่มทรัพย์สิน')}
        </button>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        initialAddress={formData.locationAddress}
        onConfirm={handleLocationSelect}
        showQuickUseButton={true}
      />

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage.preview}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </form>
  );
}

