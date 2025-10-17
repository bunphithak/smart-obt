// For Vercel deployment: File uploads should use cloud storage (Cloudinary, S3, etc.)
// This API uses bodyParser for simple form data

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id, status, actualCost, completedDate, notes } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'ไม่พบ ID ของงานซ่อม' 
      });
    }

    // Note: For Vercel deployment, file uploads should use cloud storage
    // Images can be sent as URLs or base64 strings in the request body
    const afterImages = [];

    console.log('Completing repair:', {
      id,
      status,
      actualCost,
      completedDate,
      notes
    });

    // TODO: Update database with after images
    // const result = await db.query(
    //   'UPDATE repairs SET status = ?, actual_cost = ?, completed_date = ?, notes = ?, after_images = ? WHERE id = ?',
    //   [status, actualCost, completedDate, notes, JSON.stringify(afterImages), id]
    // );

    res.status(200).json({ 
      success: true, 
      message: 'ปิดงานสำเร็จ',
      data: {
        id: parseInt(id),
        status,
        actualCost: parseFloat(actualCost),
        completedDate,
        notes,
        afterImages
      }
    });
  } catch (error) {
    console.error('Error completing repair:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

