import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NewRepairPage() {
  const router = useRouter();
  const { reportId } = router.query;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'ปานกลาง',
    estimatedCost: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchReportDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?id=${reportId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const reportData = data.data[0];
        setReport(reportData);
        // Pre-fill form with report data
        setFormData({
          ...formData,
          title: reportData.problemType || reportData.title || '',
          description: reportData.description || '',
          priority: reportData.priority || 'ปานกลาง'
        });
      }
      setLoading(false);
    } catch (fetchError) {
      console.error('Error fetching report:', fetchError);
      setLoading(false);
    }
  }, [reportId, formData]);

  useEffect(() => {
    if (isClient) {
      fetchUsers();
      if (reportId) {
        fetchReportDetail();
      } else {
        setLoading(false);
      }
    }
  }, [isClient, reportId, fetchReportDetail]);

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const repairData = {
        ...formData,
        reportId: reportId || null,
        assetCode: report?.assetCode || null,
        status: 'รอดำเนินการ',
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairData)
      });

      const data = await res.json();
      
      if (data.success) {
        showAlert('success', 'สร้างสำเร็จ', 'สร้างงานซ่อมเรียบร้อยแล้ว');
        
        // Update report status to "กำลังดำเนินการ" if from report
        if (reportId) {
          await fetch('/api/reports', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: reportId,
              status: 'กำลังดำเนินการ'
            })
          });
        }
        
        setTimeout(() => {
          router.push('/repairs');
        }, 1500);
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (createError) {
      console.error('Error creating repair:', createError);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสร้างงานซ่อม กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
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

  return (
    <>
      <Head>
        <title>สร้างงานซ่อม - OBT Smart System</title>
      </Head>

      <div className="p-4 md:p-6 2xl:p-10">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              สร้างงานซ่อมบำรุง
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {reportId ? `จากรายงาน #${reportId}` : 'สร้างงานซ่อมใหม่'}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← กลับ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หัวข้องานซ่อม *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น ซ่อมเครื่องปรับอากาศ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    รายละเอียดงานซ่อม *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="อธิบายรายละเอียดงานซ่อม..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      มอบหมายให้ *
                    </label>
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">เลือกผู้รับผิดชอบ</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ลำดับความสำคัญ *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ต่ำ">ต่ำ</option>
                      <option value="ปานกลาง">ปานกลาง</option>
                      <option value="สูง">สูง</option>
                      <option value="ฉุกเฉิน">ฉุกเฉิน</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ค่าใช้จ่ายประมาณการ (บาท)
                    </label>
                    <input
                      type="number"
                      name="estimatedCost"
                      value={formData.estimatedCost}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      กำหนดเสร็จ
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุเพิ่มเติม
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {submitting ? 'กำลังบันทึก...' : 'สร้างงานซ่อม'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Report Info */}
          {report && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  ข้อมูลรายงาน
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      รหัสรายงาน
                    </label>
                    <p className="text-gray-800 dark:text-white font-mono">
                      #{report.ticketId || report.id}
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

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ผู้แจ้ง
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {report.reportedBy}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      เบอร์โทร
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {report.reporterPhone}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      วันที่แจ้ง
                    </label>
                    <p className="text-gray-800 dark:text-white text-sm">
                      {new Date(report.reportedAt).toLocaleString('th-TH')}
                    </p>
                  </div>

                  {report.images && report.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                        รูปภาพประกอบ
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {report.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`รูปภาพ ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>หมายเหตุ:</strong> เมื่อสร้างงานซ่อมเสร็จ สถานะของรายงานจะถูกอัปเดตเป็น &ldquo;กำลังดำเนินการ&rdquo; โดยอัตโนมัติ
                </p>
              </div>
            </div>
          )}
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
      </>
    );
  }

export async function getServerSideProps() {
  return {
    props: {},
  }
}

