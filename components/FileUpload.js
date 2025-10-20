import { useState, useRef } from 'react';
import uploadService from '../lib/uploadService';

const FileUpload = ({ 
  onUpload, 
  onError, 
  multiple = false, 
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  folder = 'uploads',
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileArray = Array.from(files);
    const results = [];

    try {
      // Validate files
      for (const file of fileArray) {
        const validation = uploadService.validateFile(file, { maxSize });
        if (!validation.valid) {
          onError?.(validation.error);
          return;
        }
      }

      // Upload files
      for (const file of fileArray) {
        const result = await uploadService.uploadFile(file, folder);
        results.push(result);
        
        if (!result.success) {
          onError?.(result.error);
          return;
        }
      }

      // Generate preview URLs
      const urls = results.map(result => result.url);
      setPreviewUrls(urls);

      // Call success callback
      onUpload?.(multiple ? results : results[0]);

    } catch (error) {
      onError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const removePreview = (index) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">กำลังอัปโหลด...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-blue-600 hover:text-blue-500">คลิกเพื่อเลือกไฟล์</span>
              {' '}หรือลากไฟล์มาวางที่นี่
            </p>
            <p className="text-xs text-gray-500">
              รองรับไฟล์: JPG, PNG, GIF, WebP (สูงสุด {maxSize / 1024 / 1024}MB)
            </p>
            {multiple && (
              <p className="text-xs text-gray-500 mt-1">
                สามารถเลือกหลายไฟล์ได้
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
