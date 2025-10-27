import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { REPAIR_STATUS, PRIORITY, PRIORITY_LABELS } from '../../lib/constants';
import MapModal from '../../components/MapModal';

export default function NewRepairPage() {
  const router = useRouter();
  const { reportId } = router.query;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [categories, setCategories] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [showMap, setShowMap] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: PRIORITY.MEDIUM,
    estimatedCost: '',
    dueDate: '',
    notes: '',
    categoryId: '',
    problemType: '',
    reportedBy: '',
    locationName: '',
    locationAddress: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users?role=technician');
      const data = await res.json();
      console.log('Technicians API response:', data); // Debug log
      if (data.success) {
        setTechnicians(data.data);
        console.log('Technicians loaded:', data.data.length); // Debug log
      } else {
        console.error('Failed to fetch technicians:', data.error);
        showAlert('error', 'ไม่สามารถโหลดข้อมูลช่างได้', data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูลช่าง');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('error', 'ไม่สามารถโหลดข้อมูลช่างได้', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProblemTypes = async () => {
    try {
      const res = await fetch('/api/enums?type=problem_types');
      const data = await res.json();
      if (data.success) {
        setProblemTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching problem types:', error);
    }
  };

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        return user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  const handleLocationSelect = (lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      locationAddress: address || ''
    }));
    setShowMap(false);
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
          priority: reportData.priority || PRIORITY.MEDIUM
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
      fetchCategories();
      fetchProblemTypes();
      const user = getCurrentUser();
      
      // Set reportedBy to current user
      if (user) {
        setFormData(prev => ({
          ...prev,
          reportedBy: user.fullName || user.username || user.name
        }));
      }
      
      if (reportId) {
        fetchReportDetail();
      } else {
        setLoading(false);
      }
    }
  }, [isClient, reportId, fetchReportDetail, fetchUsers]);

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
    
    console.log('Form submission started', { formData, technicians: technicians.length }); // Debug log
    
    // Validate: ต้องมีช่างผู้รับผิดชอบ
    if (!formData.assignedTo) {
      if (technicians.length === 0) {
        showAlert('error', 'ไม่สามารถบันทึกได้', 'ไม่พบช่างในระบบ กรุณาติดต่อผู้ดูแลระบบ');
      } else {
        showAlert('error', 'ไม่สามารถบันทึกได้', 'กรุณาระบุช่างผู้รับผิดชอบ');
      }
      return;
    }
    
    setSubmitting(true);

    try {
      const repairData = {
        ...formData,
        reportId: reportId || null,
        assetCode: report?.assetCode || null,
        status: REPAIR_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        categoryId: formData.categoryId || null,
        problemType: formData.problemType || null,
        reportedBy: formData.reportedBy || currentUser?.fullName || currentUser?.username || currentUser?.name || 'ไม่ระบุ'
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
                      <option value="">เลือกช่างผู้รับผิดชอบ</option>
                      {technicians.length === 0 ? (
                        <option value="" disabled>ไม่พบช่างในระบบ</option>
                      ) : (
                        technicians.map(technician => (
                          <option key={technician.id} value={technician.id}>
                            {technician.name} ({technician.username})
                          </option>
                        ))
                      )}
                    </select>
                    {technicians.length === 0 && (
                      <p className="text-red-500 text-sm mt-1">
                        ⚠️ ไม่พบช่างในระบบ กรุณาติดต่อผู้ดูแลระบบ
                      </p>
                    )}
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
                      <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                      <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                      <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                      <option value={PRIORITY.URGENT}>{PRIORITY_LABELS[PRIORITY.URGENT]}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      หมวดหมู่
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ประเภทปัญหา
                    </label>
                    <select
                      name="problemType"
                      value={formData.problemType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">เลือกประเภทปัญหา</option>
                      {problemTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ชื่อผู้แจ้ง
                  </label>
                  <input
                    type="text"
                    name="reportedBy"
                    value={formData.reportedBy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="ชื่อผู้แจ้ง"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    สถานที่เกิดปัญหา
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="locationAddress"
                      value={formData.locationAddress}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ระบุที่อยู่ หรือคลิก 'ปักหมุด' เพื่อเลือกจากแผนที่"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      ปักหมุด
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <strong>พิกัดที่เลือก:</strong> {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                    </p>
                  )}
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
                    disabled={submitting || technicians.length === 0}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {submitting ? 'กำลังบันทึก...' : technicians.length === 0 ? 'ไม่สามารถสร้างงานซ่อมได้' : 'สร้างงานซ่อม'}
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

        {/* Map Modal */}
        <MapModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          initialAddress={formData.locationAddress}
          onConfirm={handleLocationSelect}
          showQuickUseButton={false}
        />
      </>
    );
  }

export async function getServerSideProps() {
  return {
    props: {},
  }
}

