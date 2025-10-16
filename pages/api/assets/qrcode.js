// API for generating QR codes for assets

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'POST' && method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    if (method === 'GET') {
      // Get QR code for a specific asset
      const { assetCode } = req.query;

      if (!assetCode) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุรหัสทรัพย์สิน'
        });
      }

      // TODO: Generate QR code
      // const qrCode = await generateQRCode(assetCode);

      res.status(200).json({
        success: true,
        data: {
          assetCode,
          qrCode: `/qr/${assetCode}.png`,
          reportUrl: `${process.env.NEXT_PUBLIC_API_URL}/report/${assetCode}`
        }
      });
    } else if (method === 'POST') {
      // Batch generate QR codes
      const { assetIds } = req.body;

      if (!assetIds || !Array.isArray(assetIds)) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุรายการทรัพย์สิน'
        });
      }

      // TODO: Generate QR codes for multiple assets
      // const results = await generateBatchQRCodes(assetIds);

      res.status(200).json({
        success: true,
        message: `สร้าง QR Code สำเร็จ ${assetIds.length} รายการ`,
        data: {
          generated: assetIds.length
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

