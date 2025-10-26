import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import SuccessModal from '../../components/SuccessModal';

const MapPicker = dynamic(() => import('../../components/MapPicker'), {
  ssr: false,
  loading: () => <p>กำลังโหลดแผนที่...</p>
});

export default function RepairForm() {
  const router = useRouter();
  const { villageId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [location, setLocation] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [villageName, setVillageName] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [assetCode, setAssetCode] = useState('');
  const [categories, setCategories] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [villages, setVillages] = useState([]);
  const [selectedVillageId, setSelectedVillageId] = useState(villageId || '');
  
  const [formData, setFormData] = useState({
    categoryId: '',
    problemType: '',
    description: '',
    location: '',
    reporterName: '',
    reporterPhone: '',
    images: [],
    coordinates: null,
    villageId: villageId || ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchVillageName = useCallback(async () => {
    try {
      const res = await fetch(`/api/villages?id=${villageId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setVillageName(data.data[0].name);
      }
    } catch (fetchError) {
      console.error('Error fetching village:', fetchError);
    }
  }, [villageId]);

  const fetchVillages = useCallback(async () => {
    try {
      const res = await fetch('/api/villages');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setVillages(data.data.filter(v => v.isActive !== false));
      }
    } catch (fetchError) {
      console.error('Error fetching villages:', fetchError);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCategories(data.data);
      }
    } catch (fetchError) {
      console.error('Error fetching categories:', fetchError);
    }
  }, []);

  const fetchProblemTypes = useCallback(async (categoryId) => {
    if (!categoryId) {
      setProblemTypes([]);
      return;
    }
    try {
      const res = await fetch('/api/problem-types');
      const data = await res.json();
      console.log('📋 Problem Types API Response:', data);
      if (data.success) {
        const filtered = data.data.filter(pt => {
          const categoryMatch = String(pt.categoryId) === String(categoryId);
          const isActive = pt.isActive !== false;
          console.log('🎯 Checking:', { ptName: pt.name, ptCategoryId: pt.categoryId, searchCategoryId: categoryId, categoryMatch, isActive, result: categoryMatch && isActive });
          return categoryMatch && isActive;
        });
        console.log('🔍 Filtered Problem Types:', { categoryId, filtered });
        setProblemTypes(filtered);
      }
    } catch (error) {
      console.error('Error fetching problem types:', error);
    }
  }, []);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setFormData(prev => ({ 
      ...prev, 
      categoryId: categoryId,
      problemType: '' 
    }));
    fetchProblemTypes(categoryId);
  };

  const handleVillageChange = (e) => {
    const villageIdValue = e.target.value;
    setSelectedVillageId(villageIdValue);
    setFormData(prev => ({ 
      ...prev, 
      villageId: villageIdValue
    }));
  };

  useEffect(() => {
    if (isClient) {
      getLocation();
      fetchCategories();
      fetchVillages();
      if (villageId) {
        fetchVillageName();
        setSelectedVillageId(villageId);
        setFormData(prev => ({ ...prev, villageId: villageId }));
      }
      setLoading(false);
    }
  }, [isClient, villageId, fetchVillageName, fetchCategories, fetchVillages]);

  const getLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format phone number
    if (name === 'reporterPhone') {
      // Remove all non-digits
      let phone = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      if (phone.length > 10) {
        phone = phone.slice(0, 10);
      }
      
      // Format as 0XX-XXX-XXXX
      if (phone.length > 6) {
        phone = phone.slice(0, 3) + '-' + phone.slice(3, 6) + '-' + phone.slice(6);
      } else if (phone.length > 3) {
        phone = phone.slice(0, 3) + '-' + phone.slice(3);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: phone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      coordinates: { lat, lng },
      locationAddress: address
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const capturePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleImageUpload;
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submitted!');
    setSubmitting(true);

    try {
      console.log('📝 Form data:', formData);
      console.log('📍 Coordinates:', formData.coordinates);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('assetCode', assetCode);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('problemType', formData.problemType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('reporterName', formData.reporterName);
      formDataToSend.append('reporterPhone', formData.reporterPhone);
      formDataToSend.append('timestamp', new Date().toISOString());
      formDataToSend.append('reportType', 'repair');
      
      // Use formData.villageId if selected, otherwise use URL villageId
      const selectedVillageIdValue = formData.villageId || villageId;
      if (selectedVillageIdValue) {
        formDataToSend.append('villageId', selectedVillageIdValue);
      }
      
      // Use pin location if available, otherwise use GPS location
      const locationToSend = formData.coordinates || location;
      if (locationToSend) {
        formDataToSend.append('gpsLocation', JSON.stringify(locationToSend));
      }
      
      // Send coordinates separately if available
      if (formData.coordinates) {
        formDataToSend.append('coordinates', JSON.stringify(formData.coordinates));
      }
      
      // Send referrer URL
      formDataToSend.append('referrerUrl', '/public/request');

      // Append images
      formData.images.forEach((imageObj) => {
        formDataToSend.append(`images`, imageObj.file);
      });

      console.log('📤 Sending request to /api/reports...');
      
      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('📥 Response status:', res.status);
      const data = await res.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        console.log('✅ Success! Ticket ID:', data.ticketId);
        setTicketId(data.ticketId);
        setShowSuccessModal(true);
      } else {
        console.error('❌ API Error:', data.message);
        showAlert('error', 'เกิดข้อผิดพลาด', data.message || data.error);
      }
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง';
      
      if (error.name === 'AbortError') {
        errorMessage = 'การส่งข้อมูลใช้เวลานานเกินไป กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        console.error('❌ Request timeout after 30 seconds');
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า server กำลังทำงานอยู่';
        console.error('❌ Network error - server may be down');
      }
      
      showAlert('error', 'เกิดข้อผิดพลาด', errorMessage);
    } finally {
      console.log('✅ Submission complete, resetting submitting state');
      setSubmitting(false);
    }
  };

  if (loading || !isClient) {
    return (
      <>
        <Head>
          <title>กำลังโหลด - OBT Smart System</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>แจ้งซ่อม - OBT Smart System</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/images/abt-logo.png" alt="โลโก้ อบต.ละหาร" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Smart OBT</h1>
                  <p className="text-sm text-gray-600">อบต.ละหาร - แจ้งซ่อม</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/public/request')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                ← กลับ
              </button>
            </div>
          </div>
        </header>

        <div className="w-full px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">แจ้งซ่อมทรัพย์สิน</h1>
              {villageName && (
                <p className="text-lg font-semibold text-red-600 mb-2">{villageName}</p>
              )}
              <p className="text-gray-600">กรุณากรอกรายละเอียดการแจ้งซ่อม</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสทรัพย์สิน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="เช่น AST000001 (สามารถเว้นว่างได้หากไม่ทราบ)"
                  className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ถ้ามี QR Code สามารถสแกนหรือกรอกได้
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมู่บ้าน <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVillageId}
                  onChange={handleVillageChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">เลือกหมู่บ้าน</option>
                  {villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
                {villages.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    กำลังโหลดหมู่บ้าน...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ทรัพย์สิน <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    กำลังโหลดหมวดหมู่...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทปัญหา <span className="text-red-500">*</span>
                </label>
                <select
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleChange}
                  required
                  disabled={!selectedCategoryId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedCategoryId ? 'กรุณาเลือก' : 'กรุณาเลือกหมวดหมู่ก่อน'}
                  </option>
                  {problemTypes.map((problemType) => (
                    <option key={problemType.id} value={problemType.name}>
                      {problemType.name}
                    </option>
                  ))}
                </select>
                {selectedCategoryId && problemTypes.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ไม่มีประเภทปัญหาในหมวดหมู่นี้
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่ที่เกิดปัญหา *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="ระบุสถานที่ที่เกิดปัญหา"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Map Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ปักหมุดตำแหน่งบนแผนที่
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <MapPicker
                    initialLat={location?.latitude || 12.6807}
                    initialLng={location?.longitude || 101.2029}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                {formData.coordinates && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ ปักหมุดแล้ว: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  คลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่เกิดปัญหา
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดปัญหา *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="อธิบายปัญหาที่พบ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้แจ้ง *
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleChange}
                    required
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="tel"
                    name="reporterPhone"
                    value={formData.reporterPhone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    placeholder="08X-XXX-XXXX"
                    maxLength="12"
                    title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก เช่น 081-234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    รูปแบบ: 0XX-XXX-XXXX (10 หลัก)
                  </p>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพประกอบ (ไม่บังคับ)
                </label>
                <div className="space-y-4">
                  {/* Upload Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ถ่ายรูป
                    </button>
                    <label className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      เลือกไฟล์
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.images.map((imageObj, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageObj.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{imageObj.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
              </button>
            </form>


            <div className="mt-6 text-center text-sm text-gray-600">
              <p>หากมีข้อสงสัย โทร. 0-XXXX-XXXX</p>
              <p className="mt-1">เวลาทำการ: จันทร์-ศุกร์ 08:30-16:30 น.</p>
            </div>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    alertData.type === 'success' ? 'bg-green-100' :
                    alertData.type === 'error' ? 'bg-red-100' :
                    alertData.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alertData.type === 'success' && <span className="text-green-600 text-xl">✓</span>}
                    {alertData.type === 'error' && <span className="text-red-600 text-xl">✕</span>}
                    {alertData.type === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
                    {alertData.type === 'info' && <span className="text-blue-600 text-xl">ℹ</span>}
                  </div>
                  <h3 className={`text-lg font-semibold ${
                    alertData.type === 'success' ? 'text-green-800' :
                    alertData.type === 'error' ? 'text-red-800' :
                    alertData.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alertData.title}
                  </h3>
                </div>
                
                <p className={`text-sm ${
                  alertData.type === 'success' ? 'text-green-700' :
                  alertData.type === 'error' ? 'text-red-700' :
                  alertData.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                } mb-6`}>
                  {alertData.message}
                </p>
                
                <div className="flex justify-end">
                  <button
                    onClick={closeAlert}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                      alertData.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                      alertData.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                      alertData.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push('/public/request');
          }}
          ticketId={ticketId}
          reportType="repair"
          onCheckStatus={() => {
            setShowSuccessModal(false);
            router.push(`/track/${ticketId}`);
          }}
        />
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}

