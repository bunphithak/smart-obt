// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { reportId, status, assignedTo } = req.query;
        
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
            startDate: new Date().toISOString(),
            completedDate: null,
            notes: '',
            images: []
          }
        ];

        res.status(200).json({ success: true, data: mockRepairs });
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
          status, 
          actualCost, 
          completedDate, 
          notes,
          images 
        } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของงานซ่อม' 
          });
        }

        // TODO: Update database
        // If status is 'เสร็จสิ้น', update completedDate and report status
        
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตงานซ่อมสำเร็จ' 
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

