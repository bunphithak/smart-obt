import { useState, useEffect } from 'react';

export default function UserForm({ user, villages, roles, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    roles: [], // Array of role IDs
    villageId: '',
    phone: '',
    isActive: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('UserForm received roles:', roles);
    if (user) {
      setFormData({
        ...user,
        roles: user.roles?.map(r => r.id) || [], // Extract role IDs
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(id => id !== roleId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate roles
    if (formData.roles.length === 0) {
      setError('กรุณาเลือกอย่างน้อย 1 บทบาท');
      return;
    }

    // Validate passwords if creating new user or changing password
    if (!user || formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return;
      }
      if (!user && !formData.password) {
        setError('กรุณากรอกรหัสผ่าน');
        return;
      }
    }

    // Remove confirmPassword from submit data
    const { confirmPassword, ...submitData } = formData;
    
    // Don't send empty password on update
    if (user && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้ใช้ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={!!user}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="username"
        />
      </div>

      {!user && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="รหัสผ่าน"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={!user}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ยืนยันรหัสผ่าน"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ชื่อ-นามสกุล"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เบอร์โทรศัพท์
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0812345678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          บทบาท <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {roles && roles.length > 0 ? (
            roles.map(role => (
              <label key={role.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role.id)}
                  onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {role.displayName || role.display_name || role.name}
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">กำลังโหลด...</p>
          )}
        </div>
        {formData.roles.length === 0 && (
          <p className="text-red-500 text-xs mt-1">กรุณาเลือกอย่างน้อย 1 บทบาท</p>
        )}
      </div>

      {formData.roles.some(roleId => {
        const role = roles?.find(r => r.id === roleId);
        return role?.name === 'technician';
      }) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            หมู่บ้าน
          </label>
          <select
            name="villageId"
            value={formData.villageId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ไม่ระบุ</option>
            {villages && villages.map(village => (
              <option key={village.id} value={village.id}>
                {village.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานะ
          </label>
          <select
            name="isActive"
            value={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={true}>ใช้งาน</option>
            <option value={false}>ปิดการใช้งาน</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-md hover:shadow-lg"
        >
          {user ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
        </button>
      </div>
    </form>
  );
}

