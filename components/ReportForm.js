import { useState, useEffect } from 'react';
import { PRIORITY, PRIORITY_LABELS } from '../lib/constants';

export default function ReportForm({ report, assets, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: PRIORITY.MEDIUM,
    reportedBy: ''
  });

  useEffect(() => {
    if (report) {
      setFormData(report);
    }
  }, [report]);

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
          ทรัพย์สิน <span className="text-red-500">*</span>
        </label>
        <select
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">เลือกทรัพย์สิน</option>
          {assets && assets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.code} - {asset.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หัวข้อปัญหา <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น ขาโต๊ะหัก"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รายละเอียดปัญหา <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="อธิบายปัญหาโดยละเอียด..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ระดับความสำคัญ
        </label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
          <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
          <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
          <option value={PRIORITY.URGENT}>{PRIORITY_LABELS[PRIORITY.URGENT]}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ผู้แจ้ง
        </label>
        <input
          type="text"
          name="reportedBy"
          value={formData.reportedBy}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ชื่อผู้แจ้ง"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          แนบรูปภาพ
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ภาพ JPG, PNG (สูงสุด 5 ไฟล์)</p>
      </div>

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
          {report ? 'บันทึกการแก้ไข' : 'แจ้งปัญหา'}
        </button>
      </div>
    </form>
  );
}

