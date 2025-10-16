// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Get all assets or filter by query params
        const { villageId, status } = req.query;
        
        // TODO: Implement database query
        // const assets = await db.query('SELECT * FROM assets WHERE ...');
        
        const mockAssets = [
          {
            id: 1,
            name: 'โต๊ะทำงาน',
            code: 'AST-001',
            category: 'เฟอร์นิเจอร์',
            status: 'ใช้งานได้',
            villageId: 1,
            qrCode: '/qr/AST-001.png',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'เครื่องปรับอากาศ',
            code: 'AST-002',
            category: 'อุปกรณ์ไฟฟ้า',
            status: 'ใช้งานได้',
            villageId: 1,
            qrCode: '/qr/AST-002.png',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            name: 'คอมพิวเตอร์',
            code: 'AST-003',
            category: 'คอมพิวเตอร์',
            status: 'ชำรุด',
            villageId: 2,
            qrCode: '/qr/AST-003.png',
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            name: 'รถยนต์',
            code: 'AST-004',
            category: 'ยานพาหนะ',
            status: 'ใช้งานได้',
            villageId: 1,
            qrCode: '/qr/AST-004.png',
            createdAt: new Date().toISOString()
          },
          {
            id: 5,
            name: 'เครื่องพิมพ์',
            code: 'AST-005',
            category: 'คอมพิวเตอร์',
            status: 'กำลังซ่อม',
            villageId: 2,
            qrCode: '/qr/AST-005.png',
            createdAt: new Date().toISOString()
          }
        ];

        res.status(200).json({ success: true, data: mockAssets });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { name, code, category, villageId, description } = req.body;

        // Validate required fields
        if (!name || !code || !villageId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
          });
        }

        // TODO: Insert into database and generate QR code
        // const result = await db.query('INSERT INTO assets ...');
        // await generateQRCode(code);

        const newAsset = {
          id: Date.now(),
          name,
          code,
          category,
          villageId,
          description,
          status: 'ใช้งานได้',
          qrCode: `/qr/${code}.png`,
          createdAt: new Date().toISOString()
        };

        res.status(201).json({ success: true, data: newAsset });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, name, category, status, description } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของทรัพย์สิน' 
          });
        }

        // TODO: Update database
        // await db.query('UPDATE assets SET ... WHERE id = ?', [id]);

        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลสำเร็จ' 
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
            error: 'ไม่พบ ID ของทรัพย์สิน' 
          });
        }

        // TODO: Delete from database
        // await db.query('DELETE FROM assets WHERE id = ?', [id]);

        res.status(200).json({ 
          success: true, 
          message: 'ลบข้อมูลสำเร็จ' 
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

