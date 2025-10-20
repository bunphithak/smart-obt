import { useState } from 'react';
import Head from 'next/head';
import uploadService from '../lib/uploadService';

export default function TestUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์ก่อน');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting upload...', selectedFile);
      
      // Validate file
      const validation = uploadService.validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error);
        setUploading(false);
        return;
      }

      // Upload to Firebase
      const uploadResult = await uploadService.uploadFile(selectedFile, 'test-uploads');
      console.log('Upload result:', uploadResult);

      if (uploadResult.success) {
        setResult({
          success: true,
          url: uploadResult.url,
          path: uploadResult.path,
          name: uploadResult.name,
          size: uploadResult.size,
          type: uploadResult.type
        });
      } else {
        setError(uploadResult.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Head>
        <title>ทดสอบการอัปโหลด Firebase | Smart OBT</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🔥 ทดสอบการอัปโหลด Firebase
            </h1>
            <p className="text-gray-600">
              ทดสอบว่าระบบอัปโหลดไฟล์ไปที่ Firebase Storage ทำงานได้หรือไม่
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์รูปภาพ
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              <p className="mt-2 text-xs text-gray-500">
                รองรับ: JPG, PNG, GIF, WebP (ขนาดไม่เกิน 10MB)
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างภาพ:</p>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>ชื่อไฟล์: {selectedFile?.name}</p>
                  <p>ขนาด: {(selectedFile?.size / 1024).toFixed(2)} KB</p>
                  <p>ประเภท: {selectedFile?.type}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">เกิดข้อผิดพลาด</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result?.success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900">
                    อัปโหลดสำเร็จ! 🎉
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-green-800 w-24">ชื่อไฟล์:</span>
                    <span className="text-sm text-green-700">{result.name}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-green-800 w-24">Path:</span>
                    <span className="text-sm text-green-700 font-mono break-all">{result.path}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-green-800 w-24">ขนาด:</span>
                    <span className="text-sm text-green-700">{(result.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-sm font-medium text-green-800 w-24">URL:</span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {result.url}
                    </a>
                  </div>
                </div>

                {/* Display uploaded image */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-green-800 mb-2">ภาพที่อัปโหลด:</p>
                  <div className="rounded-lg overflow-hidden border border-green-200">
                    <img
                      src={result.url}
                      alt="Uploaded"
                      className="w-full h-64 object-contain bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  !selectedFile || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังอัปโหลด...
                  </span>
                ) : (
                  '🚀 อัปโหลดไฟล์'
                )}
              </button>

              {(selectedFile || result) && (
                <button
                  onClick={handleClear}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  🔄 เริ่มใหม่
                </button>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Firebase Storage</h3>
              <p className="text-sm text-gray-600">
                อัปโหลดไปที่ Firebase Cloud Storage
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">ปลอดภัย</h3>
              <p className="text-sm text-gray-600">
                ตรวจสอบประเภทและขนาดไฟล์
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-purple-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">รวดเร็ว</h3>
              <p className="text-sm text-gray-600">
                CDN ทั่วโลกเพื่อความเร็วสูงสุด
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับหน้าหลัก
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

