// Logout API
const { extractToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const token = extractToken(req);

    // TODO: If implementing token blacklist, add token to blacklist here
    // await redis.set(`blacklist:${token}`, 1, 'EX', 7 * 24 * 60 * 60);

    res.status(200).json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });

  } catch (error) {
    console.error('Logout API Error:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการออกจากระบบ',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
