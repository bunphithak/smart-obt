import { useState, useEffect } from 'react';
import UserForm from '../../components/UserForm';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

export default function UsersPage() {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState([]);
  const [villages, setVillages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState({ role: '', status: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null, title: '', confirmText: '', type: 'info' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, villagesRes, rolesRes] = await Promise.all([
        apiCall('/api/users'),
        fetch('/api/villages'), // Villages is public
        fetch('/api/roles') // Roles is public
      ]);

      const usersData = await usersRes.json();
      const villagesData = await villagesRes.json();
      const rolesData = await rolesRes.json();

      console.log('Roles data:', rolesData);

      if (usersData.success) setUsers(usersData.data);
      if (villagesData.success) setVillages(villagesData.data);
      if (rolesData.success) {
        console.log('Setting roles:', rolesData.data);
        setRoles(rolesData.data);
      }
      
      setLoading(false);
    } catch (fetchError) {
      console.error('Error:', fetchError);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    // Show confirmation
    const action = editingUser ? 'แก้ไข' : 'เพิ่ม';
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการบันทึก',
      message: `ต้องการ${action}ผู้ใช้ "${formData.fullName}" ใช่หรือไม่?`,
      confirmText: 'บันทึก',
      type: 'info',
      onConfirm: async () => {
        try {
          const method = editingUser ? 'PUT' : 'POST';
          const data = editingUser ? { ...formData, id: editingUser.id } : formData;

          const res = await apiCall('/api/users', {
            method,
            body: JSON.stringify(data)
          });

          const result = await res.json();

          if (result.success) {
            setAlertModal({
              isOpen: true,
              message: editingUser ? 'แก้ไขข้อมูลผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้สำเร็จ',
              type: 'success'
            });
            setShowForm(false);
            setEditingUser(null);
            fetchData();
          } else {
            setAlertModal({
              isOpen: true,
              message: 'เกิดข้อผิดพลาด: ' + result.error,
              type: 'error'
            });
          }
        } catch (error) {
          setAlertModal({
            isOpen: true,
            message: 'ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง',
            type: 'error'
          });
          console.error(error);
        } finally {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null, title: '', confirmText: '', type: 'info' });
        }
      }
    });
  };

  const handleDelete = async (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบ',
      message: `ต้องการลบผู้ใช้ "${user.fullName}" ออกจากระบบใช่หรือไม่? สามารถกู้คืนได้ในภายหลัง`,
      confirmText: 'ลบ',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await apiCall(`/api/users?id=${user.id}`, { method: 'DELETE' });
          const result = await res.json();

          if (result.success) {
            setAlertModal({
              isOpen: true,
              message: 'ลบผู้ใช้ออกจากระบบสำเร็จ',
              type: 'success'
            });
            fetchData();
          } else {
            setAlertModal({
              isOpen: true,
              message: 'เกิดข้อผิดพลาด: ' + result.error,
              type: 'error'
            });
          }
        } catch (error) {
          setAlertModal({
            isOpen: true,
            message: 'ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง',
            type: 'error'
          });
        }
      }
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'technician':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'technician': return 'ช่างซ่อม';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter.role && !user.roles.some(role => role.name === filter.role)) return false;
    
    // Handle status filter
    if (filter.status) {
      const isActive = user.isActive;
      if (filter.status === 'active' && !isActive) return false;
      if (filter.status === 'inactive' && isActive) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
            className="mt-3 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มผู้ใช้
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกบทบาท</option>
            {roles && roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.displayName}
              </option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ปิดการใช้งาน</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ผู้ดูแลระบบ</p>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ช่างซ่อม</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'technician').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อผู้ใช้</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมู่บ้าน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{user.username}</td>
                  <td className="px-6 py-4 text-sm">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.map((role, index) => (
                        <span 
                          key={role.id} 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(role.name)}`}
                        >
                          {getRoleText(role.name)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.villageId ? (
                      villages.find(v => v.id === user.villageId)?.name || 'ไม่ระบุ'
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'ใช้งาน' : 'ปิดการใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowForm(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="แก้ไข"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลผู้ใช้</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
              </h2>
              <UserForm
                user={editingUser}
                villages={villages}
                roles={roles}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null, title: '', confirmText: '', type: 'info' })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="ยกเลิก"
        type={confirmModal.type}
      />
    </div>
  );
}

