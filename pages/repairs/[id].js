import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Image from "next/image";
import SuccessModal from "../../components/SuccessModal";
import ConfirmModal from "../../components/ConfirmModal";
import AlertModal from "../../components/AlertModal";
import { 
  REPAIR_STATUS, 
  REPAIR_STATUS_LABELS, 
  PRIORITY, 
  PRIORITY_LABELS,
  REPORT_TYPE_LABELS,
  getRepairStatusColor,
  getPriorityColor 
} from "../../lib/constants";

// Dynamic import for MapPicker and MapViewer (client-side only)
const MapPicker = dynamic(() => import("../../components/MapPicker"), {
  ssr: false,
});

const MapViewer = dynamic(() => import("../../components/MapViewer"), {
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
  const [isClient, setIsClient] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: REPAIR_STATUS.PENDING,
    priority: PRIORITY.MEDIUM,
    assignedTo: "",
    estimatedCost: "",
    actualCost: "",
    dueDate: "",
    notes: "",
    location: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug log for state changes
  useEffect(() => {
    console.log('showImageModal:', showImageModal);
    console.log('selectedImage:', selectedImage);
  }, [showImageModal, selectedImage]);


  useEffect(() => {
    if (id) {
      fetchRepairDetail();
      fetchTechnicians();
    }
  }, [id]);

  useEffect(() => {
    if (edit === "true") {
      setIsEditing(true);
    }
  }, [edit]);

  const fetchRepairDetail = async () => {
    try {
      const res = await fetch(`/api/repairs?id=${id}`);
      const data = await res.json();

      if (data.success && data.data) {
        const repairData = data.data;

        // Parse coordinates from location JSON string
        let parsedLocation = "";
        let parsedLatitude = repairData.latitude;
        let parsedLongitude = repairData.longitude;

        if (repairData.location && typeof repairData.location === "string") {
          try {
            const locationObj = JSON.parse(repairData.location);
            if (locationObj.latitude && locationObj.longitude) {
              parsedLatitude = locationObj.latitude;
              parsedLongitude = locationObj.longitude;
              parsedLocation = `${locationObj.latitude}, ${locationObj.longitude}`;
            }
          } catch (e) {
            // If not JSON, use as string
            parsedLocation = repairData.location;
          }
        }

        setRepair({
          ...repairData,
          location: parsedLocation,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        });

        setFormData({
          title: repairData.title || "",
          description: repairData.description || "",
          status: repairData.status || REPAIR_STATUS.PENDING,
          priority: repairData.priority || PRIORITY.MEDIUM,
          assignedTo: repairData.assignedTo || "",
          estimatedCost: repairData.estimatedCost || "",
          actualCost: repairData.actualCost || "",
          dueDate: repairData.dueDate ? repairData.dueDate.split("T")[0] : "",
          notes: repairData.notes || "",
          location: parsedLocation,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching repair:", error);
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/users?role=technician");
      const data = await res.json();
      if (data.success) {
        setTechnicians(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate: ต้องมีช่างผู้รับผิดชอบ ยกเว้นงานที่ยกเลิก
    if (!formData.assignedTo && formData.status !== REPAIR_STATUS.CANCELLED) {
      setAlertModal({
        isOpen: true,
        title: 'ไม่สามารถบันทึกได้',
        message: 'กรุณาระบุช่างผู้รับผิดชอบ หรือเปลี่ยนสถานะเป็น "ยกเลิก"',
        type: 'warning'
      });
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      message: 'ต้องการบันทึกการเปลี่ยนแปลงข้อมูลงานซ่อมนี้หรือไม่?',
      onConfirm: async () => {
        try {
          const res = await fetch("/api/repairs", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: repair.id,
              ...formData,
            }),
          });

          const data = await res.json();

          if (data.success) {
            setShowSuccessModal(true);
          } else {
            setAlertModal({
              isOpen: true,
              title: 'เกิดข้อผิดพลาด',
              message: data.error,
              type: 'error'
            });
          }
        } catch (error) {
          console.error("Error updating repair:", error);
          setAlertModal({
            isOpen: true,
            title: 'เกิดข้อผิดพลาด',
            message: 'เกิดข้อผิดพลาดในการบันทึก',
            type: 'error'
          });
        }
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const handleLocationSelect = (location, lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      location,
      latitude: lat,
      longitude: lng,
    }));
    setShowMapPicker(false);
  };

  const getStatusColor = (status) => {
    return getRepairStatusColor(status);
  };

  const getStatusLabel = (status) => {
    return REPAIR_STATUS_LABELS[status] || status;
  };

  const getPriorityColorClass = (priority) => {
    return getPriorityColor(priority, 'badge');
  };

  const getPriorityLabel = (priority) => {
    return PRIORITY_LABELS[priority] || priority;
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
            onClick={() => router.push("/repairs")}
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
            {isEditing ? "แก้ไขงานซ่อม" : "รายละเอียดงานซ่อม"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {repair.ticketId && `เลขที่รายงาน: ${repair.ticketId}`}
          </p>
        </div>
        {!isEditing && (
          <div className="flex space-x-2">
            {repair.status !== REPAIR_STATUS.COMPLETED && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                แก้ไข
              </button>
            )}
            {repair.status === REPAIR_STATUS.COMPLETED && (
              <button
                onClick={() => window.open(`/public/pdf/repair/${repair.id}`, '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                พิมพ์รายงาน
              </button>
            )}
            <button
              onClick={() => router.push("/repairs")}
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {repair.description || "-"}
                  </p>
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
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={REPAIR_STATUS.PENDING}>{REPAIR_STATUS_LABELS[REPAIR_STATUS.PENDING]}</option>
                      <option value={REPAIR_STATUS.IN_PROGRESS}>{REPAIR_STATUS_LABELS[REPAIR_STATUS.IN_PROGRESS]}</option>
                      <option value={REPAIR_STATUS.COMPLETED}>{REPAIR_STATUS_LABELS[REPAIR_STATUS.COMPLETED]}</option>
                      <option value={REPAIR_STATUS.CANCELLED}>{REPAIR_STATUS_LABELS[REPAIR_STATUS.CANCELLED]}</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        repair.status
                      )}`}
                    >
                      {getStatusLabel(repair.status)}
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
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                      <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                      <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                      <option value={PRIORITY.URGENT}>{PRIORITY_LABELS[PRIORITY.URGENT]}</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColorClass(
                        repair.priority
                      )}`}
                    >
                      {getPriorityLabel(repair.priority)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment & Cost */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">
              การมอบหมายและค่าใช้จ่าย
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ช่างผู้รับผิดชอบ
                </label>
                {isEditing ? (
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกช่าง --</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {repair.assignedTo ? (
                      technicians.find((tech) => tech.id === repair.assignedTo)
                        ?.fullName || repair.assignedTo
                    ) : (
                      <span className="text-orange-600 font-medium">
                        รอจ่ายงาน
                      </span>
                    )}
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedCost: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {repair.estimatedCost
                        ? `฿${Number(repair.estimatedCost).toLocaleString()}`
                        : "-"}
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
                      onChange={(e) =>
                        setFormData({ ...formData, actualCost: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {repair.actualCost
                        ? `฿${Number(repair.actualCost).toLocaleString()}`
                        : "-"}
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
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {repair.dueDate
                      ? new Date(repair.dueDate).toLocaleDateString("th-TH")
                      : "-"}
                  </p>
                )}
              </div>

              {/* งานเสร็จสิ้น - แสดงเฉพาะเมื่อสถานะเป็น "เสร็จสิ้น" */}
              {repair.status === REPAIR_STATUS.COMPLETED && repair.completedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งานเสร็จสิ้น
                  </label>
                  <p className="text-gray-900 font-semibold text-green-600">
                    {new Date(repair.completedDate).toLocaleString("th-TH")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {repair.images && repair.images.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="text-lg font-semibold mb-4">รูปภาพปัญหา</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repair.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => {
                      console.log('Div clicked:', image);
                      setSelectedImage(image);
                      setShowImageModal(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={`รูปภาพปัญหา ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
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
              
              <p className="text-sm text-gray-500 mt-3">
                คลิกที่รูปภาพเพื่อดูขนาดเต็ม
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">บันทึกเพิ่มเติมรายละเอียดการซ่อม</h2>

            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="บันทึกเพิ่มเติม..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">
                {repair.notes || "-"}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold mb-4">📍 ตำแหน่งที่แจ้ง</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">สถานที่:</span>{" "}
                  {repair.assetName || repair.location || "ไม่ระบุ"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">พิกัด:</span>{" "}
                  {Number(repair.latitude || 0).toFixed(6)},{" "}
                  {Number(repair.longitude || 0).toFixed(6)}
                </p>
              </div>

              {/* Map Display - แผนที่แบบดูอย่างเดียว */}
              {isClient && repair.latitude && repair.longitude && (
                <MapViewer
                  lat={Number(repair.latitude)}
                  lng={Number(repair.longitude)}
                  title={repair.title}
                  description={repair.location}
                  height="320px"
                />
              )}

              <a
                href={`https://www.google.com/maps?q=${repair.latitude},${repair.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                🗺️ เปิดใน Google Maps
              </a>
            </div>
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
                {repair.reportType && (
                  <div>
                    <p className="text-sm text-gray-500">ประเภทรายงาน</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      repair.reportType === 'repair' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {REPORT_TYPE_LABELS[repair.reportType] || repair.reportType}
                    </span>
                  </div>
                )}
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
                  {new Date(repair.createdAt).toLocaleString("th-TH")}
                </p>
              </div>
              {repair.startDate && (
                <div>
                  <p className="text-gray-500">เริ่มงาน</p>
                  <p className="text-gray-900">
                    {new Date(repair.startDate).toLocaleString("th-TH")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Bottom */}
      {isEditing && (
        <div className="mt-6 flex justify-center space-x-4 pb-6">
          <button
            onClick={() => router.push("/repairs")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            บันทึก
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

      {/* Image Modal - แสดงภาพใหญ่ */}
      {showImageModal && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => {
            console.log('Modal background clicked');
            setShowImageModal(false);
            setSelectedImage(null);
          }}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Close button clicked');
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

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push("/repairs");
          }}
          title="บันทึกข้อมูลสำเร็จ"
          message="ข้อมูลงานซ่อมได้รับการอัปเดตเรียบร้อยแล้ว"
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
        }}
        onConfirm={confirmModal.onConfirm}
        title="ยืนยันการบันทึก"
        message={confirmModal.message}
        confirmText="บันทึก"
        cancelText="ยกเลิก"
        type="info"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
        }}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
