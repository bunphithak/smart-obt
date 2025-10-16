import { useState, useEffect } from 'react';

export default function AssetForm({ asset, villages, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    villageId: '',
    description: '',
    status: 'ใช้งานได้'
  });

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อทรัพย์สิน <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น โต๊ะทำงาน"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รหัสทรัพย์สิน <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
          disabled={!!asset}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="เช่น AST-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมวดหมู่
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกหมวดหมู่</option>
          <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
          <option value="อุปกรณ์ไฟฟ้า">อุปกรณ์ไฟฟ้า</option>
          <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
          <option value="ยานพาหนะ">ยานพาหนะ</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมู่บ้าน <span className="text-red-500">*</span>
        </label>
        <select
          name="villageId"
          value={formData.villageId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกหมู่บ้าน</option>
          {villages && villages.map(village => (
            <option key={village.id} value={village.id}>
              {village.name}
            </option>
          ))}
        </select>
      </div>

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
          <option value="ใช้งานได้">ใช้งานได้</option>
          <option value="ชำรุด">ชำรุด</option>
          <option value="กำลังซ่อม">กำลังซ่อม</option>
          <option value="จำหน่าย">จำหน่าย</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รายละเอียด
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="รายละเอียดเพิ่มเติม..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {asset ? 'บันทึกการแก้ไข' : 'เพิ่มทรัพย์สิน'}
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

