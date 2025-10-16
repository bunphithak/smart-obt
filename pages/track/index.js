import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function TrackSearch() {
  const router = useRouter();
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticketId.trim()) {
      router.push(`/track/${ticketId.trim()}`);
    }
  };

  return (
    <>
      <Head>
        <title>ตรวจสอบสถานะ - OBT Smart System</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">OBT Smart System</h1>
                  <p className="text-sm text-gray-600">ตรวจสอบสถานะ</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/public')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </header>

        <div className="w-full px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ตรวจสอบสถานะงาน</h1>
            <p className="text-gray-600">กรุณากรอกรหัสติดตามงานของคุณ</p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสติดตามงาน (Ticket ID)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="เช่น TK000001"
              required
              className="w-full px-4 py-3 text-center text-lg font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              รหัสที่ได้รับหลังจากแจ้งปัญหา
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg"
          >
            ตรวจสอบสถานะ
          </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>หากมีข้อสงสัย โทร. 0-XXXX-XXXX</p>
              <p className="mt-1">เวลาทำการ: จันทร์-ศุกร์ 08:30-16:30 น.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

