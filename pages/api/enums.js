/**
 * API Endpoint: /api/enums
 * ดึงข้อมูล Enums/Constants ต่างๆ
 * 
 * Query Parameters:
 * - type: ประเภท enum (report_status, repair_status, asset_status, priority, report_type)
 * - value: ดึงข้อมูลเฉพาะ value นั้น
 * 
 * Examples:
 * - GET /api/enums?type=report_status - ดึง report status ทั้งหมด
 * - GET /api/enums?type=priority&value=สูง - ดึงข้อมูล priority สูง
 * - GET /api/enums - ดึง enums ทั้งหมด
 */

import { getEnum, getEnumItem, REPORT_STATUS, REPAIR_STATUS, ASSET_STATUS, PRIORITY, REPORT_TYPE } from '../../lib/enums';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { type, value } = req.query;

    // ถ้าระบุ type และ value - ดึงข้อมูล enum item เดียว
    if (type && value) {
      const item = getEnumItem(type, value);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: `Enum value '${value}' not found in type '${type}'`,
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    }

    // ถ้าระบุแค่ type - ดึง enum ทั้งหมดของ type นั้น
    if (type) {
      const enumList = getEnum(type);
      
      if (enumList.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Enum type '${type}' not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: enumList,
      });
    }

    // ไม่ระบุอะไร - ดึง enums ทั้งหมด
    return res.status(200).json({
      success: true,
      data: {
        report_status: REPORT_STATUS,
        repair_status: REPAIR_STATUS,
        asset_status: ASSET_STATUS,
        priority: PRIORITY,
        report_type: REPORT_TYPE,
      },
    });

  } catch (error) {
    console.error('Error fetching enums:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch enums',
      details: error.message,
    });
  }
}

