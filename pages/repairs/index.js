import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RepairTable from '../../components/RepairTable';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import CreateRepairModal from '../../components/CreateRepairModal';

export default function RepairsPage() {
  const router = useRouter();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', assignedTo: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [showCreateRepairModal, setShowCreateRepairModal] = useState(false);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const res = await fetch('/api/repairs');
      const data = await res.json();
      if (data.success) {
        setRepairs(data.data);
      }
      setLoading(false);
    } catch (fetchError) {
      console.error('Error:', fetchError);
      setLoading(false);
    }
  };

  const handleEdit = (repair) => {
    router.push(`/repairs/${repair.id}?edit=true`);
  };

  const handleDelete = async (repair) => {
    setConfirmModal({
      isOpen: true,
      message: `ต้องการลบงานซ่อม "${repair.title}" ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/repairs?id=${repair.id}`, { method: 'DELETE' });
          const result = await res.json();

          if (result.success) {
            setAlertModal({
              isOpen: true,
              message: 'ลบงานซ่อมสำเร็จ',
              type: 'success'
            });
            fetchRepairs();
          } else {
            setAlertModal({
              isOpen: true,
              message: 'เกิดข้อผิดพลาด: ' + result.error,
              type: 'error'
            });
          }
        } catch (error) {
          setAlertModal({
            isOpen: true,
            message: 'ไม่สามารถลบได้ กรุณาลองใหม่อีกครั้ง',
            type: 'error'
          });
        }
      }
    });
  };

  const handleViewDetails = (repair) => {
    router.push(`/repairs/${repair.id}`); // View only mode
  };

  const filteredRepairs = repairs.filter(repair => {
    if (filter.status && repair.status !== filter.status) return false;
    if (filter.assignedTo && !repair.assignedTo.toLowerCase().includes(filter.assignedTo.toLowerCase())) return false;
    return true;
  });

  const uniqueTechnicians = [...new Set(repairs.map(r => r.assignedTo))];

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            จัดการงานซ่อม
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ติดตามและจัดการงานซ่อมบำรุงทั้งหมด
          </p>
        </div>
        <button
          onClick={() => setShowCreateRepairModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>สร้างงานซ่อม</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="รอดำเนินการ">รอดำเนินการ</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            <option value="ยกเลิก">ยกเลิก</option>
          </select>
          <select
            value={filter.assignedTo}
            onChange={(e) => setFilter({ ...filter, assignedTo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกช่าง</option>
            {uniqueTechnicians.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{repairs.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">รอดำเนินการ</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {repairs.filter(r => r.status === 'รอดำเนินการ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังดำเนินการ</p>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {repairs.filter(r => r.status === 'กำลังดำเนินการ').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">เสร็จสิ้น</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {repairs.filter(r => r.status === 'เสร็จสิ้น').length}
          </p>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <RepairTable
          repairs={filteredRepairs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title="ยืนยันการลบ"
        message={confirmModal.message}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
      />

      {/* Create Repair Modal */}
      <CreateRepairModal
        isOpen={showCreateRepairModal}
        onClose={() => setShowCreateRepairModal(false)}
        onSuccess={() => {
          fetchRepairs();
        }}
      />
    </div>
  );
}

