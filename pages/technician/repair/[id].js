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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({ 
    title: '', 
    message: '', 
    onConfirm: null,
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก'
  });
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    actualCost: '',
    notes: '',
    completedDate: '',
    afterImages: [] // Images after repair
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user is logged in
    const userStr = localStorage.getItem('technicianUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing technicianUser:', error);
        router.push('/technician/login');
      }
    } else {
      // Redirect to login if not logged in
      router.push('/technician/login');
    }
  }, [router]);

  const fetchRepairDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/repairs?id=${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const repairData = data.data;
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
    if (isClient && id && currentUser) {
      fetchRepairDetail();
    }
  }, [isClient, id, currentUser, fetchRepairDetail]);

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const showConfirm = (title, message, onConfirm, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
    setConfirmData({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    });
    setShowConfirmModal(true);
  };

  const closeConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleConfirm = () => {
    if (confirmData.onConfirm) {
      confirmData.onConfirm();
    }
    setShowConfirmModal(false);
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
    // เปลี่ยนสถานะเป็นกำลังดำเนินการ
    setUpdating(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: repair.id,
          status: REPAIR_STATUS.IN_PROGRESS,
          assignedTo: repair.assignedTo // ส่ง assignedTo ไปด้วย
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

  const confirmStartWork = () => {
    showConfirm(
      'ยืนยันการเริ่มงาน',
      'คุณต้องการเริ่มงานนี้หรือไม่? หลังจากเริ่มงานแล้ว คุณจะสามารถปิดงานซ่อมได้',
      handleStartWork,
      'เริ่มงาน',
      'ยกเลิก'
    );
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
      // Upload images first
      const uploadedImageUrls = [];
      for (const imageData of updateForm.afterImages) {
        const formData = new FormData();
        formData.append('file', imageData.file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedImageUrls.push(uploadData.url);
        }
      }

      const res = await fetch('/api/repairs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: repair.id,
          status: REPAIR_STATUS.COMPLETED,
          actualCost: parseFloat(updateForm.actualCost),
          completedDate: new Date().toISOString(),
          notes: updateForm.notes,
          afterImages: uploadedImageUrls
        })
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

  const confirmCompleteWork = () => {
    showConfirm(
      'ยืนยันการปิดงานซ่อม',
      'คุณต้องการปิดงานซ่อมนี้หรือไม่? หลังจากปิดงานแล้ว จะไม่สามารถแก้ไขได้อีก',
      handleCompleteWork,
      'ปิดงานซ่อม',
      'ยกเลิก'
    );
  };

  if (!isClient || !currentUser) {
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
              <h1 className="text-xl font-bold text-gray-900">งานซ่อม #{repair.ticketId || repair.id}</h1>
              <button
                onClick={() => {
                  localStorage.removeItem('technicianUser');
                  router.push('/technician/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                title="ออกจากระบบ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
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
                {getStatusLabel(repair.status)}
              </span>
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดการแจ้ง</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ticket ID</label>
                <p className="text-gray-900 font-medium font-mono">{repair.ticketId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ประเภทการแจ้ง</label>
                <p className="text-gray-900 font-medium">
                  {repair.reportType === 'repair' ? 'แจ้งซ่อม' : 'คำร้อง'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ผู้แจ้ง</label>
                <p className="text-gray-900 font-medium">{repair.reportedBy || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">เบอร์ติดต่อ</label>
                <p className="text-gray-900 font-medium">{repair.reporterPhone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">วันที่แจ้ง</label>
                <p className="text-gray-900 font-medium">
                  {repair.reportedAt ? new Date(repair.reportedAt).toLocaleString('th-TH') : '-'}
                </p>
              </div>
              {repair.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">สถานที่</label>
                  <p className="text-gray-900 font-medium">
                    {(() => {
                      // For repair jobs with assets, show asset location instead of coordinates
                      if (repair.assetName && repair.villageName) {
                        return `${repair.assetName}, ${repair.villageName}`;
                      }
                      
                      try {
                        const locationData = JSON.parse(repair.location);
                        if (locationData.latitude && locationData.longitude) {
                          return `พิกัด: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
                        }
                      } catch (e) {
                        // Not JSON, treat as location name
                      }
                      return repair.location;
                    })()}
                  </p>
                </div>
              )}
            </div>
            
            {/* Original Report Images */}
            {repair.reportImages && repair.reportImages.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-3 block">รูปภาพการแจ้ง (ก่อนซ่อม)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {repair.reportImages.map((image, index) => (
                    <div 
                      key={`report-${index}`} 
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedImage(image);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Report ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:opacity-90 transition-opacity"
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  คลิกที่รูปภาพเพื่อดูขนาดเต็ม
                </p>
              </div>
            )}

            {/* Completion Images */}
            {repair.completionImages && repair.completionImages.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-3 block">รูปภาพหลังซ่อม</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {repair.completionImages.map((image, index) => (
                    <div 
                      key={`completion-${index}`} 
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedImage(image);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Completion ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-200 hover:opacity-90 transition-opacity"
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  คลิกที่รูปภาพเพื่อดูขนาดเต็ม
                </p>
              </div>
            )}

            {/* Fallback for old format (all images in one array) */}
            {(!repair.reportImages || repair.reportImages.length === 0) && 
             (!repair.completionImages || repair.completionImages.length === 0) && 
             repair.images && repair.images.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500 mb-3 block">รูปภาพการแจ้ง</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {repair.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedImage(image);
                        setShowImageModal(true);
                      }}
                    >
                      <img
                        src={image}
                        alt={`Report ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:opacity-90 transition-opacity"
                        style={{ pointerEvents: 'none' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  คลิกที่รูปภาพเพื่อดูขนาดเต็ม
                </p>
              </div>
            )}
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
              {repair.categoryName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">หมวดหมู่</label>
                  <p className="text-gray-900 font-medium">{repair.categoryName}</p>
                </div>
              )}
              {repair.assetName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ทรัพย์สิน</label>
                  <p className="text-gray-900 font-medium">{repair.assetName}</p>
                </div>
              )}
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
                  <p className="mt-1 text-sm text-yellow-700">กดปุ่มด้านล่างเพื่อเริ่มงาน</p>
                  <button
                    onClick={confirmStartWork}
                    disabled={updating}
                    className="mt-3 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        เริ่มงาน
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Work Update Form for In Progress */}
          {isInProgress && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ปิดงานซ่อม</h3>
              <p className="text-sm text-gray-600 mb-4">กรอกข้อมูลด้านล่างเพื่อปิดงานซ่อม</p>
              
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
                      ถ่ายรูป
                    </button>
                    <label className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      เลือกรูป
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
                    onClick={confirmCompleteWork}
                    disabled={updating}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ปิดงานซ่อม
                      </>
                    )}
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
                  <h3 className="text-sm font-medium text-green-800">งานซ่อมเสร็จสิ้น</h3>
                  <p className="mt-1 text-sm text-green-700">งานซ่อมนี้เสร็จสิ้นแล้ว</p>
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

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {confirmData.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {confirmData.message}
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeConfirm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {confirmData.cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {confirmData.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={() => {
              setShowImageModal(false);
              setSelectedImage(null);
            }}
          >
            <div className="relative max-w-6xl max-h-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                className="absolute -top-12 right-0 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="ภาพขยาย"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
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

