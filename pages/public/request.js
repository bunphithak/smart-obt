import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RequestPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setIsChecking(true);
    
    try {
      const res = await fetch(`/api/reports/track?ticketId=${trackingId.trim()}`);
      const data = await res.json();
      
      if (data.success) {
        // Found ticket, redirect to tracking page
        router.push(`/track/${trackingId.trim()}`);
      } else {
        // Not found, show alert modal
        showAlert('error', 'ไม่พบข้อมูล', data.error || 'รหัสติดตามไม่ถูกต้องหรือถูกลบออกจากระบบ');
      }
    } catch (error) {
      console.error('Error checking ticket:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Head>
        <title>เลือกประเภท - OBT Smart System</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <img src="/images/abt-logo.png" alt="โลโก้ อบต.ละหาร" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Smart OBT</h1>
                  <p className="text-sm text-gray-600">อบต.ละหาร - เลือกประเภท</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ระบบแจ้งซ่อมไฟส่องสว่าง
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              แจ้งซ่อม ยื่นคำร้อง หรือติดตามสถานะการดำเนินงาน
            </p>
          </div>

          {/* Track Status Section - Priority First */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border-2 border-blue-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ติดตามสถานะ</h3>
                <p className="text-gray-600">ตรวจสอบความคืบหน้าด้วยรหัสติดตาม</p>
              </div>

              <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="กรอกรหัสติดตาม (เช่น RP123456 หรือ RQ123456)"
                    required
                    className="flex-1 px-4 py-3 text-center text-lg font-mono border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isChecking}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        กำลังตรวจสอบ...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        ค้นหา
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-blue-600 text-center mt-2">
                  RP = แจ้งซ่อม | RQ = คำร้อง
                </p>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <p className="text-gray-500 font-medium">หรือ</p>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
          </div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Repair Card */}
            <div 
              onClick={() => router.push('/public/repair')}
              className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-red-300"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">แจ้งซ่อม</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  แจ้งซ่อมทรัพย์สินสาธารณะที่ชำรุด
                </p>
                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700 font-medium">เหมาะสำหรับ:</p>
                  <ul className="text-sm text-red-600 mt-2 space-y-1 text-left">
                    <li>💡 <strong>ไฟส่องสว่างเสีย ไม่ติด</strong></li>
                    <li>💡 <strong>เสาไฟชำรุด หลอดไฟขาด</strong></li>
                    <li>💡 <strong>โคมไฟถนนชำรุด</strong></li>
                    <li>💡 <strong>ระบบไฟฟ้าสาธารณะมีปัญหา</strong></li>
                  </ul>
                </div>
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all">
                  แจ้งซ่อมเลย →
                </button>
              </div>
            </div>

            {/* Request Card */}
            <div 
              onClick={() => router.push('/public/request-form')}
              className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-300"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">ยื่นคำร้อง</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  ยื่นคำร้องขอรับบริการต่างๆ
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-purple-700 font-medium">เหมาะสำหรับ:</p>
                  <ul className="text-sm text-purple-600 mt-2 space-y-1 text-left">
                    <li>💡 <strong>ขอติดตั้งไฟส่องสว่าง</strong></li>
                    <li>💡 <strong>ขอติดตั้งเสาไฟใหม่</strong></li>
                    <li>💡 <strong>ขอขยายเขตไฟฟ้าสาธารณะ</strong></li>
                    <li>💡 <strong>ขอเพิ่มโคมไฟในพื้นที่</strong></li>
                  </ul>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all">
                  ยื่นคำร้องเลย →
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ข้อมูลเพิ่มเติม</h3>
                <p className="text-gray-600 mb-3">
                  หลังจากส่งแบบฟอร์ม ท่านจะได้รับ <strong>รหัสติดตาม (Ticket ID)</strong> เพื่อใช้ในการตรวจสอบสถานะการดำเนินงาน
                </p>
                <p className="text-gray-600">
                  สามารถติดต่อสอบถามได้ที่ <strong>0-XXXX-XXXX</strong> ในเวลาทำการ จันทร์-ศุกร์ 08:30-16:30 น.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              © 2024 OBT Smart System - ระบบจัดการทรัพย์สินและงานซ่อมบำรุง
            </p>
          </div>
        </footer>

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
      </div>
    </>
  );
}
