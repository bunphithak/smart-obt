import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamic import for MapPicker (client-side only)
const MapPicker = dynamic(() => import('../../components/MapPicker'), {
  ssr: false,
});

export default function RepairDetailPage() {
  const router = useRouter();
  const { id, edit } = router.query;
  
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'รอดำเนินการ',
    priority: 'ปานกลาง',
    assignedTo: '',
    estimatedCost: '',
    actualCost: '',
    dueDate: '',
    notes: '',
    location: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    if (id) {
      fetchRepairDetail();
      fetchTechnicians();
    }
  }, [id]);

  useEffect(() => {
    if (edit === 'true') {
      setIsEditing(true);
    }
  }, [edit]);

  const fetchRepairDetail = async () => {
    try {
      const res = await fetch(`/api/repairs?id=${id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const repairData = data.data;
        setRepair(repairData);
        setFormData({
          title: repairData.title || '',
          description: repairData.description || '',
          status: repairData.status || 'รอดำเนินการ',
          priority: repairData.priority || 'ปานกลาง',
          assignedTo: repairData.assignedTo || '',
          estimatedCost: repairData.estimatedCost || '',
          actualCost: repairData.actualCost || '',
          dueDate: repairData.dueDate ? repairData.dueDate.split('T')[0] : '',
          notes: repairData.notes || '',
          location: repairData.location || '',
          latitude: repairData.latitude || null,
          longitude: repairData.longitude || null
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair:', error);
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('/api/users?role=technician');
      const data = await res.json();
      if (data.success) {
        setTechnicians(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
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
        alert('บันทึกข้อมูลสำเร็จ');
        router.push('/repairs');
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating repair:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleLocationSelect = (location, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      location,
      latitude: lat,
      longitude: lng
    }));
    setShowMapPicker(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'รอดำเนินการ': return 'bg-yellow-100 text-yellow-800';
      case 'กำลังดำเนินการ': return 'bg-blue-100 text-blue-800';
      case 'เสร็จสิ้น': return 'bg-green-100 text-green-800';
      case 'ยกเลิก': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'ต่ำ': return 'text-green-600 bg-green-100';
      case 'ปานกลาง': return 'text-yellow-600 bg-yellow-100';
      case 'สูง': return 'text-orange-600 bg-orange-100';
      case 'ฉุกเฉิน': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">ไม่พบข้อมูลงานซ่อม</p>
          <button
            onClick={() => router.push('/repairs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {isEditing ? 'แก้ไขงานซ่อม' : 'รายละเอียดงานซ่อม'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {repair.ticketId && `เลขที่รายงาน: ${repair.ticketId}`}
          </p>
        </div>
        {!isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              แก้ไข
            </button>
            <button
              onClick={() => router.push('/repairs')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              กลับ
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">ข้อมูลพื้นฐาน</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อ *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{repair.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียด
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{repair.description || '-'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานะ
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
                      {repair.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความสำคัญ
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ต่ำ">ต่ำ</option>
                      <option value="ปานกลาง">ปานกลาง</option>
                      <option value="สูง">สูง</option>
                      <option value="ฉุกเฉิน">ฉุกเฉิน</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(repair.priority)}`}>
                      {repair.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment & Cost */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">การมอบหมายและค่าใช้จ่าย</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ช่างผู้รับผิดชอบ
                </label>
                {isEditing ? (
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกช่าง --</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {repair.assignedTo || <span className="text-orange-600 font-medium">รอจ่ายงาน</span>}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณ (ประเมิน)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {repair.estimatedCost ? `฿${Number(repair.estimatedCost).toLocaleString()}` : '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ค่าใช้จ่ายจริง
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.actualCost}
                      onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {repair.actualCost ? `฿${Number(repair.actualCost).toLocaleString()}` : '-'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  กำหนดเสร็จ
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {repair.dueDate ? new Date(repair.dueDate).toLocaleDateString('th-TH') : '-'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">ตำแหน่ง</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่
                </label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ระบุสถานที่"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🗺️ แผนที่
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900">{repair.location || '-'}</p>
                )}
              </div>

              {(formData.latitude && formData.longitude) && (
                <div className="text-sm text-gray-600">
                  📍 พิกัด: {formData.latitude}, {formData.longitude}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">บันทึกเพิ่มเติม</h2>
            
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="บันทึกเพิ่มเติม..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{repair.notes || '-'}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info */}
          {repair.reportId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold mb-4">รายงานต้นทาง</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Ticket ID</p>
                  <p className="font-medium text-blue-600">{repair.ticketId}</p>
                </div>
                {repair.reportTitle && (
                  <div>
                    <p className="text-sm text-gray-500">หัวข้อรายงาน</p>
                    <p className="text-gray-900">{repair.reportTitle}</p>
                  </div>
                )}
                <button
                  onClick={() => router.push(`/reports/${repair.reportId}`)}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  ดูรายงานต้นทาง
                </button>
              </div>
            </div>
          )}

          {/* Asset Info */}
          {repair.assetCode && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold mb-4">ทรัพย์สิน</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">รหัสทรัพย์สิน</p>
                  <p className="font-medium">{repair.assetCode}</p>
                </div>
                {repair.assetName && (
                  <div>
                    <p className="text-sm text-gray-500">ชื่อทรัพย์สิน</p>
                    <p className="text-gray-900">{repair.assetName}</p>
                  </div>
                )}
                {repair.villageName && (
                  <div>
                    <p className="text-sm text-gray-500">หมู่บ้าน</p>
                    <p className="text-gray-900">{repair.villageName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">ข้อมูลเวลา</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">สร้างเมื่อ</p>
                <p className="text-gray-900">
                  {new Date(repair.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
              {repair.startDate && (
                <div>
                  <p className="text-gray-500">เริ่มงาน</p>
                  <p className="text-gray-900">
                    {new Date(repair.startDate).toLocaleString('th-TH')}
                  </p>
                </div>
              )}
              {repair.completedDate && (
                <div>
                  <p className="text-gray-500">เสร็จสิ้น</p>
                  <p className="text-gray-900">
                    {new Date(repair.completedDate).toLocaleString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      {isEditing && (
        <div className="mt-6 flex justify-end space-x-4 pb-6">
          <button
            onClick={() => {
              setIsEditing(false);
              fetchRepairDetail(); // Reset form
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            💾 บันทึก
          </button>
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
          initialLocation={formData.location}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
        />
      )}
    </div>
  );
}
