import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import { useAuth } from '../../contexts/AuthContext';

export default function CategoriesPage() {
  const { apiCall } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    codePrefix: '',
    isActive: true,
  });

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [confirmData, setConfirmData] = useState({ message: '', onConfirm: null, isDelete: false });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation
    const action = editingCategory ? 'แก้ไข' : 'เพิ่ม';
    setConfirmData({
      message: `ต้องการ${action}หมวดหมู่ "${formData.name}" ใช่หรือไม่?`,
      isDelete: false,
      onConfirm: async () => {
        try {
          const method = editingCategory ? 'PUT' : 'POST';
          const data = editingCategory ? { ...formData, id: editingCategory.id } : formData;

          const res = await apiCall('/api/categories', {
            method,
            body: JSON.stringify(data)
          });

          const result = await res.json();

          if (result.success) {
            showAlert(
              'สำเร็จ',
              editingCategory ? 'แก้ไขหมวดหมู่สำเร็จ' : 'เพิ่มหมวดหมู่สำเร็จ',
              'success'
            );
            setShowForm(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '', codePrefix: '', isActive: true });
            fetchCategories();
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

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      codePrefix: category.codePrefix || '',
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setConfirmData({
      message: `คุณต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?`,
      isDelete: true,
      onConfirm: handleDeleteConfirm
    });
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await apiCall(`/api/categories?id=${categoryToDelete.id}`, { 
        method: 'DELETE' 
      });
      const result = await res.json();

      setShowConfirmModal(false);
      
      if (result.success) {
        showAlert('สำเร็จ', 'ลบหมวดหมู่สำเร็จ', 'success');
        fetchCategories();
      } else {
        showAlert('ข้อผิดพลาด', result.error, 'error');
      }
      
      setCategoryToDelete(null);
    } catch (error) {
      setShowConfirmModal(false);
      showAlert('ข้อผิดพลาด', 'ไม่สามารถลบได้', 'error');
      setCategoryToDelete(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              จัดการหมวดหมู่
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              จัดการหมวดหมู่ทรัพย์สินในระบบ
            </p>
          </div>
          {/* <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', codePrefix: '', isActive: true });
              setShowForm(true);
            }}
            className="mt-3 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มหมวดหมู่
          </button> */}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">หมวดหมู่ทั้งหมด</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {categories.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ใช้งานได้</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {categories.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ไม่ใช้งาน</p>
          <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {categories.filter(c => !c.isActive).length}
          </p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ลำดับ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">รหัส</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อหมวดหมู่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คำอธิบาย</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-center font-medium text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {category.codePrefix || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-green-600 hover:text-green-900"
                        title="แก้ไข"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* <button
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-600 hover:text-red-900"
                        title="ลบ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">ไม่มีข้อมูลหมวดหมู่</p>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น เฟอร์นิเจอร์, อุปกรณ์ไฟฟ้า"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสคำนำหน้า (Prefix) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="codePrefix"
                    value={formData.codePrefix}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น LED (สำหรับรหัส LED-000001)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ใช้สำหรับสร้างรหัสทรัพย์สินอัตโนมัติ เช่น LED-000001, LED-000002
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="คำอธิบายหมวดหมู่..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">ใช้งาน</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setCategoryToDelete(null);
          setConfirmData({ message: '', onConfirm: null, isDelete: false });
        }}
        onConfirm={confirmData.onConfirm}
        title={confirmData.isDelete ? "ยืนยันการลบ" : "ยืนยันการบันทึก"}
        message={confirmData.message}
        confirmText={confirmData.isDelete ? "ลบ" : "บันทึก"}
        cancelText="ยกเลิก"
        type={confirmData.isDelete ? "danger" : "info"}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
    </div>
  );
}
