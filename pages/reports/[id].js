import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  REPORT_STATUS, 
  REPORT_STATUS_LABELS, 
  PRIORITY, 
  PRIORITY_LABELS,
  getReportStatusColor,
  getPriorityColor 
} from '../../lib/constants';

// Dynamic import for MapViewer (client-side only) - แผนที่แบบดูอย่างเดียว
const MapViewer = dynamic(() => import('../../components/MapViewer'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">กำลังโหลดแผนที่...</div>
});

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    priority: '',
    note: '',
    rejectionReason: ''
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({ message: '', onConfirm: null });
  const [problemType, setProblemType] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProblemType = useCallback(async (problemTypeId) => {
    if (!problemTypeId) return;
    
    try {
      const res = await fetch('/api/problem-types');
      const data = await res.json();
      if (data.success && data.data) {
        // Find by ID (UUID)
        const found = data.data.find(pt => String(pt.id) === String(problemTypeId));
        
        if (found) {
          setProblemType(found);
        }
      }
    } catch (error) {
      console.error('Error fetching problem type:', error);
    }
  }, []);

  const fetchReportDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?id=${id}`);
      const data = await res.json();
      console.log('API Response:', data);
      
      if (data.success && data.data) {
        // Handle both single object and array response
        const reportData = Array.isArray(data.data) ? data.data[0] : data.data;
        
        // Parse JSON fields if they are strings
        if (typeof reportData.images === 'string') {
          try {
            reportData.images = JSON.parse(reportData.images);
          } catch (e) {
            reportData.images = [];
          }
        }
        
        if (typeof reportData.location === 'string') {
          try {
            reportData.location = JSON.parse(reportData.location);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        // Parse coordinates if they exist
        console.log('🔍 Original coordinates:', reportData.coordinates);
        console.log('🔍 Coordinates type:', typeof reportData.coordinates);
        
        if (reportData.coordinates) {
          try {
            if (typeof reportData.coordinates === 'string') {
              reportData.coordinates = JSON.parse(reportData.coordinates);
              console.log('✅ Parsed coordinates:', reportData.coordinates);
            }
          } catch (e) {
            console.warn('❌ Could not parse coordinates:', e);
            reportData.coordinates = null;
          }
        } else {
          console.warn('⚠️ No coordinates found in report data');
        }
        
        console.log('🗺️ Final coordinates for map:', reportData.coordinates);
        
        setReport(reportData);
        setUpdateData({
          status: reportData.status,
          priority: reportData.priority,
          note: '',
          rejectionReason: ''
        });

        // Fetch problem type details if available
        // Note: problemType is now stored as UUID in the database
        if (reportData.problemType && reportData.problemTypeDescription) {
          // Data already includes problem type info from API
          setProblemType({
            name: reportData.problemType,
            description: reportData.problemTypeDescription
          });
        } else if (reportData.problemType && !reportData.problemTypeName) {
          // Fallback: fetch by UUID if API didn't join properly
          await fetchProblemType(reportData.problemType);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  }, [id, fetchProblemType]);

  useEffect(() => {
    if (isClient && id) {
      fetchReportDetail();
    }
  }, [isClient, id, fetchReportDetail]);

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
    
    // ถ้ามีการสร้างงานซ่อม ให้ redirect ไปหน้า repairs
    if (alertData.message && alertData.message.includes('สร้างงานซ่อมแล้ว')) {
      router.push('/repairs');
    }
  };

  const handleUpdateStatus = async () => {
    // Show confirmation
    const statusLabel = REPORT_STATUS_LABELS[updateData.status] || updateData.status;
    setConfirmData({
      message: `ต้องการอัปเดตสถานะเป็น "${statusLabel}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          console.log('📤 Updating report status:', {
            id: report.id,
            oldStatus: report.status,
            newStatus: updateData.status,
            priority: updateData.priority
          });

          const res = await fetch('/api/reports', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: report.id,
              status: updateData.status,
              priority: updateData.priority,
              note: updateData.note,
              rejectionReason: updateData.rejectionReason
            })
          });

          const data = await res.json();
          console.log('📥 API Response:', data);

          if (data.success) {
            // แสดงข้อความที่แตกต่างกันตามสถานะ
            let message = 'อัปเดตสถานะรายงานเรียบร้อยแล้ว';
            if (data.repairId) {
              console.log('✅ Repair job created with ID:', data.repairId);
              message = `อัปเดตสถานะเป็น "${REPORT_STATUS_LABELS[REPORT_STATUS.APPROVED]}" และสร้างงานซ่อมแล้ว กรุณาไปที่เมนู "จัดการงานซ่อม" เพื่อจ่ายงานช่าง`;
            } else if (data.error) {
              console.warn('⚠️ Repair creation failed:', data.error);
            }
            
            showAlert('success', 'อัปเดตสำเร็จ', message);
            fetchReportDetail();
            setShowUpdateModal(false);
          } else {
            console.error('❌ Update failed:', data.error);
            showAlert('error', 'เกิดข้อผิดพลาด', data.error);
          }
        } catch (error) {
          console.error('❌ Error updating report:', error);
          showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่');
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const assignToTechnician = () => {
    // Navigate to repairs page to create repair job
    router.push(`/repairs/new?reportId=${report.id}`);
  };

  const createRepair = () => {
    router.push(`/repairs/new?reportId=${report.id}`);
  };

  const getStatusColorClass = (status) => {
    return getReportStatusColor(status);
  };

  const getStatusLabel = (status) => {
    return REPORT_STATUS_LABELS[status] || status;
  };

  const getPriorityColorClass = (priority) => {
    return getPriorityColor(priority, 'badge');
  };

  const getPriorityLabel = (priority) => {
    return PRIORITY_LABELS[priority] || priority;
  };

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

  if (!report) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 mb-4">ไม่พบข้อมูลรายงาน</p>
          <button
            onClick={() => router.push('/reports')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>รายละเอียดรายงาน - OBT Smart System</title>
      </Head>

      <div className="p-4 md:p-6 2xl:p-10">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                รายละเอียดรายงาน
              </h1>
              {report.reportType && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.reportType === 'repair' 
                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {report.reportType === 'repair' ? '🔧 งานแจ้งซ่อม' : '📝 ใบคำร้อง'}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              รหัสรายงาน: #{report.ticketId || report.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`/public/pdf/${id}`, '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              พิมพ์รายงาน
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← กลับ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      report.reportType === 'repair' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {report.reportType === 'repair' ? 'แจ้งซ่อม' : 'คำร้อง'}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {report.problemType || report.title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColorClass(report.priority)}`}>
                      {getPriorityLabel(report.priority)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ประเภทรายงาน
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {report.reportType === 'general' ? 'รายงานทั่วไป' : 'รายงานทรัพย์สิน'}
                  </p>
                </div>

                {report.assetCode && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      รหัสทรัพย์สิน
                    </label>
                    <p className="text-gray-800 dark:text-white font-mono">
                      {report.assetCode}
                    </p>
                  </div>
                )}

                {report.problemType && report.reportType === 'repair' && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ประเภทปัญหา
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {problemType ? (
                        <>
                          {problemType.name}
                          {problemType.description && (
                            <span className="text-xs text-gray-500 block mt-1">
                              {problemType.description}
                            </span>
                          )}
                        </>
                      ) : (
                        report.problemType
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    รายละเอียดปัญหา
                  </label>
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                {report.images && report.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      รูปภาพประกอบ
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {report.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-pointer group"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                        >
                          <Image
                            src={image}
                            alt={`รูปภาพ ${index + 1}`}
                            width={300}
                            height={200}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                            <svg 
                              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location Card */}
            {report.coordinates && report.coordinates.lat && report.coordinates.lng && (
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  📍 ตำแหน่งที่แจ้ง
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {(report.assetLocation || (report.location && typeof report.location === 'string' && !report.location.includes('latitude'))) && (
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">สถานที่:</span> {report.assetLocation || report.location}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">พิกัด:</span> {Number(report.coordinates.lat).toFixed(6)}, {Number(report.coordinates.lng).toFixed(6)}
                    </p>
                  </div>
                  
                  {/* Map Display - แผนที่แบบดูอย่างเดียว */}
                  {isClient && (
                    <MapViewer
                      lat={Number(report.coordinates.lat)}
                      lng={Number(report.coordinates.lng)}
                      title={report.title || report.problemType}
                      description={report.assetLocation || report.location}
                      height="320px"
                    />
                  )}
                  
                  <a
                    href={`https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                  >
                    🗺️ เปิดใน Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                ข้อมูลผู้แจ้ง
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ชื่อผู้แจ้ง
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {report.reportedBy || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    เบอร์โทรศัพท์
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {report.reporterPhone || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    วันที่แจ้ง
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {new Date(report.reportedAt).toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Card - แสดงเฉพาะเมื่อสถานะยังไม่ได้รับการอนุมัติ/ไม่อนุมัติ */}
            {report.status !== REPORT_STATUS.APPROVED && report.status !== REPORT_STATUS.REJECTED && (
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  การดำเนินการ
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    พิจรณา
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Update Status Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">พิจารณาสถานะรายงาน</h3>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สถานะการอนุมัติ
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={REPORT_STATUS.PENDING}>{REPORT_STATUS_LABELS[REPORT_STATUS.PENDING]}</option>
                      <option value={REPORT_STATUS.APPROVED}>{REPORT_STATUS_LABELS[REPORT_STATUS.APPROVED]}</option>
                      <option value={REPORT_STATUS.REJECTED}>{REPORT_STATUS_LABELS[REPORT_STATUS.REJECTED]}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ลำดับความสำคัญ
                    </label>
                    <select
                      value={updateData.priority}
                      onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                      <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                      <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                      <option value={PRIORITY.URGENT}>{PRIORITY_LABELS[PRIORITY.URGENT]}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเหตุ (ไม่บังคับ)
                    </label>
                    <textarea
                      value={updateData.note}
                      onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })}
                      rows={3}
                      placeholder="เพิ่มหมายเหตุ..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {updateData.status === 'ไม่อนุมัติ' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        สาเหตุการไม่อนุมัติ (ไม่บังคับ)
                      </label>
                      <textarea
                        value={updateData.rejectionReason}
                        onChange={(e) => setUpdateData({ ...updateData, rejectionReason: e.target.value })}
                        rows={3}
                        placeholder="ระบุสาเหตุที่ไม่อนุมัติ..."
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
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

        {/* Image Modal - แสดงภาพใหญ่ */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={() => {
              setShowImageModal(false);
              setSelectedImage(null);
            }}
          >
            <div className="relative max-w-6xl max-h-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                className="absolute -top-12 right-0 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="ภาพขยาย"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setConfirmData({ message: '', onConfirm: null });
          }}
          onConfirm={confirmData.onConfirm}
          title="ยืนยันการอัปเดต"
          message={confirmData.message}
          confirmText="บันทึก"
          cancelText="ยกเลิก"
          type="info"
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

