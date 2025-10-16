// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { id } = req.query;
        
        // TODO: Implement database query
        const mockVillages = [
          {
            id: 1,
            name: 'หมู่ 1 บ้านตัวอย่าง',
            code: 'V001',
            address: '123 ถนนตัวอย่าง ตำบล อำเภอ จังหวัด',
            contactPerson: 'นายกำนัน',
            contactPhone: '0812345678',
            totalAssets: 50,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'หมู่ 2 บ้านทดสอบ',
            code: 'V002',
            address: '456 ถนนทดสอบ ตำบล อำเภอ จังหวัด',
            contactPerson: 'นายผู้ใหญ่',
            contactPhone: '0823456789',
            totalAssets: 35,
            createdAt: new Date().toISOString()
          }
        ];

        if (id) {
          const village = mockVillages.find(v => v.id === parseInt(id));
          if (!village) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลหมู่บ้าน' 
            });
          }
          return res.status(200).json({ success: true, data: village });
        }

        res.status(200).json({ success: true, data: mockVillages });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { 
          name, 
          code, 
          address, 
          contactPerson, 
          contactPhone 
        } = req.body;

        if (!name || !code) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
          });
        }

        // TODO: Insert into database
        const newVillage = {
          id: Date.now(),
          name,
          code,
          address: address || '',
          contactPerson: contactPerson || '',
          contactPhone: contactPhone || '',
          totalAssets: 0,
          createdAt: new Date().toISOString()
        };

        res.status(201).json({ success: true, data: newVillage });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { 
          id
          // name, 
          // address, 
          // contactPerson, 
          // contactPhone 
        } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของหมู่บ้าน' 
          });
        }

        // TODO: Update database with name, address, contactPerson, contactPhone
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลหมู่บ้านสำเร็จ' 
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
            error: 'ไม่พบ ID ของหมู่บ้าน' 
          });
        }

        // TODO: Check if village has assets before deleting
        // TODO: Delete from database
        res.status(200).json({ 
          success: true, 
          message: 'ลบหมู่บ้านสำเร็จ' 
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

