import { useState, useEffect } from 'react';
import AlertModal from './AlertModal';

export default function CreateRepairModal({ isOpen, onClose, reportId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [report, setReport] = useState(null);
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
    if (isOpen) {
      fetchUsers();
      if (reportId) {
        fetchReportDetail();
      }
    }
  }, [isOpen, reportId]);

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

  const fetchReportDetail = async () => {
    try {
      const res = await fetch(`/api/reports?id=${reportId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const reportData = data.data[0];
        setReport(reportData);
        // Pre-fill form with report data
        setFormData(prev => ({
          ...prev,
          title: reportData.problemType || reportData.title || '',
          description: reportData.description || '',
          priority: reportData.priority || 'ปานกลาง'
        }));
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const repairData = {
        ...formData,
        reportId: reportId,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        dueDate: formData.dueDate || null
      };

      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairData)
      });

      const data = await res.json();
      
      if (data.success) {
        showAlert('success', 'สร้างงานซ่อมสำเร็จ', 'สร้างงานซ่อมเรียบร้อยแล้ว');
        if (onSuccess) {
          onSuccess(data.data);
        }
        // Reset form
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'ปานกลาง',
          estimatedCost: '',
          dueDate: '',
          notes: ''
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error || 'เกิดข้อผิดพลาดในการสร้างงานซ่อม');
      }
    } catch (error) {
      console.error('Error creating repair:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสร้างงานซ่อม');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">สร้างงานซ่อม</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {report && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">ข้อมูลรายงานที่เกี่ยวข้อง</h3>
                <p className="text-blue-800 text-sm">
                  <strong>หัวข้อ:</strong> {report.title || report.problemType}<br/>
                  <strong>รายละเอียด:</strong> {report.description}<br/>
                  <strong>ความสำคัญ:</strong> {report.priority}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้องานซ่อม *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="ระบุหัวข้องานซ่อม"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดงานซ่อม *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="อธิบายรายละเอียดงานซ่อม..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    มอบหมายให้
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">เลือกช่างซ่อม</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความสำคัญ
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณที่คาดการณ์
                  </label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่ครบกำหนด
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'กำลังสร้าง...' : 'สร้างงานซ่อม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
    </>
  );
}
