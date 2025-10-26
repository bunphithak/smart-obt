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
  const [chartData, setChartData] = useState({
    reportsByStatus: {},
    assetsByCategory: {},
    reportsByVillage: []
  });
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    // Check if user is logged in (you can implement this based on your auth)
    // For now, assuming they're in admin dashboard
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalAssets: data.data.totalAssets,
          totalReports: data.data.totalReports,
          pendingRepairs: data.data.pendingRepairs,
          completedRepairs: data.data.completedRepairs
        });
        setChartData({
          reportsByStatus: data.data.reportsByStatus || {},
          assetsByCategory: data.data.assetsByCategory || {},
          reportsByVillage: data.data.reportsByVillage || []
        });
      } else {
        console.error('API Error:', data.error);
      }
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
        {/* Chart Half Width */}
        <div className="col-span-12 xl:col-span-6 flex">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-base font-bold text-gray-800 dark:text-white/90 mb-1">สถิติการเกิดปัญหา</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">ภาพรวมการดำเนินงาน 6 เดือนล่าสุด</p>
            </div>
            <DashboardChart />
          </div>
        </div>

        {/* Reports by Village - Half Width */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full flex flex-col">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">ปัญหาตามหมู่บ้าน</h4>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {chartData.reportsByVillage.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
              ) : (
                chartData.reportsByVillage.map((item) => {
                  const maxCount = Math.max(...chartData.reportsByVillage.map(v => v.count), 1);
                  return (
                    <div key={item.village}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.village}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white/90">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Cards */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Reports by Status Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">รายงานตามสถานะ</h4>
            <div className="space-y-3">
              {Object.keys(chartData.reportsByStatus).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
              ) : (
                Object.entries(chartData.reportsByStatus).map(([status, count]) => {
                  const maxCount = Math.max(...Object.values(chartData.reportsByStatus), 1);
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white/90">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Assets by Category Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h4 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">ทรัพย์สินตามหมวดหมู่</h4>
            <div className="space-y-3">
              {Object.keys(chartData.assetsByCategory).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">ไม่มีข้อมูล</p>
              ) : (
                Object.entries(chartData.assetsByCategory).map(([category, count]) => {
                  const maxCount = Math.max(...Object.values(chartData.assetsByCategory), 1);
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white/90">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

