// Repairs API - Connected to PostgreSQL Database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { REPAIR_STATUS, PRIORITY } = require('../../lib/constants');

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
        const { id, reportId, status, assignedTo } = req.query;
        
        if (id) {
          // Get single repair with related info
          const result = await pool.query(`
            SELECT 
              r.*,
              rep.title as report_title,
              rep.ticket_id,
              rep.asset_code,
              rep.report_type,
              rep.reported_by,
              rep.reporter_phone,
              rep.reported_at,
              a.name as asset_name,
              a.category_id,
              c.name as category_name,
              v.name as village_name,
              u.name as technician_name
            FROM repairs r
            LEFT JOIN reports rep ON r.report_id = rep.id
            LEFT JOIN assets a ON rep.asset_code = a.code
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN villages v ON a.village_id = v.id
            LEFT JOIN users u ON r.assigned_to = u.id
            WHERE r.id = $1
          `, [id]);

          if (result.rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบงานซ่อมที่ระบุ' 
            });
          }

          const repair = result.rows[0];
          
          // Parse images to separate report images and completion images
          let reportImages = [];
          let completionImages = [];
          let allImages = [];
          
          // Get report images from the reports table
          const reportResult = await pool.query(`
            SELECT images FROM reports WHERE id = $1
          `, [repair.report_id]);
          
          if (reportResult.rows.length > 0 && reportResult.rows[0].images) {
            try {
              const parsedImages = typeof reportResult.rows[0].images === 'string' 
                ? JSON.parse(reportResult.rows[0].images) 
                : reportResult.rows[0].images;
              if (Array.isArray(parsedImages)) {
                reportImages = parsedImages;
              }
            } catch (e) {
              console.error('Error parsing report images:', e);
            }
          }
          
          // Parse repair images (which now contains merged images)
          if (repair.images) {
            try {
              const parsedImages = typeof repair.images === 'string' 
                ? JSON.parse(repair.images) 
                : repair.images;
              if (Array.isArray(parsedImages)) {
                allImages = parsedImages;
                // If we have report images, completion images are the ones not in report images
                if (reportImages.length > 0) {
                  completionImages = parsedImages.filter(img => !reportImages.includes(img));
                } else {
                  // If no report images, assume all are completion images
                  completionImages = parsedImages;
                }
              }
            } catch (e) {
              console.error('Error parsing repair images:', e);
            }
          }
          
          res.status(200).json({ 
            success: true, 
            data: {
              id: repair.id,
              reportId: repair.report_id,
              reportTitle: repair.report_title,
              reportType: repair.report_type,
              ticketId: repair.ticket_id,
              assetCode: repair.asset_code,
              assetName: repair.asset_name,
              categoryName: repair.category_name,
              villageName: repair.village_name,
              title: repair.title,
              description: repair.description,
              status: repair.status,
              priority: repair.priority,
              assignedTo: repair.assigned_to,
              technicianName: repair.technician_name,
              reportedBy: repair.reported_by,
              reporterPhone: repair.reporter_phone,
              reportedAt: repair.reported_at,
              estimatedCost: repair.estimated_cost,
              actualCost: repair.actual_cost,
              dueDate: repair.due_date,
              startDate: repair.start_date,
              completedDate: repair.completed_date,
              notes: repair.notes,
              location: repair.location,
              latitude: repair.latitude,
              longitude: repair.longitude,
              images: allImages, // All images for backward compatibility
              reportImages: reportImages, // Original report images
              completionImages: completionImages, // Completion images
              createdAt: repair.created_at,
              updatedAt: repair.updated_at
            }
          });
        } else {
          // Build query with filters
          let query = `
            SELECT 
              r.*,
              rep.title as report_title,
              rep.ticket_id,
              rep.asset_code,
              rep.report_type,
              rep.reported_by,
              rep.reporter_phone,
              rep.reported_at,
              rep.location,
              rep.coordinates,
              rep.images,
              a.name as asset_name,
              a.category_id,
              c.name as category_name,
              v.name as village_name,
              u.name as technician_name
            FROM repairs r
            LEFT JOIN reports rep ON r.report_id = rep.id
            LEFT JOIN assets a ON rep.asset_code = a.code
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN villages v ON a.village_id = v.id
            LEFT JOIN users u ON r.assigned_to = u.id
            WHERE 1=1
          `;
          const queryParams = [];
          let paramIndex = 1;

          if (reportId) {
            query += ` AND r.report_id = $${paramIndex}`;
            queryParams.push(reportId);
            paramIndex++;
          }

          if (status) {
            query += ` AND r.status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
          }

          if (assignedTo) {
            query += ` AND r.assigned_to = $${paramIndex}`;
            queryParams.push(assignedTo);
            paramIndex++;
          }

          query += ` ORDER BY r.created_at DESC`;

          const result = await pool.query(query, queryParams);
          
          const repairs = result.rows.map(row => ({
            id: row.id,
            reportId: row.report_id,
            reportTitle: row.report_title,
            reportType: row.report_type,
            ticketId: row.ticket_id,
            assetCode: row.asset_code,
            assetName: row.asset_name,
            categoryName: row.category_name,
            villageName: row.village_name,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            assignedTo: row.assigned_to,
            technicianName: row.technician_name,
            reportedBy: row.reported_by,
            reporterPhone: row.reporter_phone,
            reportedAt: row.reported_at,
            location: row.location,
            coordinates: row.coordinates,
            estimatedCost: row.estimated_cost,
            actualCost: row.actual_cost,
            dueDate: row.due_date,
            startDate: row.start_date,
            completedDate: row.completed_date,
            notes: row.notes,
            images: row.images || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));

          res.status(200).json({ 
            success: true, 
            data: repairs,
            total: repairs.length
          });
        }
        break;

      case 'POST':
        const { 
          reportId: repairReportId, 
          title, 
          description, 
          priority, 
          assignedTo: repairAssignedTo, 
          estimatedCost, 
          dueDate, 
          notes,
          assetCode,
          location,
          latitude,
          longitude
        } = req.body;

        // Validate required fields
        if (!repairReportId || !title || !description) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (reportId, title, description)' 
          });
        }

        // Validate: ต้องมีช่างผู้รับผิดชอบ
        if (!repairAssignedTo || !repairAssignedTo.trim()) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุช่างผู้รับผิดชอบ'
          });
        }

        // Verify report exists
        const reportExists = await pool.query(`
          SELECT r.id, r.title, r.asset_code
          FROM reports r
          WHERE r.id = $1
        `, [repairReportId]);

        if (reportExists.rows.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่พบรายงานที่ระบุ'
          });
        }

        // Check if repair already exists for this report
        const existingRepair = await pool.query(
          'SELECT id FROM repairs WHERE report_id = $1',
          [repairReportId]
        );

        if (existingRepair.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'มีงานซ่อมสำหรับรายงานนี้อยู่แล้ว'
          });
        }

        const result = await pool.query(`
          INSERT INTO repairs (
            report_id, title, description, status, priority, assigned_to,
            estimated_cost, due_date, notes, asset_code, location, latitude, longitude
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          repairReportId,
          title.trim(),
          description.trim(),
          REPAIR_STATUS.PENDING,
          priority || PRIORITY.MEDIUM,
          repairAssignedTo?.trim() || '',
          estimatedCost ? parseFloat(estimatedCost) : null,
          dueDate || null,
          notes?.trim() || '',
          assetCode?.trim() || null,
          location?.trim() || null,
          latitude ? parseFloat(latitude) : null,
          longitude ? parseFloat(longitude) : null
        ]);

        const newRepair = result.rows[0];
        res.status(201).json({ 
          success: true, 
          data: {
            id: newRepair.id,
            reportId: newRepair.report_id,
            reportTitle: reportExists.rows[0].title,
            assetCode: reportExists.rows[0].asset_code,
            title: newRepair.title,
            description: newRepair.description,
            status: newRepair.status,
            priority: newRepair.priority,
            assignedTo: newRepair.assigned_to,
            estimatedCost: newRepair.estimated_cost,
            actualCost: newRepair.actual_cost,
            dueDate: newRepair.due_date,
            startDate: newRepair.start_date,
            completedDate: newRepair.completed_date,
            notes: newRepair.notes,
            images: newRepair.images || [],
            createdAt: newRepair.created_at
          }
        });
        break;

      case 'PUT':
        const { 
          id: updateId, 
          status: updateStatus, 
          priority: updatePriority, 
          assignedTo: updateAssignedTo,
          estimatedCost: updateEstimatedCost,
          actualCost: updateActualCost,
          dueDate: updateDueDate,
          startDate: updateStartDate,
          completedDate: updateCompletedDate,
          notes: updateNotes,
          images: updateImages
        } = req.body;

        if (!updateId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของงานซ่อม' 
          });
        }

        // Check if repair exists and get current status
        const repairExists = await pool.query(
          'SELECT id, status FROM repairs WHERE id = $1',
          [updateId]
        );

        if (repairExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบงานซ่อมที่ต้องการอัปเดต'
          });
        }

        const currentRepair = repairExists.rows[0];
        
        // Validate: ต้องมีช่างผู้รับผิดชอบ ยกเว้นงานที่ยกเลิก
        const finalAssignedTo = updateAssignedTo?.trim() || null;
        const finalStatus = updateStatus || currentRepair.status;
        
        if (!finalAssignedTo && finalStatus !== REPAIR_STATUS.CANCELLED) {
          return res.status(400).json({
            success: false,
            error: 'กรุณาระบุช่างผู้รับผิดชอบ หรือเปลี่ยนสถานะเป็น "ยกเลิก"'
          });
        }
        
        // Convert empty string to null for date fields
        const finalDueDate = updateDueDate?.trim() || null;
        const finalStartDate = updateStartDate?.trim() || null;
        
        // Auto-set completedDate if status changed to COMPLETED
        let finalCompletedDate = updateCompletedDate?.trim() || null;
        if (updateStatus === REPAIR_STATUS.COMPLETED && currentRepair.status !== REPAIR_STATUS.COMPLETED) {
          finalCompletedDate = new Date().toISOString();
        }

        const updateResult = await pool.query(`
          UPDATE repairs 
          SET status = COALESCE($2, status),
              priority = COALESCE($3, priority),
              assigned_to = COALESCE($4, assigned_to),
              estimated_cost = COALESCE($5, estimated_cost),
              actual_cost = COALESCE($6, actual_cost),
              due_date = COALESCE($7, due_date),
              start_date = COALESCE($8, start_date),
              completed_date = COALESCE($9, completed_date),
              notes = COALESCE($10, notes),
              images = COALESCE($11, images),
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [
          updateId,
          updateStatus,
          updatePriority,
          finalAssignedTo,
          updateEstimatedCost ? parseFloat(updateEstimatedCost) : null,
          updateActualCost ? parseFloat(updateActualCost) : null,
          finalDueDate,
          finalStartDate,
          finalCompletedDate,
          updateNotes?.trim() || null,
          updateImages ? JSON.stringify(updateImages) : null
        ]);

        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตงานซ่อมสำเร็จ',
          data: updateResult.rows[0]
        });
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของงานซ่อมที่ต้องการลบ' 
          });
        }

        // Check if repair exists
        const repairToDelete = await pool.query(
          'SELECT id FROM repairs WHERE id = $1',
          [deleteId]
        );

        if (repairToDelete.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'ไม่พบงานซ่อมที่ต้องการลบ'
          });
        }

        // Check if repair has feedback
        const feedbackCheck = await pool.query(
          'SELECT COUNT(*) as count FROM repair_feedback WHERE repair_id = $1',
          [deleteId]
        );

        if (parseInt(feedbackCheck.rows[0].count) > 0) {
          return res.status(400).json({
            success: false,
            error: 'ไม่สามารถลบงานซ่อมที่มีการประเมินผลได้'
          });
        }

        await pool.query('DELETE FROM repairs WHERE id = $1', [deleteId]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบงานซ่อมสำเร็จ' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }

  } catch (error) {
    console.error('Repairs API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}