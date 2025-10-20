// Environment Variables Configuration
// ==================================================

// Database Configuration
export const DB_CONFIG = {
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
  url: process.env.DATABASE_URL || 'postgresql://bunphithak@localhost:5432/smart_obt'
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Application Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Smart OBT',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  debugMode: process.env.DEBUG_MODE === 'true',
  enableMockData: process.env.ENABLE_MOCK_DATA === 'true'
};

// Security Configuration
export const SECURITY_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'smart_obt_jwt_secret_key_2024',
  sessionSecret: process.env.SESSION_SECRET || 'smart_obt_session_secret_2024',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || 'smart_obt_nextauth_secret_2024',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  provider: process.env.CLOUD_STORAGE_PROVIDER || 'firebase',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ],
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  }
};

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: parseInt(process.env.API_TIMEOUT) || 30000
};

// Logging Configuration
export const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  enableConsole: process.env.ENABLE_CONSOLE_LOG === 'true',
  enableFile: process.env.ENABLE_FILE_LOG === 'true',
  showQueryLog: process.env.SHOW_QUERY_LOG === 'true'
};

// Validation function
export const validateConfig = () => {
  const errors = [];
  
  // Check required Firebase config
  if (!FIREBASE_CONFIG.apiKey) {
    errors.push('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  }
  
  if (!FIREBASE_CONFIG.projectId) {
    errors.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
  }
  
  // Check database config
  if (!DB_CONFIG.host) {
    errors.push('DB_HOST is required');
  }
  
  if (!DB_CONFIG.database) {
    errors.push('DB_NAME is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    return false;
  }
  
  return true;
};

// Export all configs
export default {
  DB_CONFIG,
  FIREBASE_CONFIG,
  APP_CONFIG,
  SECURITY_CONFIG,
  UPLOAD_CONFIG,
  API_CONFIG,
  LOG_CONFIG,
  validateConfig
};
