# Smart OBT - ระบบจัดการทรัพย์สินและงานซ่อมบำรุง

ระบบจัดการทรัพย์สินขององค์การบริหารส่วนตำบล (OBT) พร้อมฟีเจอร์ QR Code, การแจ้งปัญหา และการจัดการงานซ่อม

## ฟีเจอร์หลัก

- 📦 **จัดการทรัพย์สิน**: เพิ่ม แก้ไข ลบ และติดตามทรัพย์สิน พร้อม QR Code
- 📋 **รายงานปัญหา**: แจ้งปัญหาทรัพย์สินที่ชำรุด พร้อมแนบรูปภาพ
- 🔧 **จัดการงานซ่อม**: มอบหมายงาน ติดตามสถานะ และบันทึกค่าใช้จ่าย
- 🏘️ **จัดการหมู่บ้าน**: บริหารจัดการข้อมูลหมู่บ้านต่างๆ
- 👥 **จัดการผู้ใช้**: ระบบสิทธิ์การใช้งาน (Admin, Technician, User)
- 📊 **Dashboard**: สรุปสถิติและข้อมูลภาพรวม

## โครงสร้างโปรเจค

\`\`\`
smart-obt/
├── pages/                 # หน้าเว็บหลัก และ Next.js Routing
│   ├── index.js          # หน้า Home / Dashboard
│   ├── _app.js           # Global App wrapper
│   ├── _document.js      # Customize HTML template
│   └── api/              # API routes สำหรับ Backend
│       ├── assets.js     # CRUD Asset / QR Code
│       ├── reports.js    # CRUD Report / แจ้งปัญหา
│       ├── repairs.js    # CRUD งานซ่อม
│       ├── users.js      # CRUD User Management
│       └── villages.js   # CRUD หมู่บ้าน
│
├── components/           # UI Component
│   ├── AssetForm.js
│   ├── ReportForm.js
│   ├── RepairTable.js
│   ├── UserForm.js
│   └── DashboardChart.js
│
├── styles/               # CSS / Tailwind
│   ├── globals.css
│   └── tailwind.css
│
├── public/               # รูปภาพ, QR Code, Icon
│   ├── images/
│   └── qr/
│
├── lib/                  # Library / helper functions
│   └── db.js            # Database connection
│
├── package.json
├── tailwind.config.js
└── next.config.js
\`\`\`

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4
- **Database**: MySQL / PostgreSQL / MongoDB (เลือกได้)
- **Language**: JavaScript / TypeScript

## การติดตั้ง

### ขั้นตอนที่ 1: Clone โปรเจค

\`\`\`bash
git clone <repository-url>
cd smart-obt
\`\`\`

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

\`\`\`bash
npm install
\`\`\`

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

คัดลอกไฟล์ \`.env.example\` เป็น \`.env.local\` และแก้ไขค่าต่างๆ:

\`\`\`bash
cp .env.example .env.local
\`\`\`

แก้ไขค่าในไฟล์ \`.env.local\`:
\`\`\`env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=smart_obt
\`\`\`

### ขั้นตอนที่ 4: ตั้งค่าฐานข้อมูล

#### สำหรับ MySQL/PostgreSQL:

1. สร้างฐานข้อมูล:
\`\`\`sql
CREATE DATABASE smart_obt;
\`\`\`

2. รัน SQL schema จากไฟล์ \`lib/db.js\` (ดู \`initSQL\` constant)

#### สำหรับ MongoDB:

ติดตั้ง mongoose:
\`\`\`bash
npm install mongoose
\`\`\`

### ขั้นตอนที่ 5: รันโปรเจค

Development mode:
\`\`\`bash
npm run dev
\`\`\`

Production build:
\`\`\`bash
npm run build
npm start
\`\`\`

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## การใช้งาน

### ผู้ดูแลระบบ (Admin)
- สามารถเข้าถึงทุกฟีเจอร์
- จัดการผู้ใช้และหมู่บ้าน
- ดูรายงานและสถิติทั้งหมด

### ช่างซ่อม (Technician)
- รับงานซ่อมที่ได้รับมอบหมาย
- อัปเดตสถานะงานซ่อม
- บันทึกค่าใช้จ่ายและรายละเอียด

### ผู้ใช้งานทั่วไป (User)
- แจ้งปัญหาทรัพย์สิน
- ติดตามสถานะการแจ้งปัญหา
- สแกน QR Code เพื่อดูข้อมูลทรัพย์สิน

## API Endpoints

### Assets
- \`GET /api/assets\` - ดึงรายการทรัพย์สินทั้งหมด
- \`POST /api/assets\` - เพิ่มทรัพย์สินใหม่
- \`PUT /api/assets\` - แก้ไขข้อมูลทรัพย์สิน
- \`DELETE /api/assets?id=:id\` - ลบทรัพย์สิน

### Reports
- \`GET /api/reports\` - ดึงรายการแจ้งปัญหา
- \`POST /api/reports\` - แจ้งปัญหาใหม่
- \`PUT /api/reports\` - อัปเดตสถานะรายงาน
- \`DELETE /api/reports?id=:id\` - ลบรายงาน

### Repairs
- \`GET /api/repairs\` - ดึงรายการงานซ่อม
- \`POST /api/repairs\` - สร้างงานซ่อมใหม่
- \`PUT /api/repairs\` - อัปเดตงานซ่อม
- \`DELETE /api/repairs?id=:id\` - ลบงานซ่อม

### Users
- \`GET /api/users\` - ดึงรายการผู้ใช้
- \`POST /api/users\` - เพิ่มผู้ใช้ใหม่
- \`PUT /api/users\` - แก้ไขข้อมูลผู้ใช้
- \`DELETE /api/users?id=:id\` - ลบผู้ใช้

### Villages
- \`GET /api/villages\` - ดึงรายการหมู่บ้าน
- \`POST /api/villages\` - เพิ่มหมู่บ้านใหม่
- \`PUT /api/villages\` - แก้ไขข้อมูลหมู่บ้าน
- \`DELETE /api/villages?id=:id\` - ลบหมู่บ้าน

## การพัฒนาต่อยอด

### สิ่งที่ควรทำต่อ:

1. **Authentication & Authorization**
   - ติดตั้ง NextAuth.js หรือ JWT
   - ป้องกัน API routes ด้วย middleware

2. **QR Code Generation**
   - ติดตั้ง \`qrcode\` package
   - สร้างฟังก์ชันสำหรับสร้าง QR Code อัตโนมัติ

3. **File Upload**
   - ติดตั้ง \`multer\` หรือใช้ cloud storage (AWS S3, Cloudinary)
   - จัดการการอัปโหลดรูปภาพ

4. **Database Implementation**
   - เลือก database ที่ต้องการใช้
   - แก้ไขไฟล์ \`lib/db.js\`
   - เชื่อมต่อกับ database จริง

5. **Notifications**
   - ส่ง email แจ้งเตือนเมื่อมีรายงานใหม่
   - Line Notify สำหรับแจ้งเตือนแบบ real-time

6. **Reports & Export**
   - สร้างรายงาน PDF
   - Export ข้อมูลเป็น Excel

## License

MIT

## ติดต่อ

หากมีคำถามหรือข้อเสนอแนะ กรุณาติดต่อ [your-email@example.com](mailto:your-email@example.com)
