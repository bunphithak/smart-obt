import { pool } from '../../lib/db.js';
import { REPAIR_STATUS, REPORT_STATUS, REPORT_STATUS_LABELS } from '../../lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get total assets count
    const assetsResult = await pool.query('SELECT COUNT(*) as count FROM assets');
    const totalAssets = parseInt(assetsResult.rows[0].count) || 0;
    console.log('✅ Total assets:', totalAssets);

    // Get total reports count
    const reportsResult = await pool.query('SELECT COUNT(*) as count FROM reports');
    const totalReports = parseInt(reportsResult.rows[0].count) || 0;
    console.log('✅ Total reports:', totalReports);

    // Get pending repairs count (reports with status pending)
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM reports 
      WHERE status = $1
    `, [REPORT_STATUS.PENDING]);
    const pendingRepairs = parseInt(pendingResult.rows[0].count) || 0;
    console.log('✅ Pending repairs:', pendingRepairs);

    // Get completed repairs count
    const completedResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM repairs 
      WHERE status = $1
    `, [REPAIR_STATUS.COMPLETED]);
    const completedRepairs = parseInt(completedResult.rows[0].count) || 0;
    console.log('✅ Completed repairs:', completedRepairs);

    // Get repairs by month for the last 6 months
    const repairsByMonth = await pool.query(`
      SELECT 
        DATE_PART('month', reported_at) as month_num,
        COUNT(*) as count
      FROM reports
      WHERE reported_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_PART('month', reported_at)
      ORDER BY month_num
    `);
    console.log('✅ Repairs by month:', repairsByMonth.rows);

    // Get reports by status
    const reportsByStatusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM reports
      GROUP BY status
    `);
    console.log('✅ Reports by status:', reportsByStatusResult.rows);

    // Get assets by category
    const assetsByCategoryResult = await pool.query(`
      SELECT c.name, COUNT(*) as count
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 10
    `);
    console.log('✅ Assets by category:', assetsByCategoryResult.rows);

    // Get recent activities
    const recentActivities = await pool.query(`
      (
        SELECT 
          'report' as type,
          'รายงานปัญหาใหม่' as activity_title,
          r.title as description,
          r.reported_at as activity_time,
          'blue' as color
        FROM reports r
        ORDER BY r.reported_at DESC
        LIMIT 3
      )
      UNION ALL
      (
        SELECT 
          'repair' as type,
          'งานซ่อมเสร็จสิ้น' as activity_title,
          rp.title as description,
          rp.updated_at as activity_time,
          'green' as color
        FROM repairs rp
        WHERE rp.status = 'COMPLETED'
        ORDER BY rp.updated_at DESC
        LIMIT 3
      )
      ORDER BY activity_time DESC
      LIMIT 6
    `);
    console.log('✅ Recent activities:', recentActivities.rows);

    // Get reports by village
    const reportsByVillage = await pool.query(`
      SELECT 
        COALESCE(v.name, 'ไม่ระบุหมู่บ้าน') as village_name,
        COUNT(*) as count
      FROM reports r
      LEFT JOIN villages v ON r.village_id = v.id
      GROUP BY v.name
      ORDER BY count DESC
      LIMIT 10
    `);
    console.log('✅ Reports by village:', reportsByVillage.rows);

    // Format data for chart
    // Get last 6 months from current month
    const currentMonth = new Date().getMonth(); // 0-11
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    // Create array of last 6 months (including current month)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(monthNames[monthIndex]);
    }
    
    // Map database results to month names
    const repairsByMonthFormatted = last6Months.map((month, index) => {
      const targetMonthNum = (currentMonth - 5 + index + 12) % 12 + 1; // 1-12
      const found = repairsByMonth.rows.find(r => parseInt(r.month_num) === targetMonthNum);
      return {
        month,
        count: found ? parseInt(found.count) : 0
      };
    });
    console.log('✅ Formatted repairs by month:', repairsByMonthFormatted);

    const reportsByStatusFormatted = {};
    reportsByStatusResult.rows.forEach(row => {
      const thaiLabel = REPORT_STATUS_LABELS[row.status] || row.status;
      reportsByStatusFormatted[thaiLabel] = parseInt(row.count);
    });

    const assetsByCategoryFormatted = {};
    assetsByCategoryResult.rows.forEach(row => {
      assetsByCategoryFormatted[row.name] = parseInt(row.count);
    });
    console.log('✅ Formatted data:', {
      totalAssets,
      totalReports,
      pendingRepairs,
      completedRepairs
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        totalReports,
        pendingRepairs,
        completedRepairs,
        repairsByMonth: repairsByMonthFormatted,
        reportsByStatus: reportsByStatusFormatted,
        assetsByCategory: assetsByCategoryFormatted,
        reportsByVillage: reportsByVillage.rows.map(row => ({
          village: row.village_name,
          count: parseInt(row.count)
        })),
        recentActivities: recentActivities.rows.map(activity => ({
          type: activity.type,
          title: activity.activity_title,
          description: activity.description,
          time: activity.activity_time,
          color: activity.color
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: `Failed to fetch dashboard statistics: ${error.message}` 
    });
  }
}

