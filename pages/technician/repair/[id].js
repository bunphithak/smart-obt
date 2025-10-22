import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { REPAIR_STATUS, REPAIR_STATUS_LABELS, PRIORITY_LABELS, getRepairStatusColor } from '../../../lib/constants';

export default function TechnicianRepairDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    actualCost: '',
    notes: '',
    completedDate: '',
    afterImages: [] // Images after repair
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRepairDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/repairs?id=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const repairData = data.data[0];
        setRepair(repairData);
        setUpdateForm({
          status: repairData.status || REPAIR_STATUS.PENDING,
          actualCost: repairData.actualCost || '',
          notes: repairData.notes || '',
          completedDate: repairData.completedDate || '',
          afterImages: []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isClient && id) {
      fetchRepairDetail();
    }
  }, [isClient, id, fetchRepairDetail]);

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            file,
            preview: event.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setUpdateForm(prev => ({
        ...prev,
        afterImages: [...prev.afterImages, ...images]
      }));
    });
  };

  const removeImage = (index) => {
    setUpdateForm(prev => ({
      ...prev,
      afterImages: prev.afterImages.filter((_, i) => i !== index)
    }));
  };

  const capturePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.multiple = true;
    input.onchange = handleImageUpload;
    input.click();
  };

  const handleStartWork = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: repair.id,
          status: 'กำลังดำเนินการ'
        })
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'เริ่มงานสำเร็จ', 'สถานะงานถูกอัปเดตเป็น "กำลังดำเนินการ"');
        fetchRepairDetail();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (error) {
      console.error('Error starting work:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!updateForm.actualCost) {
      showAlert('warning', 'กรุณากรอกข้อมูล', 'กรุณากรอกค่าใช้จ่ายจริงก่อนปิดงาน');
      return;
    }

    if (updateForm.afterImages.length === 0) {
      showAlert('warning', 'กรุณาถ่ายรูป', 'กรุณาถ่ายรูปหลังซ่อมอย่างน้อย 1 รูปก่อนปิดงาน');
      return;
    }

    setUpdating(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('id', repair.id);
      formData.append('status', REPAIR_STATUS.COMPLETED);
      formData.append('actualCost', parseFloat(updateForm.actualCost));
      formData.append('completedDate', new Date().toISOString().split('T')[0]);
      formData.append('notes', updateForm.notes);

      // Append images
      updateForm.afterImages.forEach((imageObj) => {
        formData.append('afterImages', imageObj.file);
      });

      const res = await fetch('/api/repairs/complete', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'ปิดงานสำเร็จ', 'งานซ่อมเสร็จสมบูรณ์แล้ว!');
        fetchRepairDetail();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (error) {
      console.error('Error completing work:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถปิดงานได้ กรุณาลองใหม่');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotes = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: repair.id,
          notes: updateForm.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'บันทึกสำเร็จ', 'หมายเหตุถูกบันทึกแล้ว');
        fetchRepairDetail();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', data.error);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกหมายเหตุได้ กรุณาลองใหม่');
    } finally {
      setUpdating(false);
    }
  };

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">ไม่พบข้อมูลงานซ่อม</p>
          <button
            onClick={() => router.push('/technician/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← กลับ
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const baseColor = getRepairStatusColor(status);
    const borderMap = {
      [REPAIR_STATUS.PENDING]: 'border-yellow-200',
      [REPAIR_STATUS.IN_PROGRESS]: 'border-blue-200',
      [REPAIR_STATUS.COMPLETED]: 'border-green-200',
      [REPAIR_STATUS.CANCELLED]: 'border-red-200',
    };
    return `${baseColor} ${borderMap[status] || 'border-gray-200'}`;
  };

  const getStatusLabel = (status) => {
    return REPAIR_STATUS_LABELS[status] || status;
  };

  const isCompleted = repair.status === REPAIR_STATUS.COMPLETED;
  const isPending = repair.status === REPAIR_STATUS.PENDING;
  const isInProgress = repair.status === REPAIR_STATUS.IN_PROGRESS;

  return (
    <>
      <Head>
        <title>รายละเอียดงานซ่อม #{repair.id} - Smart OBT</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                onClick={() => router.push('/technician/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                กลับ
              </button>
              <h1 className="text-xl font-bold text-gray-900">งานซ่อม #{repair.id}</h1>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Status Badge */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{repair.title}</h2>
                <p className="text-gray-600">{repair.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(repair.status)}`}>
                {repair.status}
              </span>
            </div>
          </div>

          {/* Repair Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดงาน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ความสำคัญ</label>
                <p className="text-gray-900 font-medium">{PRIORITY_LABELS[repair.priority] || repair.priority}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ค่าใช้จ่ายประมาณการ</label>
                <p className="text-gray-900 font-medium">
                  {repair.estimatedCost ? `฿${repair.estimatedCost.toLocaleString()}` : '-'}
                </p>
              </div>
              {repair.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">กำหนดเสร็จ</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(repair.dueDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
              {repair.completedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">วันที่เสร็จสิ้น</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(repair.completedDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons for Pending Status */}
          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">งานรอดำเนินการ</h3>
                  <p className="mt-1 text-sm text-yellow-700">คุณยังไม่ได้เริ่มงานนี้ กดปุ่มด้านล่างเพื่อเริ่มทำงาน</p>
                  <button
                    onClick={handleStartWork}
                    disabled={updating}
                    className="mt-3 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'กำลังดำเนินการ...' : '🚀 เริ่มทำงาน'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Work Update Form for In Progress */}
          {isInProgress && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">อัปเดตงาน</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ค่าใช้จ่ายจริง (บาท) *
                  </label>
                  <input
                    type="number"
                    name="actualCost"
                    value={updateForm.actualCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="กรอกค่าใช้จ่ายจริง"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {repair.estimatedCost && (
                    <p className="mt-1 text-sm text-gray-500">
                      ประมาณการ: ฿{repair.estimatedCost.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเหตุ / รายละเอียดการซ่อม
                  </label>
                  <textarea
                    name="notes"
                    value={updateForm.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="บันทึกรายละเอียดการซ่อม, อะไหล่ที่เปลี่ยน, หรือหมายเหตุอื่นๆ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* After Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปภาพหลังซ่อม *
                  </label>
                  
                  {/* Image Upload Buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      📸 ถ่ายรูป
                    </button>
                    <label className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      🖼️ เลือกรูป
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {updateForm.afterImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {updateForm.afterImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.preview}
                            alt={`After ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    {updateForm.afterImages.length > 0 
                      ? `เลือกแล้ว ${updateForm.afterImages.length} รูป` 
                      : 'กรุณาถ่ายรูปหลังซ่อมอย่างน้อย 1 รูป'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateNotes}
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'กำลังบันทึก...' : '💾 บันทึกหมายเหตุ'}
                  </button>
                  <button
                    onClick={handleCompleteWork}
                    disabled={updating}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {updating ? 'กำลังดำเนินการ...' : '✅ ปิดงาน (เสร็จสิ้น)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completed Status */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">งานเสร็จสมบูรณ์</h3>
                  <p className="mt-1 text-sm text-green-700">งานนี้เสร็จสิ้นแล้ว</p>
                  {repair.actualCost && (
                    <p className="mt-2 text-sm text-green-700">
                      <strong>ค่าใช้จ่ายจริง:</strong> ฿{repair.actualCost.toLocaleString()}
                    </p>
                  )}
                  {repair.notes && (
                    <div className="mt-3 bg-white rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700">หมายเหตุ:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{repair.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Existing Notes (if not editing) */}
          {!isInProgress && repair.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">หมายเหตุ</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{repair.notes}</p>
            </div>
          )}
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    alertData.type === 'success' ? 'bg-green-100' :
                    alertData.type === 'error' ? 'bg-red-100' :
                    alertData.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alertData.type === 'success' && <span className="text-green-600 text-xl">✓</span>}
                    {alertData.type === 'error' && <span className="text-red-600 text-xl">✕</span>}
                    {alertData.type === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
                    {alertData.type === 'info' && <span className="text-blue-600 text-xl">ℹ</span>}
                  </div>
                  <h3 className={`text-lg font-semibold ${
                    alertData.type === 'success' ? 'text-green-800' :
                    alertData.type === 'error' ? 'text-red-800' :
                    alertData.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alertData.title}
                  </h3>
                </div>
                
                <p className={`text-sm mb-6 ${
                  alertData.type === 'success' ? 'text-green-700' :
                  alertData.type === 'error' ? 'text-red-700' :
                  alertData.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alertData.message}
                </p>
                
                <div className="flex justify-end">
                  <button
                    onClick={closeAlert}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                      alertData.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                      alertData.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                      alertData.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

