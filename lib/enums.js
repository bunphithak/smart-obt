/**
 * Enums/Constants Master Data
 * เก็บค่า enum ต่างๆ ไว้ที่ server
 * Frontend เรียกผ่าน API เพื่อดึงข้อมูล
 * 
 * ข้อดี:
 * - แก้ไขที่ server ที่เดียว ไม่ต้อง rebuild frontend
 * - เพิ่ม/แก้ไข status ได้โดยไม่ต้องแก้ไขโค้ด
 * - เก็บข้อมูลเพิ่มเติม (color, icon, order, label)
 * - รองรับ multi-language
 */

// ==============================================
// REPORT STATUS
// ==============================================
export const REPORT_STATUS = [
  {
    value: 'PENDING',
    label: 'รอดำเนินการ',
    labelEn: 'Pending',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
      primary: 'text-yellow-600',
    },
    icon: 'clock',
    order: 1,
    description: 'รอการพิจารณาอนุมัติ',
  },
  {
    value: 'APPROVED',
    label: 'อนุมัติ',
    labelEn: 'Approved',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      primary: 'text-green-600',
    },
    icon: 'check-circle',
    order: 2,
    description: 'อนุมัติแล้ว',
  },
  {
    value: 'REJECTED',
    label: 'ไม่อนุมัติ',
    labelEn: 'Rejected',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
      primary: 'text-red-600',
    },
    icon: 'x-circle',
    order: 3,
    description: 'ไม่อนุมัติ',
  },
];

// ==============================================
// REPAIR STATUS
// ==============================================
export const REPAIR_STATUS = [
  {
    value: 'PENDING',
    label: 'รอดำเนินการ',
    labelEn: 'Pending',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
      primary: 'text-yellow-600',
    },
    icon: 'clock',
    order: 1,
    description: 'รอเริ่มงานซ่อม',
  },
  {
    value: 'IN_PROGRESS',
    label: 'กำลังดำเนินการ',
    labelEn: 'In Progress',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
      primary: 'text-blue-600',
    },
    icon: 'cog',
    order: 2,
    description: 'กำลังซ่อมบำรุง',
  },
  {
    value: 'COMPLETED',
    label: 'เสร็จสิ้น',
    labelEn: 'Completed',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      primary: 'text-green-600',
    },
    icon: 'check-circle',
    order: 3,
    description: 'ซ่อมเสร็จเรียบร้อย',
  },
  {
    value: 'CANCELLED',
    label: 'ยกเลิก',
    labelEn: 'Cancelled',
    color: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-800',
      primary: 'text-gray-600',
    },
    icon: 'ban',
    order: 4,
    description: 'ยกเลิกงานซ่อม',
  },
];

// ==============================================
// ASSET STATUS
// ==============================================
export const ASSET_STATUS = [
  {
    value: 'AVAILABLE',
    label: 'ใช้งานได้',
    labelEn: 'Available',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      primary: 'text-green-600',
    },
    icon: 'check-circle',
    order: 1,
    description: 'สภาพดี ใช้งานได้ปกติ',
  },
  {
    value: 'DAMAGED',
    label: 'ชำรุด',
    labelEn: 'Damaged',
    color: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      badge: 'bg-orange-100 text-orange-800',
      primary: 'text-orange-600',
    },
    icon: 'exclamation-triangle',
    order: 2,
    description: 'ชำรุด ต้องซ่อมแซม',
  },
  {
    value: 'DETERIORATED',
    label: 'เสื่อมสภาพ',
    labelEn: 'Deteriorated',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
      primary: 'text-yellow-600',
    },
    icon: 'alert-circle',
    order: 3,
    description: 'เก่า เสื่อมสภาพ',
  },
  {
    value: 'LOST',
    label: 'สูญหาย',
    labelEn: 'Lost',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
      primary: 'text-red-600',
    },
    icon: 'x-circle',
    order: 4,
    description: 'สูญหาย',
  },
];

// ==============================================
// PRIORITY LEVELS
// ==============================================
export const PRIORITY = [
  {
    value: 'LOW',
    label: 'ต่ำ',
    labelEn: 'Low',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-600',
      primary: 'text-green-600',
    },
    icon: 'arrow-down',
    order: 1,
    description: 'ความสำคัญต่ำ',
  },
  {
    value: 'MEDIUM',
    label: 'ปานกลาง',
    labelEn: 'Medium',
    color: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-600',
      primary: 'text-yellow-600',
    },
    icon: 'minus',
    order: 2,
    description: 'ความสำคัญปานกลาง',
  },
  {
    value: 'HIGH',
    label: 'สูง',
    labelEn: 'High',
    color: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      badge: 'bg-orange-100 text-orange-600',
      primary: 'text-orange-600',
    },
    icon: 'arrow-up',
    order: 3,
    description: 'ความสำคัญสูง',
  },
  {
    value: 'URGENT',
    label: 'ฉุกเฉิน',
    labelEn: 'Urgent',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-600',
      primary: 'text-red-600',
    },
    icon: 'alert-triangle',
    order: 4,
    description: 'เร่งด่วนมาก',
  },
];

// ==============================================
// REPORT TYPES
// ==============================================
export const REPORT_TYPE = [
  {
    value: 'repair',
    label: 'แจ้งซ่อม',
    labelEn: 'Repair Report',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-600',
      primary: 'text-red-600',
    },
    icon: 'tool',
    order: 1,
    description: 'แจ้งซ่อมทรัพย์สินสาธารณะ',
  },
  {
    value: 'request',
    label: 'ใบคำร้อง',
    labelEn: 'Request Form',
    color: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      badge: 'bg-purple-100 text-purple-600',
      primary: 'text-purple-600',
    },
    icon: 'document-text',
    order: 2,
    description: 'ใบคำร้องทั่วไป',
  },
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * ดึงข้อมูล enum ตาม type
 */
export const getEnum = (type) => {
  switch (type) {
    case 'report_status':
      return REPORT_STATUS;
    case 'repair_status':
      return REPAIR_STATUS;
    case 'asset_status':
      return ASSET_STATUS;
    case 'priority':
      return PRIORITY;
    case 'report_type':
      return REPORT_TYPE;
    default:
      return [];
  }
};

/**
 * ดึงข้อมูล enum item จาก value
 */
export const getEnumItem = (type, value) => {
  const enumList = getEnum(type);
  return enumList.find(item => item.value === value);
};

/**
 * ดึงสีของ enum value
 */
export const getEnumColor = (type, value, colorType = 'badge') => {
  const item = getEnumItem(type, value);
  return item?.color?.[colorType] || 'bg-gray-100 text-gray-800';
};

/**
 * ดึง label ของ enum value
 */
export const getEnumLabel = (type, value, lang = 'th') => {
  const item = getEnumItem(type, value);
  return lang === 'en' ? item?.labelEn : item?.label;
};

/**
 * ตรวจสอบว่า value ถูกต้องหรือไม่
 */
export const isValidEnum = (type, value) => {
  const enumList = getEnum(type);
  return enumList.some(item => item.value === value);
};

/**
 * ดึง values ทั้งหมดของ enum (สำหรับ CHECK constraint)
 */
export const getEnumValues = (type) => {
  const enumList = getEnum(type);
  return enumList.map(item => item.value);
};

// Export all
export default {
  REPORT_STATUS,
  REPAIR_STATUS,
  ASSET_STATUS,
  PRIORITY,
  REPORT_TYPE,
  getEnum,
  getEnumItem,
  getEnumColor,
  getEnumLabel,
  isValidEnum,
  getEnumValues,
};

