// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { role, villageId } = req.query;
        
        // TODO: Implement database query (don't return passwords)
        const mockUsers = [
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            fullName: 'ผู้ดูแลระบบ',
            role: 'admin',
            villageId: null,
            phone: '0812345678',
            status: 'active',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            username: 'user1',
            email: 'user1@example.com',
            fullName: 'นาย ก',
            role: 'user',
            villageId: 1,
            phone: '0823456789',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        ];

        res.status(200).json({ success: true, data: mockUsers });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const { 
          username, 
          password, 
          email, 
          fullName, 
          role, 
          villageId,
          phone 
        } = req.body;

        if (!username || !password || !email || !fullName || !role) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
          });
        }

        // TODO: Hash password and insert into database
        // const hashedPassword = await bcrypt.hash(password, 10);
        // const result = await db.query('INSERT INTO users ...');

        const newUser = {
          id: Date.now(),
          username,
          email,
          fullName,
          role,
          villageId: villageId || null,
          phone: phone || null,
          status: 'active',
          createdAt: new Date().toISOString()
        };

        res.status(201).json({ success: true, data: newUser });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id, email, fullName, role, villageId, phone, status } = req.body;

        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ไม่พบ ID ของผู้ใช้' 
          });
        }

        // TODO: Update database (don't allow username change)
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' 
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
            error: 'ไม่พบ ID ของผู้ใช้' 
          });
        }

        // TODO: Soft delete or hard delete from database
        res.status(200).json({ 
          success: true, 
          message: 'ลบผู้ใช้สำเร็จ' 
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

