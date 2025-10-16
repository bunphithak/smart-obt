// API for tracking report status by ticket ID

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุรหัสติดตาม'
      });
    }

    // TODO: Query from database by ticketId
    // const report = await db.query('SELECT * FROM reports WHERE ticketId = ?', [ticketId]);
    
    // Mock data for demonstration
    const mockReport = {
      id: 1,
      ticketId: ticketId,
      assetId: 1,
      assetName: 'โต๊ะทำงาน',
      assetCode: 'AST-001',
      title: 'ขาโต๊ะหัก',
      description: 'ขาโต๊ะหักด้านหน้าซ้าย',
      status: 'กำลังดำเนินการ',
      priority: 'สูง',
      reportedBy: 'นาย ก',
      reporterPhone: '0812345678',
      images: [],
      location: {
        latitude: 13.7563,
        longitude: 100.5018
      },
      reportedAt: new Date().toISOString(),
      rating: null,
      feedback: null,
      repair: {
        id: 1,
        assignedTo: 'ช่าง A',
        status: 'กำลังดำเนินการ',
        startDate: new Date().toISOString(),
        completedDate: null,
        afterImages: []
      }
    };

    res.status(200).json({ success: true, data: mockReport });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

