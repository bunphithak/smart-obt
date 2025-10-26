import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import { useAuth } from '../../contexts/AuthContext';

export default function ProblemTypesPage() {
  const { apiCall } = useAuth();
  const [problemTypes, setProblemTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true,
  });

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [confirmData, setConfirmData] = useState({ message: '', onConfirm: null, isDelete: false });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchProblemTypes();
    fetchCategories();
  }, []);

  const fetchProblemTypes = async () => {
    try {
      const res = await fetch('/api/problem-types');
      const data = await res.json();
      if (data.success) {
        setProblemTypes(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.name.trim()) {
      showAlert('ข้อผิดพลาด', 'กรุณากรอกชื่อประเภทปัญหา', 'error');
      return;
    }

    if (!formData.categoryId) {
      showAlert('ข้อผิดพลาด', 'กรุณาเลือกหมวดหมู่ทรัพย์สิน', 'error');
      return;
    }

    // Show confirmation
    const action = editingItem ? 'แก้ไข' : 'เพิ่ม';
    setConfirmData({
      message: `ต้องการ${action}ประเภทปัญหา "${formData.name}" ใช่หรือไม่?`,
      isDelete: false,
      onConfirm: async () => {
        try {
          const method = editingItem ? 'PUT' : 'POST';
          const data = editingItem ? { ...formData, id: editingItem.id } : formData;

          console.log('Sending data:', data);
          
          const res = await apiCall('/api/problem-types', {
            method,
            body: JSON.stringify(data)
          });

          const result = await res.json();
          console.log('Response:', result);

          if (result.success) {
            showAlert(
              'สำเร็จ',
              editingItem ? 'แก้ไขประเภทปัญหาสำเร็จ' : 'เพิ่มประเภทปัญหาสำเร็จ',
              'success'
            );
            setShowForm(false);
            setEditingItem(null);
            setFormData({ name: '', description: '', categoryId: '', isActive: true });
            fetchProblemTypes();
          } else {
            showAlert('ข้อผิดพลาด', result.error, 'error');
          }
        } catch (error) {
          showAlert('ข้อผิดพลาด', 'ไม่สามารถบันทึกได้', 'error');
          console.error(error);
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId || '',
      isActive: item.isActive !== undefined ? item.isActive : true
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await apiCall(`/api/problem-types?id=${itemToDelete.id}`, {
        method: 'DELETE'
      });
      const result = await res.json();

      if (result.success) {
        showAlert('สำเร็จ', 'ลบประเภทปัญหาสำเร็จ', 'success');
        fetchProblemTypes();
      } else {
        showAlert('ข้อผิดพลาด', result.error, 'error');
      }
    } catch (error) {
      showAlert('ข้อผิดพลาด', 'ไม่สามารถลบได้', 'error');
      console.error(error);
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            จัดการประเภทปัญหา
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            จัดการประเภทปัญหาที่ผู้ใช้สามารถแจ้งได้ (ผูกกับหมวดหมู่)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>เพิ่มประเภทปัญหา</span>
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คำอธิบาย</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {problemTypes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลประเภทปัญหา
                  </td>
                </tr>
              ) : (
                problemTypes.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-sm">{item.categoryName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="แก้ไข"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="text-red-600 hover:text-red-800"
                          title="ลบ"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'แก้ไขประเภทปัญหา' : 'เพิ่มประเภทปัญหาใหม่'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({ name: '', description: '', categoryId: '', isActive: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อประเภทปัญหา <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น ไฟส่องสว่าง"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="อธิบายรายละเอียด..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่ทรัพย์สิน <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
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
                  <label className="flex items-center justify-between mb-2">
                    <span className="block text-sm font-medium text-gray-700">
                      สถานะ
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-xs text-gray-500">
                    {formData.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({ name: '', description: '', categoryId: '', isActive: true });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทปัญหา'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setItemToDelete(null);
        }}
        onConfirm={itemToDelete ? handleDelete : confirmData.onConfirm}
        title={itemToDelete ? "ยืนยันการลบ" : "ยืนยันการบันทึก"}
        message={itemToDelete ? `ต้องการลบประเภทปัญหา "${itemToDelete.name}" ใช่หรือไม่?` : confirmData.message}
        confirmText={itemToDelete ? "ลบ" : "บันทึก"}
        cancelText="ยกเลิก"
        type={itemToDelete ? "danger" : "info"}
      />
    </div>
  );
}

