/**
 * ระบบ Constants และ Enums สำหรับจัดการค่าต่างๆ ในระบบ
 * ป้องกันการ hardcode ค่าซ้ำๆ ในหลายที่
 * ง่ายต่อการแก้ไขและบำรุงรักษา
 * 
 * หมายเหตุ:
 * - Constants นี้ใช้สำหรับค่า ENUM ที่ไม่เปลี่ยนแปลง (Status, Priority, Type)
 * - ใช้ English keys ใน database เพื่อความเป็นมาตรฐาน
 * - แสดงผลเป็นภาษาไทยผ่าน LABELS
 * - สำหรับข้อมูลที่มี Master Table (Categories, Villages, Roles) ให้ดึงจาก API
 */

// ==============================================
// REPORT STATUS
// ==============================================
export const REPORT_STATUS = {
  PENDING: 'PENDING',      // รอการพิจารณา
  APPROVED: 'APPROVED',    // อนุมัติแล้ว
  REJECTED: 'REJECTED',    // ไม่อนุมัติ
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: 'รอดำเนินการ',
  [REPORT_STATUS.APPROVED]: 'อนุมัติ',
  [REPORT_STATUS.REJECTED]: 'ไม่อนุมัติ',
};

export const REPORT_STATUS_LIST = Object.values(REPORT_STATUS);

export const REPORT_STATUS_COLORS = {
  [REPORT_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    primary: 'text-yellow-600',
  },
  [REPORT_STATUS.APPROVED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    primary: 'text-green-600',
  },
  [REPORT_STATUS.REJECTED]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    primary: 'text-red-600',
  },
};

// ==============================================
// REPAIR STATUS
// ==============================================
export const REPAIR_STATUS = {
  PENDING: 'PENDING',           // รอเริ่มงาน
  IN_PROGRESS: 'IN_PROGRESS',   // กำลังซ่อม
  COMPLETED: 'COMPLETED',       // เสร็จสิ้นแล้ว
  CANCELLED: 'CANCELLED',       // ยกเลิกงาน
};

export const REPAIR_STATUS_LABELS = {
  [REPAIR_STATUS.PENDING]: 'รอดำเนินการ',
  [REPAIR_STATUS.IN_PROGRESS]: 'กำลังดำเนินการ',
  [REPAIR_STATUS.COMPLETED]: 'เสร็จสิ้น',
  [REPAIR_STATUS.CANCELLED]: 'ยกเลิก',
};

export const REPAIR_STATUS_LIST = Object.values(REPAIR_STATUS);

export const REPAIR_STATUS_COLORS = {
  [REPAIR_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    primary: 'text-yellow-600',
  },
  [REPAIR_STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    primary: 'text-blue-600',
  },
  [REPAIR_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    primary: 'text-green-600',
  },
  [REPAIR_STATUS.CANCELLED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    badge: 'bg-gray-100 text-gray-800',
    primary: 'text-gray-600',
  },
};

// ==============================================
// ASSET STATUS
// ==============================================
export const ASSET_STATUS = {
  AVAILABLE: 'AVAILABLE',        // สภาพดี ใช้งานได้ปกติ
  DAMAGED: 'DAMAGED',            // ชำรุด ต้องซ่อม
  DETERIORATED: 'DETERIORATED',  // เก่า เสื่อมสภาพ
  LOST: 'LOST',                  // สูญหาย
};

export const ASSET_STATUS_LABELS = {
  [ASSET_STATUS.AVAILABLE]: 'ใช้งานได้',
  [ASSET_STATUS.DAMAGED]: 'ชำรุด',
  [ASSET_STATUS.DETERIORATED]: 'เสื่อมสภาพ',
  [ASSET_STATUS.LOST]: 'สูญหาย',
};

export const ASSET_STATUS_LIST = Object.values(ASSET_STATUS);

export const ASSET_STATUS_COLORS = {
  [ASSET_STATUS.AVAILABLE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    primary: 'text-green-600',
  },
  [ASSET_STATUS.DAMAGED]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
    primary: 'text-orange-600',
  },
  [ASSET_STATUS.DETERIORATED]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    primary: 'text-yellow-600',
  },
  [ASSET_STATUS.LOST]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    primary: 'text-red-600',
  },
};

// ==============================================
// PRIORITY LEVELS
// ==============================================
export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: 'ต่ำ',
  [PRIORITY.MEDIUM]: 'ปานกลาง',
  [PRIORITY.HIGH]: 'สูง',
  [PRIORITY.URGENT]: 'ฉุกเฉิน',
};

export const PRIORITY_LIST = Object.values(PRIORITY);

export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-600',
    primary: 'text-green-600',
  },
  [PRIORITY.MEDIUM]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-600',
    primary: 'text-yellow-600',
  },
  [PRIORITY.HIGH]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-600',
    primary: 'text-orange-600',
  },
  [PRIORITY.URGENT]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-600',
    primary: 'text-red-600',
  },
};

// ==============================================
// REPORT TYPES
// ==============================================
export const REPORT_TYPE = {
  REPAIR: 'repair',    // แจ้งซ่อม
  REQUEST: 'request',  // ใบคำร้อง
};

export const REPORT_TYPE_LIST = Object.values(REPORT_TYPE);

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPE.REPAIR]: 'แจ้งซ่อม',
  [REPORT_TYPE.REQUEST]: 'ใบคำร้อง',
};

// ==============================================
// USER ROLES
// ==============================================
export const USER_ROLE = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  STAFF: 'staff',
};

export const USER_ROLE_LIST = Object.values(USER_ROLE);

export const USER_ROLE_LABELS = {
  [USER_ROLE.ADMIN]: 'ผู้ดูแลระบบ',
  [USER_ROLE.TECHNICIAN]: 'ช่างเทคนิค',
  [USER_ROLE.STAFF]: 'เจ้าหน้าที่',
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * ดึงสีของ status
 * @param {string} status - สถานะ
 * @param {Object} statusColors - object ของสีสถานะ
 * @param {string} type - ประเภทสี (bg, text, badge, primary)
 * @returns {string} class สี
 */
export const getStatusColor = (status, statusColors, type = 'badge') => {
  return statusColors[status]?.[type] || 'bg-gray-100 text-gray-800';
};

/**
 * ดึง label ของ status
 * @param {string} status - status key
 * @param {Object} statusLabels - object ของ label
 * @returns {string} label ภาษาไทย
 */
export const getStatusLabel = (status, statusLabels) => {
  return statusLabels[status] || status;
};

/**
 * ตรวจสอบว่า status ถูกต้องหรือไม่
 * @param {string} status - สถานะที่ต้องการตรวจสอบ
 * @param {Array} validStatuses - array ของ status ที่ถูกต้อง
 * @returns {boolean}
 */
export const isValidStatus = (status, validStatuses) => {
  return validStatuses.includes(status);
};

/**
 * ดึง label ของ report type
 * @param {string} type - report type
 * @returns {string}
 */
export const getReportTypeLabel = (type) => {
  return REPORT_TYPE_LABELS[type] || type;
};

/**
 * ดึง label ของ role
 * @param {string} role - user role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role;
};

// ==============================================
// SPECIFIC HELPER FUNCTIONS
// ==============================================

/**
 * ดึง label ของ repair status
 */
export const getRepairStatusLabel = (status) => {
  return REPAIR_STATUS_LABELS[status] || status;
};

/**
 * ดึงสีของ repair status
 */
export const getRepairStatusColor = (status, type = 'badge') => {
  return getStatusColor(status, REPAIR_STATUS_COLORS, type);
};

/**
 * ดึง label ของ report status
 */
export const getReportStatusLabel = (status) => {
  return REPORT_STATUS_LABELS[status] || status;
};

/**
 * ดึงสีของ report status
 */
export const getReportStatusColor = (status, type = 'badge') => {
  return getStatusColor(status, REPORT_STATUS_COLORS, type);
};

/**
 * ดึง label ของ asset status
 */
export const getAssetStatusLabel = (status) => {
  return ASSET_STATUS_LABELS[status] || status;
};

/**
 * ดึงสีของ asset status
 */
export const getAssetStatusColor = (status, type = 'badge') => {
  return getStatusColor(status, ASSET_STATUS_COLORS, type);
};

/**
 * ดึง label ของ priority
 */
export const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority;
};

/**
 * ดึงสีของ priority
 */
export const getPriorityColor = (priority, type = 'badge') => {
  return getStatusColor(priority, PRIORITY_COLORS, type);
};

// ==============================================
// VALIDATION HELPERS
// ==============================================

export const validators = {
  reportStatus: (status) => isValidStatus(status, REPORT_STATUS_LIST),
  repairStatus: (status) => isValidStatus(status, REPAIR_STATUS_LIST),
  assetStatus: (status) => isValidStatus(status, ASSET_STATUS_LIST),
  priority: (priority) => isValidStatus(priority, PRIORITY_LIST),
  reportType: (type) => isValidStatus(type, REPORT_TYPE_LIST),
  userRole: (role) => isValidStatus(role, USER_ROLE_LIST),
};

// Export default สำหรับ import ทั้งหมด
export default {
  // Status Objects
  REPORT_STATUS,
  REPAIR_STATUS,
  ASSET_STATUS,
  PRIORITY,
  REPORT_TYPE,
  USER_ROLE,
  
  // Labels
  REPORT_STATUS_LABELS,
  REPAIR_STATUS_LABELS,
  ASSET_STATUS_LABELS,
  PRIORITY_LABELS,
  REPORT_TYPE_LABELS,
  USER_ROLE_LABELS,
  
  // Lists
  REPORT_STATUS_LIST,
  REPAIR_STATUS_LIST,
  ASSET_STATUS_LIST,
  PRIORITY_LIST,
  REPORT_TYPE_LIST,
  USER_ROLE_LIST,
  
  // Colors
  REPORT_STATUS_COLORS,
  REPAIR_STATUS_COLORS,
  ASSET_STATUS_COLORS,
  PRIORITY_COLORS,
  
  // Helper Functions
  getStatusColor,
  getStatusLabel,
  isValidStatus,
  getReportTypeLabel,
  getRoleLabel,
  
  // Specific Helpers
  getRepairStatusLabel,
  getRepairStatusColor,
  getReportStatusLabel,
  getReportStatusColor,
  getAssetStatusLabel,
  getAssetStatusColor,
  getPriorityLabel,
  getPriorityColor,
  
  // Validators
  validators,
};

