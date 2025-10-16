import { useState, useEffect } from 'react';

export default function VillagesPage() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    contactPerson: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      const res = await fetch('/api/villages');
      const data = await res.json();
      if (data.success) {
        setVillages(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingVillage ? 'PUT' : 'POST';
      const data = editingVillage ? { ...formData, id: editingVillage.id } : formData;

      const res = await fetch('/api/villages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        alert(editingVillage ? 'แก้ไขสำเร็จ' : 'เพิ่มหมู่บ้านสำเร็จ');
        setShowForm(false);
        setEditingVillage(null);
        setFormData({ name: '', code: '', address: '', contactPerson: '', contactPhone: '' });
        fetchVillages();
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('ไม่สามารถบันทึกได้');
      console.error(error);
    }
  };

  const handleEdit = (village) => {
    setEditingVillage(village);
    setFormData({
      name: village.name,
      code: village.code,
      address: village.address || '',
      contactPerson: village.contactPerson || '',
      contactPhone: village.contactPhone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (village) => {
    if (!confirm(`ต้องการลบหมู่บ้าน "${village.name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/villages?id=${village.id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        alert('ลบสำเร็จ');
        fetchVillages();
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('ไม่สามารถลบได้');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
              จัดการหมู่บ้าน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              จัดการข้อมูลหมู่บ้านในพื้นที่
            </p>
          </div>
          <button
            onClick={() => {
              setEditingVillage(null);
              setFormData({ name: '', code: '', address: '', contactPerson: '', contactPhone: '' });
              setShowForm(true);
            }}
            className="mt-3 sm:mt-0 inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มหมู่บ้าน
          </button>
        </div>
      </div>

      {/* Villages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {villages.map(village => (
          <div key={village.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{village.name}</h3>
                  <p className="text-sm text-blue-100">รหัส: {village.code}</p>
                </div>
                <div className="text-2xl">🏘️</div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">ที่อยู่</p>
                <p className="text-sm text-gray-700">{village.address || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">ผู้ติดต่อ</p>
                  <p className="text-sm text-gray-700">{village.contactPerson || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">เบอร์โทร</p>
                  <p className="text-sm text-gray-700">{village.contactPhone || '-'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">จำนวนทรัพย์สิน</p>
                <p className="text-2xl font-bold text-blue-600">{village.totalAssets || 0}</p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleEdit(village)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(village)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {villages.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">ไม่มีข้อมูลหมู่บ้าน</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingVillage ? 'แก้ไขหมู่บ้าน' : 'เพิ่มหมู่บ้านใหม่'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อหมู่บ้าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น หมู่ 1 บ้านตัวอย่าง"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสหมู่บ้าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    disabled={!!editingVillage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="เช่น V001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ที่อยู่
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ที่อยู่หมู่บ้าน"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ผู้ติดต่อ
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นายกำนัน / ผู้ใหญ่บ้าน"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="08X-XXX-XXXX"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingVillage ? 'บันทึกการแก้ไข' : 'เพิ่มหมู่บ้าน'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingVillage(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

