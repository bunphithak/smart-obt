// Upload Configuration - รองรับการเปลี่ยนระบบในอนาคต
export const UPLOAD_CONFIG = {
  // ปัจจุบันใช้ Local Storage
  provider: 'local', // 'local', 'firebase', 's3'
  
  // Local Storage Config
  local: {
    uploadDir: 'public/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  
  // Firebase Config (สำหรับอนาคต)
  firebase: {
    bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  
  // AWS S3 Config (สำหรับอนาคต)
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
};

// Helper function to get current config
export const getUploadConfig = () => {
  const provider = UPLOAD_CONFIG.provider;
  return {
    provider,
    ...UPLOAD_CONFIG[provider]
  };
};

// Helper function to change provider
export const setUploadProvider = (provider) => {
  if (['local', 'firebase', 's3'].includes(provider)) {
    UPLOAD_CONFIG.provider = provider;
    console.log(`✅ Upload provider changed to: ${provider}`);
  } else {
    console.error(`❌ Invalid provider: ${provider}. Must be one of: local, firebase, s3`);
  }
};

// Helper function to validate file
export const validateFile = (file, options = {}) => {
  const config = getUploadConfig();
  const {
    maxSize = config.maxFileSize,
    allowedTypes = config.allowedTypes,
    allowedExtensions = config.allowedExtensions
  } = options;
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` };
  }
  
  return { valid: true };
};

// Helper function to generate unique filename
export const generateFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}_${randomString}.${extension}`;
};

// Helper function to generate path for different types
export const generatePath = (type, filename) => {
  const newFilename = generateFilename(filename);
  
  switch (type) {
    case 'report':
      return `reports/${newFilename}`;
    case 'repair':
      return `repairs/${newFilename}`;
    case 'asset':
      return `assets/${newFilename}`;
    case 'user':
      return `users/${newFilename}`;
    default:
      return `uploads/${newFilename}`;
  }
};

export default UPLOAD_CONFIG;
