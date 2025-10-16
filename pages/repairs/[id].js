import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RepairDetailPage() {
  const router = useRouter();
  const { id, edit } = router.query; // Get edit parameter from URL
  
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'ปานกลาง',
    estimatedCost: '',
    dueDate: '',
    notes: '',
    status: '',
    actualCost: '',
    completedDate: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRepairDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/repairs?id=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const repairData = data.data[0];
        setRepair(repairData);
        setFormData({
          title: repairData.title || '',
          description: repairData.description || '',
          assignedTo: repairData.assignedTo || '',
          priority: repairData.priority || 'ปานกลาง',
          estimatedCost: repairData.estimatedCost || '',
          dueDate: repairData.dueDate || '',
          notes: repairData.notes || '',
          status: repairData.status || 'รอดำเนินการ',
          actualCost: repairData.actualCost || '',
          completedDate: repairData.completedDate || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isClient && id) {
      fetchRepairDetail();
    }
  }, [isClient, id, fetchRepairDetail]);

  // Auto-open edit mode if edit=true in URL
  useEffect(() => {
    if (isClient && edit === 'true') {
      setIsEditing(true);
    }
  }, [isClient, edit]);

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
    
    try {
      const res = await fetch('/api/repairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: repair.id,
          ...formData
        })
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'อัปเดตสำเร็จ', 'อัปเดตข้อมูลงานซ่อมเรียบร้อยแล้ว');
        setIsEditing(false);
        fetchRepairDetail();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (error) {
      console.error('Error updating repair:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่');
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

  if (!repair) {
    return (
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลงานซ่อม</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>รายละเอียดงานซ่อม - Smart OBT</title>
      </Head>

      <div className="p-4 md:p-6 2xl:p-10">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {isEditing ? 'แก้ไขงานซ่อม' : 'รายละเอียดงานซ่อม'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              รหัสงาน #{repair.id}
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              {isEditing ? (
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
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        มอบหมายให้ *
                      </label>
                      <input
                        type="text"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ค่าใช้จ่ายจริง (บาท)
                      </label>
                      <input
                        type="number"
                        name="actualCost"
                        value={formData.actualCost}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        กำหนดเสร็จ
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        วันที่เสร็จสิ้น
                      </label>
                      <input
                        type="date"
                        name="completedDate"
                        value={formData.completedDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      สถานะ
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ยกเลิก">ยกเลิก</option>
                    </select>
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
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      บันทึกการเปลี่ยนแปลง
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      {repair.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {repair.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ข้อมูลงานซ่อม</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ช่างที่รับผิดชอบ:</span>
                          <span className="font-medium">{repair.assignedTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ความสำคัญ:</span>
                          <span className={`font-medium ${
                            repair.priority === 'สูง' ? 'text-red-600' :
                            repair.priority === 'ปานกลาง' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {repair.priority}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">สถานะ:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            repair.status === 'รอดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                            repair.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-800' :
                            repair.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {repair.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ข้อมูลการเงิน</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ค่าใช้จ่ายประมาณการ:</span>
                          <span className="font-medium">
                            {repair.estimatedCost ? `฿${repair.estimatedCost.toLocaleString()}` : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ค่าใช้จ่ายจริง:</span>
                          <span className="font-medium">
                            {repair.actualCost ? `฿${repair.actualCost.toLocaleString()}` : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {repair.dueDate && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">กำหนดการ</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">กำหนดเสร็จ:</span>
                          <span className="font-medium">{new Date(repair.dueDate).toLocaleDateString('th-TH')}</span>
                        </div>
                        {repair.completedDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">วันที่เสร็จสิ้น:</span>
                            <span className="font-medium">{new Date(repair.completedDate).toLocaleDateString('th-TH')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {repair.notes && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">หมายเหตุ</h4>
                      <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {repair.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                ข้อมูลเพิ่มเติม
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    รหัสงาน
                  </label>
                  <p className="text-gray-800 dark:text-white font-mono">
                    #{repair.id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    วันที่สร้าง
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {new Date(repair.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>

                {repair.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      อัปเดตล่าสุด
                    </label>
                    <p className="text-gray-800 dark:text-white">
                      {new Date(repair.updatedAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                )}
              </div>
            </div>
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
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
