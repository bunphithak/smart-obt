import { useState, useEffect } from 'react';
import AlertModal from './AlertModal';
import MapModal from './MapModal';
import { PRIORITY, PRIORITY_LABELS } from '../lib/constants';

export default function CreateRepairModal({ isOpen, onClose, reportId, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [report, setReport] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [assetCode, setAssetCode] = useState('');
  const [assetInfo, setAssetInfo] = useState(null);
  const [searchingAsset, setSearchingAsset] = useState(false);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: PRIORITY.MEDIUM,
    categoryId: '',
    estimatedCost: '',
    dueDate: '',
    notes: '',
    assetCode: '',
    location: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchCategories();
      if (reportId) {
        fetchReportDetail();
      }
    }
  }, [isOpen, reportId]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?role=technician');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProblemTypes = async (categoryId) => {
    if (!categoryId) {
      setProblemTypes([]);
      return;
    }
    try {
      const res = await fetch('/api/problem-types');
      const data = await res.json();
      console.log('📋 Problem Types API Response:', data);
      if (data.success) {
        // Filter problem types by category
        const filtered = data.data.filter(pt => {
          const categoryMatch = String(pt.categoryId) === String(categoryId);
          const isActive = pt.isActive !== false; // Default to true if not specified
          console.log('🎯 Checking:', { 
            ptName: pt.name, 
            ptCategoryId: pt.categoryId, 
            searchCategoryId: categoryId,
            categoryMatch,
            isActive,
            result: categoryMatch && isActive
          });
          return categoryMatch && isActive;
        });
        console.log('🔍 Filtered Problem Types:', { categoryId, filtered });
        setProblemTypes(filtered);
      }
    } catch (error) {
      console.error('Error fetching problem types:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setFormData(prev => ({ ...prev, categoryId, title: '' }));
    fetchProblemTypes(categoryId);
  };

  const fetchReportDetail = async () => {
    try {
      const res = await fetch(`/api/reports?id=${reportId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const reportData = data.data[0];
        setReport(reportData);
        
        // Get category ID from asset or report
        let categoryId = null;
        
        // If assetCode exists, fetch asset details to get category
        if (reportData.assetCode) {
          try {
            const assetRes = await fetch(`/api/assets?code=${reportData.assetCode}`);
            const assetData = await assetRes.json();
            if (assetData.success && assetData.data.length > 0) {
              categoryId = assetData.data[0].categoryId;
            }
          } catch (e) {
            console.error('Error fetching asset:', e);
          }
        }
        
        // Set category ID and fetch problem types
        if (categoryId) {
          setSelectedCategoryId(categoryId);
          await fetchProblemTypes(categoryId);
        }
        
        // Pre-fill form with report data
        setFormData(prev => ({
          ...prev,
          title: reportData.problemType || reportData.title || '',
          description: reportData.description || '',
          priority: reportData.priority || PRIORITY.MEDIUM,
          categoryId: categoryId || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const searchAsset = async (code) => {
    if (!code.trim()) {
      setAssetInfo(null);
      return;
    }

    setSearchingAsset(true);
    try {
      const res = await fetch(`/api/assets?code=${code.trim()}`);
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        const asset = data.data[0];
        setAssetInfo(asset);
        
        // Auto-select category if found
        if (asset.categoryId) {
          setFormData(prev => ({
            ...prev,
            categoryId: asset.categoryId
          }));
        }
      } else {
        setAssetInfo(null);
        showAlert('warning', 'ไม่พบข้อมูล', `ไม่พบทรัพย์สินรหัส ${code}`);
      }
    } catch (error) {
      console.error('Error searching asset:', error);
      setAssetInfo(null);
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาข้อมูลทรัพย์สินได้');
    } finally {
      setSearchingAsset(false);
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

  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: PRIORITY.MEDIUM,
      categoryId: '',
      estimatedCost: '',
      dueDate: '',
      notes: '',
      assetCode: '',
      location: '',
      latitude: null,
      longitude: null
    });
    setAssetCode('');
    setAssetInfo(null);
    setLocation('');
    setCoordinates(null);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: ต้องมีหมวดหมู่
    if (!formData.categoryId) {
      showAlert('error', 'ไม่สามารถบันทึกได้', 'กรุณาเลือกหมวดหมู่');
      return;
    }
    
    // Validate: ต้องมีช่างผู้รับผิดชอบ
    if (!formData.assignedTo) {
      showAlert('error', 'ไม่สามารถบันทึกได้', 'กรุณาระบุช่างผู้รับผิดชอบ');
      return;
    }
    
    setSubmitting(true);

    try {
      const repairData = {
        ...formData,
        reportId: reportId,
        assetCode: assetCode,
        location: location,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null,
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
        clearForm();
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
                onClick={handleClose}
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
                  <strong>ความสำคัญ:</strong> {PRIORITY_LABELS[report.priority] || report.priority}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสทรัพย์สิน (ไม่บังคับ)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assetCode}
                    onChange={(e) => {
                      setAssetCode(e.target.value);
                      // Auto search after 1 second delay
                      clearTimeout(window.assetSearchTimeout);
                      window.assetSearchTimeout = setTimeout(() => {
                        searchAsset(e.target.value);
                      }, 1000);
                    }}
                    placeholder="เช่น ASSET001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => searchAsset(assetCode)}
                    disabled={!assetCode.trim() || searchingAsset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchingAsset ? (
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      '🔍'
                    )}
                  </button>
                </div>
              </div>

              {assetInfo && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ข้อมูลทรัพย์สินที่พบ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>ชื่อ:</strong> {assetInfo.name}</div>
                    <div><strong>รหัส:</strong> {assetInfo.code}</div>
                    <div><strong>หมวดหมู่:</strong> {assetInfo.category}</div>
                    <div><strong>หมู่บ้าน:</strong> {assetInfo.villageName}</div>
                    <div><strong>ตำแหน่ง:</strong> {assetInfo.locationName || 'ไม่ระบุ'}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={selectedCategoryId || formData.categoryId}
                  onChange={handleCategoryChange}
                  required
                  disabled={!!assetInfo}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!!assetInfo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.filter(cat => cat.isActive).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทปัญหา <span className="text-red-500">*</span>
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={!selectedCategoryId && !formData.categoryId}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${(!selectedCategoryId && !formData.categoryId) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">กรุณาเลือก</option>
                  {problemTypes.map((problemType) => (
                    <option key={problemType.id} value={problemType.name}>
                      {problemType.name}
                    </option>
                  ))}
                </select>
                {(selectedCategoryId || formData.categoryId) && problemTypes.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ไม่มีประเภทปัญหาในหมวดหมู่นี้
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดงานซ่อม <span className="text-red-500">*</span>
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
                        {user.fullName}
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
                    <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                    <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                    <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                    <option value={PRIORITY.URGENT}>{PRIORITY_LABELS[PRIORITY.URGENT]}</option>
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
                  ตำแหน่งที่ซ่อม
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ระบุตำแหน่งที่ซ่อม"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    แผนที่
                  </button>
                </div>
                {coordinates && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>พิกัด:</strong> {Number(coordinates.lat).toFixed(6)}, {Number(coordinates.lng).toFixed(6)}
                  </div>
                )}
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
                  onClick={handleClose}
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

      {/* Map Modal */}
      <MapModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={coordinates?.lat}
        initialLng={coordinates?.lng}
        initialAddress={location}
        onConfirm={(lat, lng, address) => {
          setCoordinates({ lat, lng });
          setLocation(address || '');
        }}
        showQuickUseButton={false}
      />
    </>
  );
}
