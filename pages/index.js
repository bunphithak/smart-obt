import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardChart from '../components/DashboardChart';

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalReports: 0,
    pendingRepairs: 0,
    completedRepairs: 0
  });
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    // Check if user is logged in (you can implement this based on your auth)
    // For now, assuming they're in admin dashboard
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Implement API calls to get statistics
      // const response = await fetch('/api/dashboard');
      // const data = await response.json();
      // setStats(data);
      
      // Mock data
      setStats({
        totalAssets: 125,
        totalReports: 45,
        pendingRepairs: 12,
        completedRepairs: 33
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Public homepage view
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src="/images/abt-logo.png" alt="โลโก้ อบต.ละหาร" className="w-24 h-24" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              ระบบจัดการทรัพย์สิน OBT Smart
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-4">
              อบต.ละหาร อ.ปลวกแดง จ.ระยอง
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              แจ้งปัญหาไฟส่องสว่างได้ง่ายๆ ผ่าน QR Code
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">สแกน QR Code บนทรัพย์สิน</p>
                <div className="w-48 h-48 bg-white rounded-lg shadow-lg p-4 mx-auto">
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400">📱 QR Code</span>
                  </div>
                </div>
              </div>
              
              <div className="text-gray-400 text-2xl">หรือ</div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">ติดตามสถานะงาน</p>
                <button
                  onClick={() => router.push('/track')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 shadow-lg text-lg font-medium"
                >
                  🔍 ตรวจสอบสถานะ
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-semibold mb-2">สแกน QR</h3>
              <p className="text-gray-600 text-sm">
                สแกน QR Code บนทรัพย์สินเพื่อแจ้งปัญหาทันที
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2">แจ้งปัญหา</h3>
              <p className="text-gray-600 text-sm">
                กรอกรายละเอียดและแนบรูปภาพได้ง่ายๆ
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">ติดตามสถานะ</h3>
              <p className="text-gray-600 text-sm">
                ตรวจสอบความคืบหน้าได้ตลอดเวลา
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <p className="mb-2">องค์การบริหารส่วนตำบลละหาร อำเภอปลวกแดง จังหวัดระยอง</p>
          <p>หากมีข้อสงสัย โทร. 0-XXXX-XXXX</p>
          <button
            onClick={() => setIsPublic(false)}
            className="mt-4 text-blue-600 hover:underline"
          >
            เข้าสู่ระบบผู้ดูแล
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard view
  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              ภาพรวมระบบจัดการไฟส่องสว่าง อบต.ละหาร อ.ปลวกแดง จ.ระยอง
            </p>
          </div>
              <Link
                href="/public"
                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ดูหน้าประชาชน
              </Link>
        </div>
      </div>

      {/* Stats Cards - TailAdmin Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        {/* Card 1 - Total Assets */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg className="w-6 h-6 text-gray-800 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ทรัพย์สินทั้งหมด
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {stats.totalAssets}
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">12.5%</span>
            </div>
          </div>
        </div>
        
        {/* Card 2 - Total Reports */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg className="w-6 h-6 text-gray-800 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                รายงานปัญหา
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {stats.totalReports}
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">8.2%</span>
            </div>
          </div>
        </div>
        
        {/* Card 3 - Pending Repairs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg className="w-6 h-6 text-gray-800 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                งานซ่อมค้าง
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {stats.pendingRepairs}
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
              <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">-3.1%</span>
            </div>
          </div>
        </div>
        
        {/* Card 4 - Completed Repairs */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <svg className="w-6 h-6 text-gray-800 dark:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                งานซ่อมเสร็จ
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {stats.completedRepairs}
              </h4>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">21.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid - TailAdmin Style */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Chart */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-white/90 mb-1">สถิติการใช้งาน</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">ภาพรวมการดำเนินงาน 6 เดือนล่าสุด</p>
            </div>
            <DashboardChart />
          </div>
        </div>

        {/* Right Column - Recent Activities */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h2 className="text-base font-bold text-gray-800 dark:text-white/90 mb-5">กิจกรรมล่าสุด</h2>
            
            <div className="space-y-3">
              {/* Activity 1 */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">รายงานปัญหาใหม่</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">เสาไฟหมู่ 1 ไฟไม่ติด</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 นาทีที่แล้ว</p>
                </div>
              </div>

              {/* Activity 2 */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">งานซ่อมเสร็จสิ้น</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ซ่อมท่อน้ำหมู่ 3</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 ชั่วโมงที่แล้ว</p>
                </div>
              </div>

              {/* Activity 3 */}
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">เพิ่มทรัพย์สินใหม่</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">เสาไฟ LED หมู่ 5</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 ชั่วโมงที่แล้ว</p>
                </div>
              </div>

              {/* Activity 4 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white/90">ผู้ใช้ใหม่เข้าระบบ</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ช่าง สมชาย ใจดี</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              ดูกิจกรรมทั้งหมด
            </button>
          </div>
        </div>

        {/* System Status Widget */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-5">สถานะระบบ</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">ระบบฐานข้อมูล</span>
                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ทำงานปกติ
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  ทำงานปกติ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">พื้นที่จัดเก็บ</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white/90">68% available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Cards */}
        <div className="col-span-12 xl:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Link href="/assets" className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">จัดการทรัพย์สิน</h3>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <p className="text-blue-100 text-sm">เพิ่ม แก้ไข และจัดการทรัพย์สิน</p>
            </Link>

            <Link href="/reports" className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">ดูรายงาน</h3>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <p className="text-purple-100 text-sm">ตรวจสอบรายงานปัญหาทั้งหมด</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

