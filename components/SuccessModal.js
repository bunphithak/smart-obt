import React from 'react';

const SuccessModal = ({ isOpen, onClose, ticketId, reportType, onCheckStatus }) => {
  if (!isOpen) return null;

  const typeText = reportType === 'repair' ? 'แจ้งซ่อม' : 'คำร้อง';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ส่ง{typeText}สำเร็จ!
          </h2>
          <p className="text-green-100">
            รหัสติดตามงานของคุณคือ:
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ticket ID Display */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 text-center">
            <div className="text-3xl font-bold text-green-700 tracking-wider">
              {ticketId}
            </div>
          </div>

          {/* Instructions */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            กรุณาบันทึกรหัสนี้ไว้เพื่อติดตามสถานะการดำเนินงาน
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCheckStatus}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              ตรวจสอบสถานะ
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
