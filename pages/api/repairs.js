// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { id, reportId, status, assignedTo } = req.query;
        
        // TODO: Implement database query
        const mockRepairs = [
          {
            id: 1,
            reportId: 1,
            title: 'ซ่อมขาโต๊ะหัก',
            description: 'เปลี่ยนขาโต๊ะใหม่',
            status: 'กำลังดำเนินการ',
            priority: 'สูง',
            assignedTo: 'ช่าง A',
            estimatedCost: 500,
            actualCost: null,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            startDate: new Date().toISOString(),
            completedDate: null,
            notes: 'ต้องสั่งขาโต๊ะใหม่จากผู้ผลิต',
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            reportId: 2,
            title: 'ซ่อมเครื่องปรับอากาศ',
            description: 'ทำความสะอาดและเติมน้ำยาแอร์',
            status: 'รอดำเนินการ',
            priority: 'ปานกลาง',
            assignedTo: 'ช่าง B',
            estimatedCost: 800,
            actualCost: null,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
            startDate: null,
            completedDate: null,
            notes: '',
            images: [],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        // If requesting specific repair by id
        if (id) {
          const repair = mockRepairs.find(r => r.id === parseInt(id));
          if (repair) {
            res.status(200).json({ success: true, data: [repair] });
          } else {
            res.status(404).json({ success: false, error: 'ไม่พบข้อมูลงานซ่อม' });
          }
          return;
        }

        // Filter repairs based on query parameters
        let filteredRepairs = mockRepairs;
        
        if (status) {
          filteredRepairs = filteredRepairs.filter(r => r.status === status);
        }
        
        if (assignedTo) {
          filteredRepairs = filteredRepairs.filter(r => 
            r.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
          );
        }

        res.status(200).json({ success: true, data: filteredRepairs });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { 
          reportId, 
          title, 
          description, 
          assignedTo, 
          estimatedCost, 
          priority 
        } = req.body;

        if (!reportId || !title || !assignedTo) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
          });
        }

        // TODO: Insert into database and update report status
        const newRepair = {
          id: Date.now(),
          reportId,
          title,
          description,
          assignedTo,
          estimatedCost: estimatedCost || 0,
          actualCost: null,
          priority: priority || 'ปานกลาง',
          status: 'รอดำเนินการ',
          startDate: new Date().toISOString(),
          completedDate: null,
          notes: '',
          images: []
        };

        res.status(201).json({ success: true, data: newRepair });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { 
          id, 
          title,
          description,
          assignedTo,
          priority,
          estimatedCost,
          actualCost,
          dueDate,
          completedDate,
          status,
          notes
        } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของงานซ่อม' 
          });
        }

        // TODO: Update database
        // For now, just return success
        console.log('Updating repair:', { id, title, description, assignedTo, priority, estimatedCost, actualCost, dueDate, completedDate, status, notes });
        
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตงานซ่อมสำเร็จ',
          data: {
            id: parseInt(id),
            title,
            description,
            assignedTo,
            priority,
            estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
            actualCost: actualCost ? parseFloat(actualCost) : null,
            dueDate,
            completedDate,
            status,
            notes,
            updatedAt: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของงานซ่อม' 
          });
        }

        // TODO: Delete from database
        res.status(200).json({ 
          success: true, 
          message: 'ลบงานซ่อมสำเร็จ' 
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

