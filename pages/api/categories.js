// import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  // Mock categories data
  const mockCategories = [
    {
      id: 1,
      name: 'เฟอร์นิเจอร์',
      description: 'โต๊ะ เก้าอี้ ตู้ และเฟอร์นิเจอร์อื่นๆ',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'อุปกรณ์ไฟฟ้า',
      description: 'เครื่องปรับอากาศ พัดลม ไฟส่องสว่าง',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'เครื่องใช้ไฟฟ้า',
      description: 'ตู้เย็น เครื่องซักผ้า เตาไฟฟ้า',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'คอมพิวเตอร์',
      description: 'คอมพิวเตอร์ โน๊ตบุ๊ค เครื่องพิมพ์',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'ยานพาหนะ',
      description: 'รถยนต์ รถจักรยานยนต์ จักรยาน',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 6,
      name: 'อุปกรณ์สำนักงาน',
      description: 'เครื่องถ่ายเอกสาร เครื่องแฟกซ์',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 7,
      name: 'อุปกรณ์อิเล็กทรอนิกส์',
      description: 'โทรทัศน์ เครื่องเสียง กล้องถ่ายรูป',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 8,
      name: 'อื่นๆ',
      description: 'อุปกรณ์และเครื่องมืออื่นๆ',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  switch (method) {
    case 'GET':
      try {
        const { id } = req.query;
        
        if (id) {
          const category = mockCategories.find(c => c.id === parseInt(id));
          if (!category) {
            return res.status(404).json({ 
              success: false, 
              error: 'ไม่พบข้อมูลหมวดหมู่' 
            });
          }
          return res.status(200).json({ success: true, data: category });
        }

        res.status(200).json({ success: true, data: mockCategories });
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'POST':
      try {
        const { name, description, isActive } = req.body;
        
        // Validate required fields
        if (!name) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกชื่อหมวดหมู่' 
          });
        }

        // Check if category name already exists
        const existingCategory = mockCategories.find(c => 
          c.name.toLowerCase() === name.toLowerCase()
        );
        if (existingCategory) {
          return res.status(400).json({ 
            success: false, 
            error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' 
          });
        }
        
        // TODO: Implement database insert
        // const result = await db.query('INSERT INTO categories (...) VALUES (...)');
        
        const newCategory = {
          id: Math.max(...mockCategories.map(c => c.id)) + 1,
          name: name.trim(),
          description: description?.trim() || '',
          isActive: isActive !== undefined ? isActive : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        res.status(201).json({ success: true, data: newCategory });
      } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      try {
        const { id, name, description, isActive } = req.body;
        
        // Validate required fields
        if (!id || !name) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (id, name)' 
          });
        }

        // Check if category exists
        const existingCategory = mockCategories.find(c => c.id === parseInt(id));
        if (!existingCategory) {
          return res.status(404).json({ 
            success: false, 
            error: 'ไม่พบข้อมูลหมวดหมู่' 
          });
        }

        // Check if new name conflicts with other categories
        const nameConflict = mockCategories.find(c => 
          c.id !== parseInt(id) && 
          c.name.toLowerCase() === name.toLowerCase()
        );
        if (nameConflict) {
          return res.status(400).json({ 
            success: false, 
            error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' 
          });
        }
        
        // TODO: Implement database update
        // const result = await db.query('UPDATE categories SET ... WHERE id = ?', [id]);
        
        const updatedCategory = {
          ...existingCategory,
          name: name.trim(),
          description: description?.trim() || '',
          isActive: isActive !== undefined ? isActive : existingCategory.isActive,
          updatedAt: new Date().toISOString()
        };
        
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลหมวดหมู่สำเร็จ', 
          data: updatedCategory 
        });
      } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของหมวดหมู่ที่ต้องการลบ' 
          });
        }

        // Check if category exists
        const existingCategory = mockCategories.find(c => c.id === parseInt(id));
        if (!existingCategory) {
          return res.status(404).json({ 
            success: false, 
            error: 'ไม่พบข้อมูลหมวดหมู่' 
          });
        }

        // TODO: Check if category is being used by assets
        // const assetsUsingCategory = await db.query('SELECT COUNT(*) FROM assets WHERE categoryId = ?', [id]);
        // if (assetsUsingCategory[0].count > 0) {
        //   return res.status(400).json({ 
        //     success: false, 
        //     error: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีทรัพย์สินใช้งานอยู่' 
        //   });
        // }
        
        // TODO: Implement database delete
        // const result = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบข้อมูลหมวดหมู่สำเร็จ' 
        });
      } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
  }
}
