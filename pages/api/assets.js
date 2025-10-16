// import { db } from '../../lib/db';

// Generate mock assets for testing
const generateMockAssets = () => {
  const categories = ['เฟอร์นิเจอร์', 'อุปกรณ์ไฟฟ้า', 'เครื่องใช้ไฟฟ้า', 'คอมพิวเตอร์', 'ยานพาหนะ', 'อุปกรณ์สำนักงาน', 'อุปกรณ์อิเล็กทรอนิกส์', 'อื่นๆ'];
  const statuses = ['ใช้งานได้', 'ชำรุด', 'กำลังซ่อม', 'เสร็จสิ้น'];
  const locations = ['สำนักงานใหญ่', 'ห้องประชุม', 'ห้องทำงาน', 'ห้องเอกสาร', 'ห้องพักพนักงาน', 'ลานจอดรถ', 'คลังสินค้า', 'ห้องครัว', 'ห้องน้ำ', 'ระเบียง'];
  
  const assets = [];
  let id = 1;
  
  // Generate assets for each village (1-5)
  for (let villageId = 1; villageId <= 5; villageId++) {
    const assetsPerVillage = villageId === 1 ? 85 : villageId === 2 ? 120 : villageId === 3 ? 95 : villageId === 4 ? 110 : 75;
    
    for (let i = 0; i < assetsPerVillage; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Generate random value based on category
      let value = 0;
      switch (category) {
        case 'เฟอร์นิเจอร์':
          value = Math.floor(Math.random() * 15000) + 1000;
          break;
        case 'อุปกรณ์ไฟฟ้า':
        case 'เครื่องใช้ไฟฟ้า':
          value = Math.floor(Math.random() * 50000) + 5000;
          break;
        case 'คอมพิวเตอร์':
        case 'อุปกรณ์อิเล็กทรอนิกส์':
          value = Math.floor(Math.random() * 100000) + 10000;
          break;
        case 'ยานพาหนะ':
          value = Math.floor(Math.random() * 800000) + 200000;
          break;
        default:
          value = Math.floor(Math.random() * 20000) + 500;
      }
      
      assets.push({
        id: id++,
        name: generateAssetName(category, i + 1),
        code: `AST-${String(id - 1).padStart(3, '0')}`,
        category,
        status,
        villageId,
        qrCode: `/qr/AST-${String(id - 1).padStart(3, '0')}.png`,
        value,
        purchaseDate: generateRandomDate(),
        locationName: location,
        locationAddress: `${(Math.random() * 0.1 + 13.7).toFixed(6)}, ${(Math.random() * 0.1 + 100.4).toFixed(6)}`,
        latitude: Math.random() * 0.1 + 13.7,
        longitude: Math.random() * 0.1 + 100.4,
        description: `รายละเอียดของ${generateAssetName(category, i + 1)}`,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return assets;
};

const generateAssetName = (category, index) => {
  const names = {
    'เฟอร์นิเจอร์': ['โต๊ะทำงาน', 'เก้าอี้', 'ตู้เอกสาร', 'ชั้นหนังสือ', 'โซฟา', 'โต๊ะประชุม', 'ชั้นวางของ', 'ตู้เสื้อผ้า'],
    'อุปกรณ์ไฟฟ้า': ['เครื่องปรับอากาศ', 'พัดลม', 'ไฟส่องสว่าง', 'เครื่องทำน้ำอุ่น', 'เครื่องกรองน้ำ', 'หม้อหุงข้าว', 'ไมโครเวฟ'],
    'เครื่องใช้ไฟฟ้า': ['ตู้เย็น', 'เครื่องซักผ้า', 'เตาไฟฟ้า', 'เครื่องเป่าผม', 'เครื่องดูดฝุ่น', 'เครื่องปั่นน้ำ'],
    'คอมพิวเตอร์': ['คอมพิวเตอร์', 'โน๊ตบุ๊ค', 'เครื่องพิมพ์', 'สแกนเนอร์', 'จอมอนิเตอร์', 'คีย์บอร์ด', 'เมาส์', 'ลำโพง'],
    'ยานพาหนะ': ['รถยนต์', 'รถจักรยานยนต์', 'จักรยาน', 'รถเข็น', 'รถยก'],
    'อุปกรณ์สำนักงาน': ['เครื่องถ่ายเอกสาร', 'เครื่องแฟกซ์', 'เครื่องเย็บกระดาษ', 'เครื่องเจาะกระดาษ', 'กระดาษ A4'],
    'อุปกรณ์อิเล็กทรอนิกส์': ['โทรทัศน์', 'เครื่องเสียง', 'กล้องถ่ายรูป', 'เครื่องบันทึกเสียง', 'แท็บเล็ต'],
    'อื่นๆ': ['เครื่องมือช่าง', 'อุปกรณ์ทำความสะอาด', 'เครื่องมือทำสวน', 'อุปกรณ์กีฬา', 'เครื่องมือแพทย์']
  };
  
  const categoryNames = names[category] || ['อุปกรณ์ทั่วไป'];
  return `${categoryNames[index % categoryNames.length]} ${Math.floor(index / categoryNames.length) + 1}`;
};

const generateRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Get all assets or filter by query params
        const { villageId, status } = req.query;
        
        // TODO: Implement database query
        // const assets = await db.query('SELECT * FROM assets WHERE ...');
        
        const mockAssets = generateMockAssets();
        
        // Filter by villageId if provided
        let filteredAssets = mockAssets;
        if (villageId) {
          filteredAssets = filteredAssets.filter(asset => asset.villageId === parseInt(villageId));
        }
        
        // Filter by status if provided
        if (status) {
          filteredAssets = filteredAssets.filter(asset => asset.status === status);
        }
        
        res.status(200).json({ 
          success: true, 
          data: filteredAssets,
          total: filteredAssets.length
        });
      } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'POST':
      try {
        const { name, code, category, villageId, description, status, value, purchaseDate, locationName, locationAddress, latitude, longitude } = req.body;
        
        // Validate required fields
        if (!name || !code || !category || !villageId) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (name, code, category, villageId)' 
          });
        }
        
        // TODO: Implement database insert
        // const result = await db.query('INSERT INTO assets (...) VALUES (...)');
        
        const newAsset = {
          id: Date.now(),
          name, code, category,
          villageId: parseInt(villageId),
          description,
          status: status || 'ใช้งานได้',
          value: value ? parseFloat(value) : null,
          purchaseDate: purchaseDate || null,
          locationName: locationName || null,
          locationAddress: locationAddress || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          qrCode: `/qr/${code}.png`,
          createdAt: new Date().toISOString()
        };
        
        res.status(201).json({ success: true, data: newAsset });
      } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      try {
        const { id, name, category, status, description, value, purchaseDate, locationName, locationAddress, latitude, longitude } = req.body;
        
        // Validate required fields
        if (!id || !name || !category) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณากรอกข้อมูลที่จำเป็น (id, name, category)' 
          });
        }
        
        // TODO: Implement database update
        // const result = await db.query('UPDATE assets SET ... WHERE id = ?', [id]);
        
        const updatedAsset = {
          id: parseInt(id),
          name, category, status, description,
          value: value ? parseFloat(value) : null,
          purchaseDate: purchaseDate || null,
          locationName: locationName || null,
          locationAddress: locationAddress || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          updatedAt: new Date().toISOString()
        };
        
        res.status(200).json({ 
          success: true, 
          message: 'อัปเดตข้อมูลสำเร็จ', 
          data: updatedAsset 
        });
      } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'กรุณาระบุ ID ของทรัพย์สินที่ต้องการลบ' 
          });
        }
        
        // TODO: Implement database delete
        // const result = await db.query('DELETE FROM assets WHERE id = ?', [id]);
        
        res.status(200).json({ 
          success: true, 
          message: 'ลบข้อมูลทรัพย์สินสำเร็จ' 
        });
      } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
  }
}