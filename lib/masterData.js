/**
 * Master Data Helper
 * สำหรับดึงข้อมูลจาก Master Tables และ Enums ผ่าน API
 * ใช้ caching เพื่อลดการเรียก API ซ้ำๆ
 */

import { useState, useEffect } from 'react';

// Cache สำหรับเก็บข้อมูล master data
const cache = {
  categories: null,
  villages: null,
  roles: null,
  users: null,
  // Enums
  report_status: null,
  repair_status: null,
  asset_status: null,
  priority: null,
  report_type: null,
};

// Timestamp สำหรับ cache expiry (5 นาที)
const cacheExpiry = 5 * 60 * 1000;
const cacheTimestamps = {};

/**
 * ตรวจสอบว่า cache หมดอายุหรือยัง
 */
const isCacheValid = (key) => {
  const timestamp = cacheTimestamps[key];
  if (!timestamp) return false;
  return Date.now() - timestamp < cacheExpiry;
};

/**
 * ดึงข้อมูล Categories
 * @returns {Promise<Array>} รายการ categories
 */
export const getCategories = async () => {
  if (cache.categories && isCacheValid('categories')) {
    return cache.categories;
  }

  try {
    const response = await fetch('/api/categories');
    const data = await response.json();
    
    if (data.success) {
      cache.categories = data.data;
      cacheTimestamps.categories = Date.now();
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch categories');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return cache.categories || []; // Return cached data if available
  }
};

/**
 * ดึงข้อมูล Villages
 * @returns {Promise<Array>} รายการ villages
 */
export const getVillages = async () => {
  if (cache.villages && isCacheValid('villages')) {
    return cache.villages;
  }

  try {
    const response = await fetch('/api/villages');
    const data = await response.json();
    
    if (data.success) {
      cache.villages = data.data;
      cacheTimestamps.villages = Date.now();
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch villages');
  } catch (error) {
    console.error('Error fetching villages:', error);
    return cache.villages || [];
  }
};

/**
 * ดึงข้อมูล Roles
 * @returns {Promise<Array>} รายการ roles
 */
export const getRoles = async () => {
  if (cache.roles && isCacheValid('roles')) {
    return cache.roles;
  }

  try {
    const response = await fetch('/api/roles');
    const data = await response.json();
    
    if (data.success) {
      cache.roles = data.data;
      cacheTimestamps.roles = Date.now();
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch roles');
  } catch (error) {
    console.error('Error fetching roles:', error);
    return cache.roles || [];
  }
};

/**
 * ดึงข้อมูล Users
 * @returns {Promise<Array>} รายการ users
 */
export const getUsers = async () => {
  if (cache.users && isCacheValid('users')) {
    return cache.users;
  }

  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    if (data.success) {
      cache.users = data.data;
      cacheTimestamps.users = Date.now();
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching users:', error);
    return cache.users || [];
  }
};

// ==============================================
// ENUMS
// ==============================================

/**
 * ดึงข้อมูล Enum
 * @param {string} type - ประเภท enum (report_status, repair_status, asset_status, priority, report_type)
 * @returns {Promise<Array>} รายการ enum
 */
export const getEnum = async (type) => {
  if (cache[type] && isCacheValid(type)) {
    return cache[type];
  }

  try {
    const response = await fetch(`/api/enums?type=${type}`);
    const data = await response.json();
    
    if (data.success) {
      cache[type] = data.data;
      cacheTimestamps[type] = Date.now();
      return data.data;
    }
    
    throw new Error(data.error || `Failed to fetch ${type}`);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return cache[type] || [];
  }
};

/**
 * ดึงข้อมูล Report Status
 * @returns {Promise<Array>}
 */
export const getReportStatus = () => getEnum('report_status');

/**
 * ดึงข้อมูล Repair Status
 * @returns {Promise<Array>}
 */
export const getRepairStatus = () => getEnum('repair_status');

/**
 * ดึงข้อมูล Asset Status
 * @returns {Promise<Array>}
 */
export const getAssetStatus = () => getEnum('asset_status');

/**
 * ดึงข้อมูล Priority
 * @returns {Promise<Array>}
 */
export const getPriority = () => getEnum('priority');

/**
 * ดึงข้อมูล Report Type
 * @returns {Promise<Array>}
 */
export const getReportType = () => getEnum('report_type');

/**
 * ดึง enum item จาก value
 * @param {string} type - ประเภท enum
 * @param {string} value - ค่าที่ต้องการหา
 * @returns {Promise<Object|null>}
 */
export const getEnumItem = async (type, value) => {
  const enumList = await getEnum(type);
  return enumList.find(item => item.value === value) || null;
};

/**
 * ดึงสีของ enum value
 * @param {string} type - ประเภท enum
 * @param {string} value - ค่า
 * @param {string} colorType - ประเภทสี (bg, text, badge, primary)
 * @returns {Promise<string>}
 */
export const getEnumColor = async (type, value, colorType = 'badge') => {
  const item = await getEnumItem(type, value);
  return item?.color?.[colorType] || 'bg-gray-100 text-gray-800';
};

/**
 * Clear cache (ใช้เมื่อมีการเพิ่ม/แก้ไข/ลบ master data)
 * @param {string} key - cache key ที่ต้องการ clear (ถ้าไม่ระบุจะ clear ทั้งหมด)
 */
export const clearCache = (key = null) => {
  if (key) {
    cache[key] = null;
    delete cacheTimestamps[key];
  } else {
    // Clear all
    Object.keys(cache).forEach(k => {
      cache[k] = null;
      delete cacheTimestamps[k];
    });
  }
};

/**
 * Prefetch ข้อมูล master data และ enums ทั้งหมด
 * เรียกใช้ตอน app init เพื่อให้ข้อมูลพร้อมใช้งาน
 */
export const prefetchMasterData = async () => {
  try {
    await Promise.all([
      // Master tables
      getCategories(),
      getVillages(),
      getRoles(),
      // Enums
      getReportStatus(),
      getRepairStatus(),
      getAssetStatus(),
      getPriority(),
      getReportType(),
    ]);
  } catch (error) {
    console.error('Error prefetching master data:', error);
  }
};

/**
 * Hook สำหรับใช้ใน React Components
 */
export const useMasterData = (type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result;
        
        switch (type) {
          case 'categories':
            result = await getCategories();
            break;
          case 'villages':
            result = await getVillages();
            break;
          case 'roles':
            result = await getRoles();
            break;
          case 'users':
            result = await getUsers();
            break;
          default:
            throw new Error(`Unknown master data type: ${type}`);
        }
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return { data, loading, error };
};

// Export all functions
export default {
  // Master Tables
  getCategories,
  getVillages,
  getRoles,
  getUsers,
  // Enums
  getEnum,
  getReportStatus,
  getRepairStatus,
  getAssetStatus,
  getPriority,
  getReportType,
  getEnumItem,
  getEnumColor,
  // Utilities
  clearCache,
  prefetchMasterData,
  useMasterData,
};

