import { useState, useEffect } from 'react';

export default function UserForm({ user, villages, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    role: 'user',
    villageId: '',
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords if creating new user or changing password
    if (!user || formData.password) {
      if (formData.password !== formData.confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
      }
      if (!user && !formData.password) {
        alert('กรุณากรอกรหัสผ่าน');
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
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">ผู้ใช้งานทั่วไป</option>
          <option value="technician">ช่างซ่อม</option>
          <option value="admin">ผู้ดูแลระบบ</option>
        </select>
      </div>

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

      {user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สถานะ
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">ใช้งาน</option>
            <option value="inactive">ปิดการใช้งาน</option>
          </select>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {user ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

