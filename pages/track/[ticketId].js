import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  }
}

export default function TrackStatus() {
  const router = useRouter();
  const { ticketId } = router.query;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const fetchReportStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/track?ticketId=${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchReportStatus();
    }
  }, [ticketId, fetchReportStatus]);

  const submitFeedback = async () => {
    if (rating === 0) {
      alert('กรุณาให้คะแนน');
      return;
    }

    try {
      const res = await fetch('/api/reports/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          rating,
          feedback
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('ขอบคุณสำหรับความคิดเห็น');
        setShowFeedbackForm(false);
        fetchReportStatus();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'รอดำเนินการ':
        return {
          color: 'yellow',
          icon: '🟡',
          text: 'รับเรื่องแล้ว',
          description: 'เจ้าหน้าที่ได้รับเรื่องแล้ว กำลังดำเนินการตรวจสอบ'
        };
      case 'กำลังดำเนินการ':
        return {
          color: 'blue',
          icon: '🔵',
          text: 'อยู่ระหว่างซ่อม',
          description: 'ช่างกำลังดำเนินการซ่อมแซม'
        };
      case 'เสร็จสิ้น':
        return {
          color: 'green',
          icon: '🟢',
          text: 'ซ่อมเสร็จ / ปิดงาน',
          description: 'ดำเนินการเสร็จสิ้นเรียบร้อยแล้ว'
        };
      case 'ยกเลิก':
        return {
          color: 'red',
          icon: '🔴',
          text: 'ยกเลิก',
          description: 'งานถูกยกเลิก'
        };
      default:
        return {
          color: 'gray',
          icon: '⚪',
          text: status,
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลรายการนี้</h1>
          <p className="text-gray-600 mb-6">รหัสติดตามไม่ถูกต้องหรือถูกลบออกจากระบบ</p>
          <button
            onClick={() => router.push('/track')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ค้นหาใหม่
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(report.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Head>
        <title>ติดตามสถานะ - {ticketId} - ระบบ OBT Smart</title>
      </Head>
      
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ติดตามสถานะงาน</h1>
          <p className="text-gray-600">รหัส: {ticketId}</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className={`bg-${statusInfo.color}-50 border-b-4 border-${statusInfo.color}-400 p-6`}>
            <div className="text-center">
              <div className="text-6xl mb-2">{statusInfo.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800">{statusInfo.text}</h2>
              <p className="text-gray-600 mt-1">{statusInfo.description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">ขั้นตอนการดำเนินการ</h3>
            <div className="space-y-4">
              <div className={`flex items-start ${report.status ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${report.status ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">รับเรื่องแล้ว</p>
                  <p className="text-sm text-gray-500">{new Date(report.reportedAt).toLocaleString('th-TH')}</p>
                </div>
              </div>

              <div className={`flex items-start ${report.status === 'กำลังดำเนินการ' || report.status === 'เสร็จสิ้น' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${report.status === 'กำลังดำเนินการ' || report.status === 'เสร็จสิ้น' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                  {report.status === 'กำลังดำเนินการ' || report.status === 'เสร็จสิ้น' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-gray-400">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">กำลังดำเนินการซ่อม</p>
                  {report.repair && (
                    <p className="text-sm text-gray-500">ช่าง: {report.repair.assignedTo}</p>
                  )}
                </div>
              </div>

              <div className={`flex items-start ${report.status === 'เสร็จสิ้น' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${report.status === 'เสร็จสิ้น' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {report.status === 'เสร็จสิ้น' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-gray-400">3</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">ปิดงาน / ซ่อมเสร็จ</p>
                  {report.repair?.completedDate && (
                    <p className="text-sm text-gray-500">{new Date(report.repair.completedDate).toLocaleString('th-TH')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="border-t p-6">
            <h3 className="text-lg font-semibold mb-4">รายละเอียดการแจ้ง</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ทรัพย์สิน</p>
                <p className="font-medium">{report.assetName} ({report.assetCode})</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ปัญหา</p>
                <p className="font-medium">{report.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">รายละเอียด</p>
                <p className="text-gray-700">{report.description}</p>
              </div>
              {report.reportedBy && (
                <div>
                  <p className="text-sm text-gray-600">ผู้แจ้ง</p>
                  <p className="text-gray-700">{report.reportedBy}</p>
                </div>
              )}
            </div>
          </div>

          {/* Before Images */}
          {report.images && report.images.length > 0 && (
            <div className="border-t p-6">
              <h3 className="text-lg font-semibold mb-4">รูปภาพก่อนซ่อม</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Before ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* After Images */}
          {report.status === 'เสร็จสิ้น' && report.repair?.afterImages && report.repair.afterImages.length > 0 && (
            <div className="border-t p-6 bg-green-50">
              <h3 className="text-lg font-semibold mb-4 text-green-800">รูปภาพหลังซ่อม</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.repair.afterImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`After ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {report.status === 'เสร็จสิ้น' && !report.rating && (
            <div className="border-t p-6 bg-blue-50">
              {!showFeedbackForm ? (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  ให้คะแนนและแสดงความคิดเห็น
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">ให้คะแนนความพึงพอใจ</h3>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-4xl focus:outline-none"
                      >
                        {star <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="ความคิดเห็นเพิ่มเติม (ถ้ามี)"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={submitFeedback}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      ส่งความคิดเห็น
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already Rated */}
          {report.rating && (
            <div className="border-t p-6 bg-green-50">
              <h3 className="text-lg font-semibold mb-2 text-green-800">ขอบคุณสำหรับความคิดเห็น</h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{'⭐'.repeat(report.rating)}</span>
                <span className="text-gray-600">({report.rating}/5)</span>
              </div>
              {report.feedback && (
                <p className="mt-2 text-gray-700 italic">&ldquo;{report.feedback}&rdquo;</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg shadow hover:shadow-md"
          >
            กลับหน้าแรก
          </button>
          <button
            onClick={fetchReportStatus}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:shadow-md"
          >
            รีเฟรช
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

