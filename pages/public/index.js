import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PublicHome() {
  const router = useRouter();
  const [assetCode, setAssetCode] = useState('');

  const handleAutoRedirect = useCallback(() => {
    if (router.query.code) {
      setAssetCode(router.query.code);
      // Auto-submit if code is provided
      setTimeout(() => {
        router.push(`/report/${router.query.code}`);
      }, 500);
    }
  }, [router.query.code, router]);

  useEffect(() => {
    // Get asset code from URL query parameter
    handleAutoRedirect();
  }, [handleAutoRedirect]);

  const handleReportProblem = (e) => {
    e.preventDefault();
    if (assetCode.trim()) {
      router.push(`/report/${assetCode.trim()}`);
    }
  };

  const handleTrackStatus = () => {
    router.push('/track');
  };

  return (
    <>
      <Head>
        <title>ระบบแจ้งปัญหา OBT Smart - อบต.สมาร์ท</title>
        <meta name="description" content="ระบบแจ้งปัญหาและติดตามงานซ่อมบำรุง อบต.สมาร์ท" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">OBT Smart System</h1>
                  <p className="text-sm text-gray-600">ระบบจัดการทรัพย์สินและงานซ่อมบำรุง</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              แจ้งปัญหาและติดตามงานซ่อม
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ระบบออนไลน์สำหรับประชาชนในการแจ้งปัญหาทรัพย์สินสาธารณะ 
              และติดตามสถานะการดำเนินงานของ อบต.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Report Problem Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">แจ้งปัญหา</h3>
                <p className="text-gray-600 mb-6">
                  แจ้งปัญหาทรัพย์สินสาธารณะ เช่น เสาไฟ ทางเดิน ท่อระบายน้ำ
                </p>
                
                <form onSubmit={handleReportProblem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสทรัพย์สิน (QR Code)
                    </label>
                    <input
                      type="text"
                      value={assetCode}
                      onChange={(e) => setAssetCode(e.target.value)}
                      placeholder="เช่น AST000001"
                      required
                      className="w-full px-4 py-3 text-center text-lg font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      สแกน QR Code หรือกรอกรหัสทรัพย์สิน
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                  >
                    แจ้งปัญหา
                  </button>
                </form>
              </div>
            </div>

            {/* Track Status Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">ติดตามสถานะ</h3>
                <p className="text-gray-600 mb-6">
                  ตรวจสอบสถานะการดำเนินงานของปัญหาที่แจ้งไว้
                </p>
                
                <button
                  onClick={handleTrackStatus}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  ตรวจสอบสถานะ
                </button>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="mt-20 max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              วิธีการใช้งาน
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">สแกน QR Code</h4>
                <p className="text-gray-600">
                  สแกน QR Code ที่ติดอยู่กับทรัพย์สินสาธารณะ หรือกรอกรหัสทรัพย์สิน
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">2</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">กรอกข้อมูลปัญหา</h4>
                <p className="text-gray-600">
                  บรรยายปัญหา รูปภาพ และข้อมูลติดต่อของคุณ
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">ติดตามสถานะ</h4>
                <p className="text-gray-600">
                  ใช้รหัสติดตามที่ได้รับเพื่อตรวจสอบสถานะการดำเนินงาน
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-20 max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ติดต่อสอบถาม</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">02-123-4567</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">info@obt-smart.com</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">อบต.สมาร์ท จังหวัดกรุงเทพฯ</span>
                </div>
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
      </div>
    </>
  );
}
