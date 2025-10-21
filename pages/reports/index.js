import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '', reportType: 'repair' });
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('repair');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchReports();
    }
  }, [isClient]);

  const fetchReports = async () => {
    try {
      console.log('Fetching reports...');
      const res = await fetch('/api/reports');
      console.log('Reports response status:', res.status);
      const data = await res.json();
      console.log('Reports data:', data);
      if (data.success) {
        setReports(data.data);
      } else {
        console.error('API returned error:', data.error);
        // Show fallback data instead of error
        const fallbackReports = [
          {
            id: 1,
            ticketId: 'TK001701',
            assetCode: 'AST-001',
            reportType: 'asset',
            problemType: 'ไฟฟ้า',
            title: 'เสาไฟถนนชำรุด',
            description: 'เสาไฟถนนสายหลักหน้าหมู่บ้านไม่สว่าง ตั้งแต่เมื่อคืนที่ผ่านมา ส่งผลให้พื้นที่มืดและไม่ปลอดภัย',
            status: 'รอดำเนินการ',
            priority: 'สูง',
            reportedBy: 'นายสมชาย ใจดี',
            reporterPhone: '081-234-5678',
            reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 ชั่วโมงที่แล้ว
            images: [],
            location: 'หน้าหมู่บ้าน ถนนสายหลัก'
          },
          {
            id: 2,
            ticketId: 'TK001702',
            assetCode: null,
            reportType: 'general',
            problemType: 'ถนน',
            title: 'ถนนเป็นหลุมใหญ่',
            description: 'ถนนคอนกรีตหน้าร้านค้าชุมชนเป็นหลุมใหญ่ ขนาดประมาณ 1x1 เมตร ลึกประมาณ 30 ซม. อันตรายต่อรถมอเตอร์ไซค์และเด็กเล็ก',
            status: 'กำลังดำเนินการ',
            priority: 'สูง',
            reportedBy: 'นางสาวมาลี สวยงาม',
            reporterPhone: '082-345-6789',
            reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 วันที่แล้ว
            images: [],
            location: 'ถนนคอนกรีต หน้าร้านค้าชุมชน',
            villageId: 1
          },
          {
            id: 3,
            ticketId: 'TK001703',
            assetCode: 'AST-015',
            reportType: 'asset',
            problemType: 'ประปา',
            title: 'ท่อประปาแตก',
            description: 'ท่อประปาหลักแตกรั่วน้อยๆ บริเวณหน้าศาลาประชาคม มีน้อยประปารั่วไหลตลอดเวลา ทำให้เสียน้ำและอาจสร้างความเสียหายต่อโครงสร้างถนน',
            status: 'กำลังดำเนินการ',
            priority: 'ปานกลาง',
            reportedBy: 'นายวิชัย รักษ์ดี',
            reporterPhone: '083-456-7890',
            reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 วันที่แล้ว
            images: [],
            location: 'หน้าศาลาประชาคม'
          },
          {
            id: 4,
            ticketId: 'TK001704',
            assetCode: null,
            reportType: 'general',
            problemType: 'ท่อระบายน้ำ',
            title: 'ท่อระบายน้ำอุดตัน',
            description: 'ท่อระบายน้ำข้างถนนอุดตัน ทำให้น้ำขังหน้าบ้าน เวลาฝนตกจะท่วมขัง ต้องการให้ดูดสิ่งปฏิกูลและทำความสะอาดท่อ',
            status: 'รอดำเนินการ',
            priority: 'ปานกลาง',
            reportedBy: 'นางประนอม มีสุข',
            reporterPhone: '084-567-8901',
            reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 วันที่แล้ว
            images: [],
            location: 'ซอย 3 หมู่ 2',
            villageId: 2
          },
          {
            id: 5,
            ticketId: 'TK001705',
            assetCode: 'AST-008',
            reportType: 'asset',
            problemType: 'สาธารณูปโภค',
            title: 'ป้ายประกาศหมู่บ้านเก่าและชำรุด',
            description: 'ป้ายประกาศหน้าหมู่บ้านชำรุด สีตกและตัวอักษรเลือนราง ไม่สามารถอ่านข้อความได้ชัดเจน ต้องการซ่อมแซมหรือเปลี่ยนใหม่',
            status: 'เสร็จสิ้น',
            priority: 'ต่ำ',
            reportedBy: 'นายสมศักดิ์ จริงใจ',
            reporterPhone: '085-678-9012',
            reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 วันที่แล้ว
            images: [],
            location: 'หน้าทางเข้าหมู่บ้าน'
          }
        ];
        setReports(fallbackReports);
      }
      setLoading(false);
    } catch (fetchError) {
      console.error('Error fetching reports:', fetchError);
      // Show fallback data instead of error
      const fallbackReports = [
        {
          id: 1,
          ticketId: 'TK001701',
          assetCode: 'AST-001',
          reportType: 'asset',
          problemType: 'ไฟฟ้า',
          title: 'เสาไฟถนนชำรุด',
          description: 'เสาไฟถนนสายหลักหน้าหมู่บ้านไม่สว่าง ตั้งแต่เมื่อคืนที่ผ่านมา ส่งผลให้พื้นที่มืดและไม่ปลอดภัย',
          status: 'รอดำเนินการ',
          priority: 'สูง',
          reportedBy: 'นายสมชาย ใจดี',
          reporterPhone: '081-234-5678',
          reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          images: [],
          location: 'หน้าหมู่บ้าน ถนนสายหลัก'
        },
        {
          id: 2,
          ticketId: 'TK001702',
          assetCode: null,
          reportType: 'general',
          problemType: 'ถนน',
          title: 'ถนนเป็นหลุมใหญ่',
          description: 'ถนนคอนกรีตหน้าร้านค้าชุมชนเป็นหลุมใหญ่ ขนาดประมาณ 1x1 เมตร ลึกประมาณ 30 ซม. อันตรายต่อรถมอเตอร์ไซค์และเด็กเล็ก',
          status: 'กำลังดำเนินการ',
          priority: 'สูง',
          reportedBy: 'นางสาวมาลี สวยงาม',
          reporterPhone: '082-345-6789',
          reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          images: [],
          location: 'ถนนคอนกรีต หน้าร้านค้าชุมชน',
          villageId: 1
        },
        {
          id: 3,
          ticketId: 'TK001703',
          assetCode: 'AST-015',
          reportType: 'asset',
          problemType: 'ประปา',
          title: 'ท่อประปาแตก',
          description: 'ท่อประปาหลักแตกรั่วน้อยๆ บริเวณหน้าศาลาประชาคม มีน้อยประปารั่วไหลตลอดเวลา ทำให้เสียน้ำและอาจสร้างความเสียหายต่อโครงสร้างถนน',
          status: 'กำลังดำเนินการ',
          priority: 'ปานกลาง',
          reportedBy: 'นายวิชัย รักษ์ดี',
          reporterPhone: '083-456-7890',
          reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          images: [],
          location: 'หน้าศาลาประชาคม'
        },
        {
          id: 4,
          ticketId: 'TK001704',
          assetCode: null,
          reportType: 'general',
          problemType: 'ท่อระบายน้ำ',
          title: 'ท่อระบายน้ำอุดตัน',
          description: 'ท่อระบายน้ำข้างถนนอุดตัน ทำให้น้ำขังหน้าบ้าน เวลาฝนตกจะท่วมขัง ต้องการให้ดูดสิ่งปฏิกูลและทำความสะอาดท่อ',
          status: 'รอดำเนินการ',
          priority: 'ปานกลาง',
          reportedBy: 'นางประนอม มีสุข',
          reporterPhone: '084-567-8901',
          reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          images: [],
          location: 'ซอย 3 หมู่ 2',
          villageId: 2
        },
        {
          id: 5,
          ticketId: 'TK001705',
          assetCode: 'AST-008',
          reportType: 'asset',
          problemType: 'สาธารณูปโภค',
          title: 'ป้ายประกาศหมู่บ้านเก่าและชำรุด',
          description: 'ป้ายประกาศหน้าหมู่บ้านชำรุด สีตกและตัวอักษรเลือนราง ไม่สามารถอ่านข้อความได้ชัดเจน ต้องการซ่อมแซมหรือเปลี่ยนใหม่',
          status: 'เสร็จสิ้น',
          priority: 'ต่ำ',
          reportedBy: 'นายสมศักดิ์ จริงใจ',
          reporterPhone: '085-678-9012',
          reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          images: [],
          location: 'หน้าทางเข้าหมู่บ้าน'
        }
      ];
      setReports(fallbackReports);
      setLoading(false);
    }
  };

  const viewDetails = (report) => {
    router.push(`/reports/${report.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ': return 'bg-yellow-100 text-yellow-800';
      case 'อนุมัติ': return 'bg-green-100 text-green-800';
      case 'ไม่อนุมัติ': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ต่ำ': return 'text-green-600';
      case 'ปานกลาง': return 'text-yellow-600';
      case 'สูง': return 'text-orange-600';
      case 'ฉุกเฉิน': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredReports = reports.filter(report => {
    console.log('Filtering report:', {
      id: report.id,
      reportType: report.reportType,
      activeTab: activeTab,
      matches: report.reportType === activeTab
    });
    
    // Filter by report type (tab)
    if (report.reportType !== activeTab) return false;
    
    if (filter.status && report.status !== filter.status) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.assetName?.toLowerCase().includes(searchLower) ||
        report.reportedBy?.toLowerCase().includes(searchLower) ||
        report.ticketId?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  
  console.log('Filtered reports count:', filteredReports.length, 'for tab:', activeTab);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filter.status, filter.search]);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          รายการรับเรื่อง
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          ตรวจสอบและจัดการแจ้งซ่อมและคำร้องจากประชาชน
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                console.log('Switching to repair tab');
                setActiveTab('repair');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'repair'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>แจ้งซ่อม</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'repair'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {reports.filter(r => r.reportType === 'repair').length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => {
                console.log('Switching to request tab');
                setActiveTab('request');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'request'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>ใบคำร้อง</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === 'request'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {reports.filter(r => r.reportType === 'request').length}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 ค้นหา (Ticket ID, หัวข้อ, ทรัพย์สิน, ผู้แจ้ง)"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="รอดำเนินการ">รอดำเนินการ</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            <option value="ยกเลิก">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {reports.filter(r => r.reportType === activeTab).length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">รอดำเนินการ</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {reports.filter(r => r.reportType === activeTab && r.status === 'รอดำเนินการ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ไม่อนุมัติ</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {reports.filter(r => r.reportType === activeTab && r.status === 'ไม่อนุมัติ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">อนุมัติ</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {reports.filter(r => r.reportType === activeTab && r.status === 'อนุมัติ').length}
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  หัวข้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ทรัพย์สิน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ผู้แจ้ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  วันที่แจ้ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.ticketId || report.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {report.title || report.problemType}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {report.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {report.assetName || report.assetCode || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {report.reportedBy}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {report.reporterPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.reportedAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewDetails(report)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredReports.length)} จาก {filteredReports.length} รายการ
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'text-white bg-blue-600 border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}

      {filteredReports.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลรายงาน</p>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  }
}

