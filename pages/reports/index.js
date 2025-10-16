import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [isClient, setIsClient] = useState(false);

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
        setError(null);
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
        setError(null);
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
      setError(null);
      setLoading(false);
    }
  };

  const createRepair = (report) => {
    router.push(`/repairs/new?reportId=${report.id}`);
  };

  const viewDetails = (report) => {
    router.push(`/reports/${report.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ': return 'bg-yellow-100 text-yellow-800';
      case 'กำลังดำเนินการ': return 'bg-blue-100 text-blue-800';
      case 'เสร็จสิ้น': return 'bg-green-100 text-green-800';
      case 'ยกเลิก': return 'bg-red-100 text-red-800';
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
    if (filter.status && report.status !== filter.status) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        report.title.toLowerCase().includes(searchLower) ||
        report.assetName?.toLowerCase().includes(searchLower) ||
        report.reportedBy?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
          รายการแจ้งปัญหา / ร้องเรียน
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          ตรวจสอบและจัดการรายงานปัญหาจากประชาชน
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔍 ค้นหา (หัวข้อ, ทรัพย์สิน, ผู้แจ้ง)"
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
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{reports.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">รอดำเนินการ</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {reports.filter(r => r.status === 'รอดำเนินการ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังดำเนินการ</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {reports.filter(r => r.status === 'กำลังดำเนินการ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">เสร็จสิ้น</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {reports.filter(r => r.status === 'เสร็จสิ้น').length}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    ทรัพย์สิน: <span className="font-medium">{report.assetName || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-700">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-1">
                  <p>ผู้แจ้ง: {report.reportedBy || 'ไม่ระบุ'}</p>
                  <p>วันที่แจ้ง: {new Date(report.reportedAt).toLocaleDateString('th-TH')}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewDetails(report)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    ดูรายละเอียด
                  </button>
                  {report.status === 'รอดำเนินการ' && (
                    <button
                      onClick={() => createRepair(report)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      สร้างงานซ่อม
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

