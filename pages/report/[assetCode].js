import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SuccessModal from '../../components/SuccessModal';

export default function PublicReportForm() {
  const router = useRouter();
  const { assetCode } = router.query;
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [location, setLocation] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    problemType: '',
    description: '',
    reporterName: '',
    reporterPhone: '',
    images: []
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAssetInfo = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets?code=${assetCode}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAsset(data.data[0]);
      }
      setLoading(false);
    } catch (fetchError) {
      console.error('Error fetching asset:', fetchError);
      setLoading(false);
    }
  }, [assetCode]);

  useEffect(() => {
    if (isClient && assetCode) {
      fetchAssetInfo();
      getLocation();
    }
  }, [isClient, assetCode, fetchAssetInfo]);

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
      formDataToSend.append('assetCode', assetCode);
      formDataToSend.append('problemType', formData.problemType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('reporterName', formData.reporterName);
      formDataToSend.append('reporterPhone', formData.reporterPhone);
      formDataToSend.append('reportType', 'repair');
      formDataToSend.append('timestamp', new Date().toISOString());
      
      if (location) {
        formDataToSend.append('location', JSON.stringify(location));
      }

      // Append images
      formData.images.forEach((imageObj) => {
        formDataToSend.append(`images`, imageObj.file);
      });

      const res = await fetch('/api/reports', {
        method: 'POST',
        body: formDataToSend, // Use FormData instead of JSON
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

  if (!asset) {
    return (
      <>
        <Head>
          <title>ไม่พบข้อมูล - OBT Smart System</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบข้อมูลทรัพย์สิน</h2>
            <p className="text-gray-600 mb-4">รหัสทรัพย์สินที่ระบุไม่ถูกต้อง</p>
            <button
              onClick={() => router.push('/public')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>แจ้งปัญหา - {asset.name} - OBT Smart System</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/images/abt-logo.png" alt="โลโก้ อบต.ละหาร" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Smart OBT</h1>
                  <p className="text-sm text-gray-600">อบต.ละหาร - แจ้งปัญหาไฟส่องสว่าง</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/public')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </header>

        <div className="w-full px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">แจ้งปัญหา</h1>
              <p className="text-gray-600">กรุณากรอกข้อมูลปัญหาที่พบ</p>
            </div>

            {asset && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  ข้อมูลทรัพย์สิน
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-700"><strong>รหัส:</strong> {asset.code}</p>
                    <p className="text-blue-700"><strong>ชื่อ:</strong> {asset.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-700"><strong>หมวดหมู่:</strong> {asset.category}</p>
                    <p className="text-blue-700"><strong>สถานที่:</strong> {asset.location}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทปัญหา *
                </label>
                <select
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">เลือกประเภทปัญหา</option>
                  <option value="ชำรุด">ชำรุด</option>
                  <option value="เสียหาย">เสียหาย</option>
                  <option value="ไม่ทำงาน">ไม่ทำงาน</option>
                  <option value="อันตราย">อันตราย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
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
            router.push('/public');
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
    props: {}, // will be passed to the page component as props
  }
}