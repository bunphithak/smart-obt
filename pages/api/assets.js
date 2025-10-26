// Assets API - Connected to PostgreSQL Database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { ASSET_STATUS } = require('../../lib/constants');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'bunphithak',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_obt',
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { villageId, status, category, id, code } = req.query;
        
        if (id) {
          // Get single asset with village and category info
          const result = await pool.query(`
            SELECT 
              a.*,
              v.name as village_name,
              c.name as category_name
            FROM assets a
            LEFT JOIN villages v ON a.village_id = v.id
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.id = $1
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลทรัพย์สิน' 
            });
          }

          const asset = result.rows[0];
          res.status(200).json({ 
            success: true, 
            data: {
              category: asset.category_name,
              categoryId: asset.category_id,
              id: asset.id,
              name: asset.name,
              code: asset.code,
              status: asset.status,
              villageId: asset.village_id,
              villageName: asset.village_name,
              qrCode: asset.qr_code,
              value: asset.value,
              purchaseDate: asset.purchase_date,
              locationName: asset.location_name,
              locationAddress: asset.location_address,
              latitude: asset.latitude,
              longitude: asset.longitude,
              description: asset.description,
              createdAt: asset.created_at
            }
          });
          return;
        }

        if (code) {
          // Get asset by code
          const result = await pool.query(`
            SELECT 
              a.*,
              v.name as village_name,
              c.name as category_name
            FROM assets a
            LEFT JOIN villages v ON a.village_id = v.id
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE a.code = $1
          `, [code]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลทรัพย์สิน' 
            });
          }

          const asset = result.rows[0];
          res.status(200).json({ 
            success: true, 
            data: [{
              category: asset.category_name,
              categoryId: asset.category_id,
              id: asset.id,
              name: asset.name,
              code: asset.code,
              status: asset.status,
              villageId: asset.village_id,
              villageName: asset.village_name,
              qrCode: asset.qr_code,
              value: asset.value,
              purchaseDate: asset.purchase_date,
              locationName: asset.location_name,
              locationAddress: asset.location_address,
              latitude: asset.latitude,
              longitude: asset.longitude,
              description: asset.description,
              createdAt: asset.created_at
            }]
          });
          return;
        } else {
          // Build query with filters
          let query = `
            SELECT 
              a.*,
              v.name as village_name,
              c.name as category_name
            FROM assets a
            LEFT JOIN villages v ON a.village_id = v.id
            LEFT JOIN categories c ON a.category_id = c.id
            WHERE 1=1
          `;
          const queryParams = [];
          let paramIndex = 1;

          if (villageId) {
            query += ` AND a.village_id = $${paramIndex}`;
            queryParams.push(villageId);
            paramIndex++;
          }

          if (status) {
            query += ` AND a.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
          }

          if (category) {
            query += ` AND c.name = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
          }

          query += ` ORDER BY a.created_at DESC`;

          const result = await pool.query(query, queryParams);
          
          const assets = result.rows.map(row => ({
            category: row.category_name,
            categoryId: row.category_id,
            id: row.id,
            name: row.name,
            code: row.code,
            status: row.status,
            villageId: row.village_id,
            villageName: row.village_name,
            qrCode: row.qr_code,
            value: row.value,
            purchaseDate: row.purchase_date,
            locationName: row.location_name,
            locationAddress: row.location_address,
            latitude: row.latitude,
            longitude: row.longitude,
            description: row.description,
            createdAt: row.created_at
          }));

          res.status(200).json({ 
            success: true, 
            data: assets,
            total: assets.length
          });
        }
        break;

      case 'POST':
        const { 
          name, 
          code: assetCode, 
          categoryId, 
          villageId: assetVillageId, 
          description, 
          status: assetStatus, 
          value, 
          purchaseDate, 
          locationName, 
          locationAddress, 
          latitude, 
          longitude 
        } = req.body;
        
        // Validate required fields
        if (!name || !assetCode || !categoryId || !assetVillageId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (name, code, categoryId, villageId)' 
          });
        }

        // Check if code already exists
        const existingAsset = await pool.query(
          'SELECT id FROM assets WHERE code = $1',
          [assetCode]
        );

        if (existingAsset.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'รหัสทรัพย์สินนี้มีอยู่แล้ว'
          });
        }

        // Verify village and category exist
        const villageExists = await pool.query(
          'SELECT id FROM villages WHERE id = $1',
          [assetVillageId]
        );

        if (villageExists.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่พบหมู่บ้านที่ระบุ'
          });
        }

        const categoryExists = await pool.query(
          'SELECT id FROM categories WHERE id = $1',
          [categoryId]
        );

        if (categoryExists.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่พบหมวดหมู่ที่ระบุ'
          });
        }
        
        const result = await pool.query(`
          INSERT INTO assets (
            name, code, category_id, village_id, description, status, 
            value, purchase_date, location_name, location_address, 
            latitude, longitude, qr_code
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          name.trim(),
          assetCode.trim(),
          categoryId,
          assetVillageId,
          description?.trim() || '',
          assetStatus || ASSET_STATUS.AVAILABLE,
          value ? parseFloat(value) : null,
          purchaseDate || null,
          locationName?.trim() || null,
          locationAddress?.trim() || null,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null,
          `/qr/${assetCode}.png`
        ]);

        const newAsset = result.rows[0];
        res.status(201).json({ 
          success: true, 
          data: {
            category: categoryExists.rows[0].name,
            categoryId: newAsset.category_id,
            id: newAsset.id,
            name: newAsset.name,
            code: newAsset.code,
            status: newAsset.status,
            villageId: newAsset.village_id,
            villageName: villageExists.rows[0].name,
            qrCode: newAsset.qr_code,
            value: newAsset.value,
            purchaseDate: newAsset.purchase_date,
            locationName: newAsset.location_name,
            locationAddress: newAsset.location_address,
            latitude: newAsset.latitude,
            longitude: newAsset.longitude,
            description: newAsset.description,
            createdAt: newAsset.created_at
          }
        });
        break;

      case 'PUT':
        const { 
          id: updateId, 
          name: updateName, 
          code: updateCode, 
          categoryId: updateCategoryId, 
          villageId: updateVillageId, 
          description: updateDescription, 
          status: updateStatus, 
          value: updateValue, 
          purchaseDate: updatePurchaseDate, 
          locationName: updateLocationName, 
          locationAddress: updateLocationAddress, 
          latitude: updateLatitude, 
          longitude: updateLongitude 
        } = req.body;
        
        // Validate required fields
        if (!updateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของทรัพย์สิน' 
          });
        }

        // Check if asset exists
        const assetExists = await pool.query(
          'SELECT id FROM assets WHERE id = $1',
          [updateId]
        );

        if (assetExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบทรัพย์สินที่ต้องการอัปเดต'
          });
        }

        // Check if new code conflicts (if provided)
        if (updateCode) {
          const codeConflict = await pool.query(
            'SELECT id FROM assets WHERE code = $1 AND id != $2',
            [updateCode, updateId]
          );

          if (codeConflict.rows.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'รหัสทรัพย์สินนี้มีอยู่แล้ว'
            });
          }
        }

        const updateResult = await pool.query(`
          UPDATE assets 
          SET name = COALESCE($2, name),
              code = COALESCE($3, code),
              category_id = COALESCE($4, category_id),
              village_id = COALESCE($5, village_id),
              description = COALESCE($6, description),
              status = COALESCE($7, status),
              value = COALESCE($8, value),
              purchase_date = COALESCE($9, purchase_date),
              location_name = COALESCE($10, location_name),
              location_address = COALESCE($11, location_address),
              latitude = COALESCE($12, latitude),
              longitude = COALESCE($13, longitude),
              qr_code = CASE WHEN $3 IS NOT NULL THEN '/qr/' || $3 || '.png' ELSE qr_code END,
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [
          updateId,
          updateName?.trim(),
          updateCode?.trim(),
          updateCategoryId,
          updateVillageId,
          updateDescription?.trim(),
          updateStatus,
          updateValue ? parseFloat(updateValue) : null,
          updatePurchaseDate || null,
          updateLocationName?.trim(),
          updateLocationAddress?.trim(),
          updateLatitude ? parseFloat(updateLatitude) : null,
          updateLongitude ? parseFloat(updateLongitude) : null
        ]);

        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลทรัพย์สินสำเร็จ',
          data: updateResult.rows[0]
        });
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของทรัพย์สินที่ต้องการลบ' 
          });
        }

        // Check if asset exists
        const assetToDelete = await pool.query(
          'SELECT id FROM assets WHERE id = $1',
          [deleteId]
        );

        if (assetToDelete.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบทรัพย์สินที่ต้องการลบ'
          });
        }

        // Check if asset has reports or repairs
        const reportsCheck = await pool.query(
          'SELECT COUNT(*) as count FROM reports WHERE asset_id = $1',
          [deleteId]
        );

        const repairsCheck = await pool.query(
          'SELECT COUNT(*) as count FROM repairs WHERE asset_id = $1',
          [deleteId]
        );

        if (parseInt(reportsCheck.rows[0].count) > 0 || parseInt(repairsCheck.rows[0].count) > 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่สามารถลบทรัพย์สินที่มีรายงานหรืองานซ่อมได้'
          });
        }

        await pool.query('DELETE FROM assets WHERE id = $1', [deleteId]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบทรัพย์สินสำเร็จ' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }

  } catch (error) {
    console.error('Assets API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}