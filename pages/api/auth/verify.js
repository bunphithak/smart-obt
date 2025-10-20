// Verify Token API
const { verifyToken, extractToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    res.status(200).json({
      success: true,
      data: {
        user: decoded
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message
    });
  }
}
