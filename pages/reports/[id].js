import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

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
    note: ''
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchReportDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?id=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setReport(data.data[0]);
        setUpdateData({
          status: data.data[0].status,
          priority: data.data[0].priority,
          note: ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report:', error);
      setLoading(false);
    }
  }, [id]);

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
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: report.id,
          status: updateData.status,
          priority: updateData.priority,
          note: updateData.note
        })
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'อัปเดตสำเร็จ', 'อัปเดตสถานะรายงานเรียบร้อยแล้ว');
        fetchReportDetail();
        setShowUpdateModal(false);
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่');
    }
  };

  const createRepair = () => {
    router.push(`/repairs/new?reportId=${report.id}`);
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
      case 'ต่ำ': return 'text-green-600 bg-green-100';
      case 'ปานกลาง': return 'text-yellow-600 bg-yellow-100';
      case 'สูง': return 'text-orange-600 bg-orange-100';
      case 'ฉุกเฉิน': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              รายละเอียดรายงาน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              รหัสรายงาน: #{report.ticketId || report.id}
            </p>
          </div>
          <button
            onClick={() => router.push('/reports')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← กลับ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Info Card */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {report.problemType || report.title}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
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

                {report.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      สถานที่
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {typeof report.location === 'string' ? report.location : JSON.stringify(report.location)}
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
                        <Image
                          key={index}
                          src={image}
                          alt={`รูปภาพ ${index + 1}`}
                          width={300}
                          height={200}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GPS Location Card */}
            {report.gpsLocation && (
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  ตำแหน่ง GPS
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ละติจูด:</span> {report.gpsLocation.latitude}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ลองจิจูด:</span> {report.gpsLocation.longitude}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${report.gpsLocation.latitude},${report.gpsLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    เปิดใน Google Maps
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

            {/* Actions Card */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                การดำเนินการ
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  อัปเดตสถานะ
                </button>
                {report.status === 'รอดำเนินการ' && (
                  <button
                    onClick={createRepair}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    สร้างงานซ่อม
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Update Status Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">อัปเดตสถานะรายงาน</h3>
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
                      สถานะ
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ยกเลิก">ยกเลิก</option>
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
                      <option value="ต่ำ">ต่ำ</option>
                      <option value="ปานกลาง">ปานกลาง</option>
                      <option value="สูง">สูง</option>
                      <option value="ฉุกเฉิน">ฉุกเฉิน</option>
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
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}

