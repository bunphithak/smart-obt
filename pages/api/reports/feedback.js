// API for submitting feedback and rating after repair completion

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const { reportId, rating, feedback } = req.body;

    if (!reportId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุรหัสรายงานและคะแนน'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'คะแนนต้องอยู่ระหว่าง 1-5'
      });
    }

    // TODO: Update database
    // await db.query('UPDATE reports SET rating = ?, feedback = ?, feedbackAt = NOW() WHERE id = ?', 
    //                [rating, feedback, reportId]);

    res.status(200).json({ 
      success: true, 
      message: 'บันทึกความคิดเห็นสำเร็จ',
      data: {
        reportId,
        rating,
        feedback
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

