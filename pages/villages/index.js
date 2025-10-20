import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import { useAuth } from '../../contexts/AuthContext';

export default function VillagesPage() {
  const { apiCall } = useAuth();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [villageAssets, setVillageAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'success', title: '', message: '' }); // แสดง 12 รายการต่อหน้า
  const [formData, setFormData] = useState({
    name: '',
    villageCode: '',
    villageNumber: '',
    subdistrict: 'ละหาร',
    district: 'ปลวกแดง',
    province: 'ระยอง',
    postalCode: '21140',
    description: ''
  });

  useEffect(() => {
    fetchVillages();
  }, []);

  const showAlert = (title, message, type = 'success') => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const fetchVillages = async () => {
    try {
      const res = await fetch('/api/villages');
      const data = await res.json();
      if (data.success) {
        setVillages(data.data);
      }
      setLoading(false);
    } catch (fetchError) {
      console.error('Error:', fetchError);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingVillage ? 'PUT' : 'POST';
      
      // Prepare data with location as JSONB
      const payload = {
        name: formData.name,
        villageCode: formData.villageCode,
        description: formData.description || `หมู่ ${formData.villageNumber} ${formData.name}`,
        location: {
          villageNumber: formData.villageNumber,
          villageName: formData.name,
          subdistrict: formData.subdistrict,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode
        },
        isActive: true
      };

      if (editingVillage) {
        payload.id = editingVillage.id;
      }

      const res = await apiCall('/api/villages', {
        method,
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        showAlert('สำเร็จ', editingVillage ? 'แก้ไขหมู่บ้านสำเร็จ' : 'เพิ่มหมู่บ้านสำเร็จ', 'success');
        setShowForm(false);
        setEditingVillage(null);
        setFormData({
          name: '',
          villageCode: '',
          villageNumber: '',
          subdistrict: 'ละหาร',
          district: 'ปลวกแดง',
          province: 'ระยอง',
          postalCode: '21140',
          description: ''
        });
        fetchVillages();
      } else {
        showAlert('ข้อผิดพลาด', result.error, 'error');
      }
    } catch (error) {
      showAlert('ข้อผิดพลาด', 'ไม่สามารถบันทึกได้', 'error');
      console.error(error);
    }
  };

  const handleEdit = (village) => {
    setEditingVillage(village);
    setFormData({
      name: village.name,
      villageCode: village.villageCode || '',
      villageNumber: village.location?.villageNumber || '',
      subdistrict: village.location?.subdistrict || 'ละหาร',
      district: village.location?.district || 'ปลวกแดง',
      province: village.location?.province || 'ระยอง',
      postalCode: village.location?.postalCode || '21140',
      description: village.description || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (village) => {
    setVillageToDelete(village);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!villageToDelete) return;

    try {
      const res = await apiCall(`/api/villages?id=${villageToDelete.id}`, { method: 'DELETE' });
      const result = await res.json();

      setShowConfirmModal(false);

      if (result.success) {
        showAlert('สำเร็จ', 'ลบหมู่บ้านสำเร็จ', 'success');
        fetchVillages();
      } else {
        showAlert('ข้อผิดพลาด', result.error, 'error');
      }
      
      setVillageToDelete(null);
    } catch (error) {
      setShowConfirmModal(false);
      showAlert('ข้อผิดพลาด', 'ไม่สามารถลบได้', 'error');
      setVillageToDelete(null);
    }
  };

  const handleViewAssets = async (village) => {
    setSelectedVillage(village);
    setShowAssetsModal(true);
    setLoadingAssets(true);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1
    
    try {
      const res = await fetch(`/api/assets?villageId=${village.id}`);
      const data = await res.json();
      if (data.success) {
        setVillageAssets(data.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setVillageAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Pagination logic
  const totalPages = Math.ceil(villageAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = villageAssets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of modal content
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
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
              setFormData({
                name: '',
                villageCode: '',
                villageNumber: '',
                subdistrict: 'ละหาร',
                district: 'ปลวกแดง',
                province: 'ระยอง',
                postalCode: '21140',
                description: ''
              });
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
                  <p className="text-sm text-blue-100">
                    รหัส: {village.villageCode || village.code || '-'}
                  </p>
                </div>
                <div className="text-2xl">🏘️</div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">หมู่ที่</p>
                <p className="text-sm text-gray-700 font-medium">
                  {village.location?.villageNumber || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">ที่อยู่</p>
                <p className="text-sm text-gray-700">
                  {village.location ? (
                    <>
                      ตำบล{village.location.subdistrict} <br/>
                      อำเภอ{village.location.district} <br/>
                      จังหวัด{village.location.province}
                      {village.location.postalCode && ` ${village.location.postalCode}`}
                    </>
                  ) : (
                    village.description || '-'
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">จำนวนทรัพย์สิน</p>
                <p className="text-2xl font-bold text-blue-600">{village.totalAssets || 0}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleViewAssets(village)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  ดูทรัพย์สิน
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(village)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteClick(village)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    ลบ
                  </button>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
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
                      placeholder="เช่น บ้านปากแพรก"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมู่ที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="villageNumber"
                      value={formData.villageNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสหมู่บ้าน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="villageCode"
                    value={formData.villageCode}
                    onChange={handleChange}
                    required
                    disabled={!!editingVillage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="เช่น VLG-001"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ตำบล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subdistrict"
                      value={formData.subdistrict}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อำเภอ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จังหวัด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รหัสไปรษณีย์
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="21140"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คำอธิบาย
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="คำอธิบายเพิ่มเติม"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingVillage(null);
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingVillage ? 'บันทึกการแก้ไข' : 'เพิ่มหมู่บ้าน'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assets Modal */}
      {showAssetsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  รายการทรัพย์สิน - {selectedVillage?.name}
                </h2>
                <button
                  onClick={() => setShowAssetsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                รหัสหมู่บ้าน: {selectedVillage?.code} | ที่อยู่: {selectedVillage?.address}
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] modal-content">
              {loadingAssets ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-600">กำลังโหลด...</span>
                </div>
              ) : villageAssets.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentAssets.map((asset) => (
                    <div key={asset.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-600">รหัส: {asset.code}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.status === 'ใช้งานได้' ? 'bg-green-100 text-green-800' :
                          asset.status === 'ชำรุด' ? 'bg-red-100 text-red-800' :
                          asset.status === 'ซ่อมแซม' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ประเภท:</span>
                          <span className="text-gray-900">{asset.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">มูลค่า:</span>
                          <span className="text-gray-900">฿{asset.value?.toLocaleString() || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">วันที่ซื้อ:</span>
                          <span className="text-gray-900">{asset.purchaseDate || '-'}</span>
                        </div>
                        {asset.locationName && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">สถานที่:</span>
                            <span className="text-gray-900">{asset.locationName}</span>
                          </div>
                        )}
                        {asset.latitude && asset.longitude && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">พิกัด:</span>
                            <span className="text-gray-900 text-xs">{asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                      
                      {asset.description && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
                        </div>
                      )}
                    </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ก่อนหน้า
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm border rounded-md ${
                              page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ถัดไป
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีทรัพย์สินในหมู่บ้านนี้</h3>
                  <p className="text-gray-500">ยังไม่มีทรัพย์สินที่ลงทะเบียนในหมู่บ้าน {selectedVillage?.name}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>รวม {villageAssets.length} รายการ</p>
                  {totalPages > 1 && (
                    <p>หน้า {currentPage} จาก {totalPages} (แสดง {startIndex + 1}-{Math.min(endIndex, villageAssets.length)} จาก {villageAssets.length})</p>
                  )}
                </div>
                <button
                  onClick={() => setShowAssetsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setVillageToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบ"
        message={`คุณต้องการลบหมู่บ้าน "${villageToDelete?.name}" ใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
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

