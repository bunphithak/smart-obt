import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import SuccessModal from '../../components/SuccessModal';

const MapPicker = dynamic(() => import('../../components/MapPicker'), {
  ssr: false,
  loading: () => <p>กำลังโหลดแผนที่...</p>
});

export default function RequestForm() {
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
  const [categories, setCategories] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    requestType: '',
    title: '',
    description: '',
    location: '',
    reporterName: '',
    reporterPhone: '',
    images: [],
    coordinates: null
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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (fetchError) {
      console.error('Error fetching categories:', fetchError);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      getLocation();
      fetchCategories();
      if (villageId) {
        fetchVillageName();
      }
      setLoading(false);
    }
  }, [isClient, villageId, fetchVillageName, fetchCategories]);

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
    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('problemType', formData.requestType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('reporterName', formData.reporterName);
      formDataToSend.append('reporterPhone', formData.reporterPhone);
      formDataToSend.append('timestamp', new Date().toISOString());
      formDataToSend.append('reportType', 'request');
      
      if (villageId) {
        formDataToSend.append('villageId', villageId);
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

      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await res.json();
      
      if (data.success) {
        setTicketId(data.ticketId);
        setShowSuccessModal(true);
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.message);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
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
        <title>ใบคำร้อง - OBT Smart System</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/images/abt-logo.png" alt="โลโก้ อบต.ละหาร" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Smart OBT</h1>
                  <p className="text-sm text-gray-600">อบต.ละหาร - ใบคำร้อง</p>
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
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ยื่นใบคำร้อง</h1>
              {villageName && (
                <p className="text-lg font-semibold text-purple-600 mb-2">{villageName}</p>
              )}
              <p className="text-gray-600">กรุณากรอกรายละเอียดคำร้องของท่าน</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดคำร้อง <span className="text-red-500">*</span>
                </label>
                <select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">เลือกหมวดคำร้อง</option>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ขอใช้สถานที่">ขอใช้สถานที่</option>
                      <option value="ขอหนังสือรับรอง">ขอหนังสือรับรอง</option>
                      <option value="ขอความช่วยเหลือ">ขอความช่วยเหลือ</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </>
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    กำลังโหลดประเภทคำร้อง...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อคำร้อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="เช่น ขอติดตั้งไฟส่องสว่างใหม่"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่/พื้นที่ที่เกี่ยวข้อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="ระบุสถานที่หรือพื้นที่"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  คลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่เกี่ยวข้อง
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดคำร้อง <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="กรุณาระบุรายละเอียด วัตถุประสงค์ และความต้องการของท่าน..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้ยื่นคำร้อง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleChange}
                    required
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    รูปแบบ: 0XX-XXX-XXXX (10 หลัก)
                  </p>
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เอกสาร/รูปภาพประกอบ (ไม่บังคับ)
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>หมายเหตุ:</strong> เจ้าหน้าที่จะพิจารณาและติดต่อกลับภายใน 3-5 วันทำการ
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {submitting ? 'กำลังส่ง...' : 'ยื่นคำร้อง'}
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
                {/* Icon and Title */}
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
                
                {/* Message */}
                <p className={`text-sm ${
                  alertData.type === 'success' ? 'text-green-700' :
                  alertData.type === 'error' ? 'text-red-700' :
                  alertData.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                } mb-6`}>
                  {alertData.message}
                </p>
                
                {/* Button */}
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
          reportType="request"
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

