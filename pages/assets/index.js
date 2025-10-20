import { useState, useEffect } from 'react';
import AssetForm from '../../components/AssetForm';
import NextImage from 'next/image';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
// import dynamic from 'next/dynamic';

// Disable SSR for this page to avoid QR code library issues
export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [villages, setVillages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [filter, setFilter] = useState({ category: '', villageId: '', search: '' });
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ type: 'info', title: '', message: '' });
  const [showGeneralQRModal, setShowGeneralQRModal] = useState(false);
  const [generalQRData, setGeneralQRData] = useState(null);
  const [showVillageSelectModal, setShowVillageSelectModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // แสดง 12 รายการต่อหน้า
  // const [selectedVillage, setSelectedVillage] = useState(null);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  useEffect(() => {
    // Only fetch data on client side
    if (typeof window !== 'undefined') {
    fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      const [assetsRes, villagesRes, categoriesRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/villages'),
        fetch('/api/categories')
      ]);

      console.log('Assets response:', assetsRes.status);
      console.log('Villages response:', villagesRes.status);
      console.log('Categories response:', categoriesRes.status);

      const assetsData = await assetsRes.json();
      const villagesData = await villagesRes.json();
      const categoriesData = await categoriesRes.json();

      console.log('Assets data:', assetsData);
      console.log('Villages data:', villagesData);
      console.log('Categories data:', categoriesData);

      if (assetsData.success) setAssets(assetsData.data);
      if (villagesData.success) setVillages(villagesData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      
      setLoading(false);
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError);
      setLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlertData({ type, title, message });
    setShowAlertModal(true);
  };

  const closeAlert = () => {
    setShowAlertModal(false);
  };

  const openVillageSelectModal = () => {
    setShowVillageSelectModal(true);
  };

  const handleVillageSelect = (village) => {
    // setSelectedVillage(village);
    setShowVillageSelectModal(false);
    generateGeneralQRCode(village);
  };

  const generateGeneralQRCode = async (village) => {
    try {
      console.log('Starting general QR code generation for village:', village);
      const QRCode = (await import('qrcode')).default;
      const reportUrl = `${window.location.origin}/report/general?villageId=${village.id}`;
      console.log('Report URL:', reportUrl);
      
      // Generate QR code as canvas for custom label
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for label (400x500px for good quality)
      canvas.width = 400;
      canvas.height = 500;
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate QR Code as Data URL
      console.log('Generating QR code...');
      const qrDataURL = await QRCode.toDataURL(reportUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#7C3AED',
          light: '#FFFFFF'
        },
        width: 250
      });
      console.log('QR code generated successfully');
      
      // Load QR code image
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataURL;
      });
      
      // Draw QR code in center
      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 120;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Draw border around QR code
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
      
      // Set font styles
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Draw title (large)
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText('แจ้งปัญหา', canvas.width / 2, 40);
      
      // Draw village name
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillStyle = '#7C3AED';
      ctx.fillText(village.name, canvas.width / 2, 65);
      
      // Draw subtitle
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('สำหรับปัญหาทั่วไป', canvas.width / 2, 85);
      
      // Draw description
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('ไม่ต้องระบุรหัสทรัพย์สิน', canvas.width / 2, 105);
      
      // Draw scan instruction
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('แสกน QR Code เพื่อแจ้งปัญหา', canvas.width / 2, 400);
      
      // Draw URL
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(`URL: ${reportUrl}`, canvas.width / 2, 420);
      
      // Store QR code data for modal display
      const qrImageData = canvas.toDataURL('image/png', 0.95);
      setGeneralQRData({
        imageData: qrImageData,
        reportUrl: reportUrl,
        village: village
      });
      setShowGeneralQRModal(true);
      
      console.log('QR code generation completed successfully for village:', village.name);
    } catch (error) {
      console.error('Error generating general QR code:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสร้าง QR Code กรุณาลองใหม่');
    }
  };

  const printGeneralQRCode = () => {
    if (!generalQRData) return;
    
    try {
      // Create a temporary div for printing
      const printDiv = document.createElement('div');
      printDiv.innerHTML = `
        <div style="
          width: 400px;
          height: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          margin: 0 auto;
          page-break-inside: avoid;
        ">
          <img src="${generalQRData.imageData}" alt="General QR Code" style="
            width: 100%;
            height: 100%;
            object-fit: contain;
          " />
        </div>
      `;
      
      // Add print styles
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      
      // Add classes and styles
      printDiv.className = 'print-content';
      document.head.appendChild(printStyles);
      document.body.appendChild(printDiv);
      
      // Print
      window.print();
      
      // Clean up
      document.body.removeChild(printDiv);
      document.head.removeChild(printStyles);
      
      showAlert('success', 'พิมพ์สำเร็จ', 'พิมพ์ QR Code ทั่วไปเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error printing QR code:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการพิมพ์ QR Code กรุณาลองใหม่');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const method = editingAsset ? 'PUT' : 'POST';
      const data = editingAsset ? { ...formData, id: editingAsset.id } : formData;

      const res = await fetch('/api/assets', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        showAlert('success', 'สำเร็จ', editingAsset ? 'แก้ไขทรัพย์สินสำเร็จ' : 'เพิ่มทรัพย์สินสำเร็จ');
        setShowForm(false);
        setEditingAsset(null);
        fetchData();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกได้');
      console.error(error);
    }
  };

  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      const res = await fetch(`/api/assets?id=${assetToDelete.id}`, { method: 'DELETE' });
      const result = await res.json();

      setShowConfirmModal(false);

      if (result.success) {
        showAlert('success', 'สำเร็จ', 'ลบทรัพย์สินสำเร็จ');
        fetchData();
      } else {
        showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาด: ' + result.error);
      }
      
      setAssetToDelete(null);
    } catch (error) {
      setShowConfirmModal(false);
      showAlert('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบได้');
      setAssetToDelete(null);
    }
  };

  const downloadQR = async (asset) => {
    try {
      const QRCode = (await import('qrcode')).default;
      const reportUrl = `${window.location.origin}/public?code=${asset.code}`;
      
      // Generate QR code as canvas for custom label
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for label (400x500px for good quality)
      canvas.width = 400;
      canvas.height = 500;
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate QR Code as Data URL
      const qrDataURL = await QRCode.toDataURL(reportUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        },
        width: 250
      });
      
      // Load QR code image
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataURL;
      });
      
      // Draw QR code in center
      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 120;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Draw border around QR code
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
      
      // Set font styles
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Draw asset name (large)
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(asset.name, canvas.width / 2, 50);
      
      // Draw asset code
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`รหัส: ${asset.code}`, canvas.width / 2, 75);
      
      // Draw category
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(`หมวดหมู่: ${asset.category}`, canvas.width / 2, 95);
      
      // Draw scan instruction
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('แสกน QR Code เพื่อแจ้งปัญหาทรัพย์สิน', canvas.width / 2, 400);
      
      // Draw URL
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(`URL: ${reportUrl}`, canvas.width / 2, 420);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-label-${asset.code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 0.95);
      
      showAlert('success', 'ดาวน์โหลดสำเร็จ', `ดาวน์โหลด QR Code Label สำหรับ ${asset.name} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการดาวน์โหลด QR Code กรุณาลองใหม่');
    }
  };

  const printQR = async (asset) => {
    try {
      showAlert('info', 'กำลังพิมพ์', `กำลังสร้าง QR Code สำหรับ ${asset.name}...`);
      
      const QRCode = (await import('qrcode')).default;
      const reportUrl = `${window.location.origin}/public?code=${asset.code}`;
      
      // Generate QR code as canvas for custom label
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size for label (400x500px for good quality)
      canvas.width = 400;
      canvas.height = 500;
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate QR Code as Data URL
      const qrDataURL = await QRCode.toDataURL(reportUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        },
        width: 250
      });
      
      // Load QR code image with proper error handling
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = () => {
          console.log('QR Code image loaded successfully for printing');
          resolve();
        };
        qrImage.onerror = (error) => {
          console.error('Failed to load QR code image:', error);
          reject(error);
        };
        qrImage.src = qrDataURL;
      });
      
      // Draw QR code in center
      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 120;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Draw border around QR code
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
      
      // Set font styles
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Draw asset name (large)
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillText(asset.name, canvas.width / 2, 50);
      
      // Draw asset code
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`รหัส: ${asset.code}`, canvas.width / 2, 75);
      
      // Draw category
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(`หมวดหมู่: ${asset.category}`, canvas.width / 2, 95);
      
      // Draw scan instruction
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('แสกน QR Code เพื่อแจ้งปัญหาทรัพย์สิน', canvas.width / 2, 400);
      
      // Draw URL
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.fillText(`URL: ${reportUrl}`, canvas.width / 2, 420);
      
      // Convert canvas to data URL for printing
      const labelDataURL = canvas.toDataURL('image/png', 0.95);
      
      // Create a temporary div for printing
      const printDiv = document.createElement('div');
      printDiv.innerHTML = `
        <div style="
          width: 400px;
          height: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          margin: 0 auto;
          page-break-inside: avoid;
        ">
          <img src="${labelDataURL}" alt="QR Code Label" style="
            width: 100%;
            height: 100%;
            object-fit: contain;
          " />
        </div>
      `;
      
      // Add print styles
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      
      // Add classes and styles
      printDiv.className = 'print-content';
      document.head.appendChild(printStyles);
      document.body.appendChild(printDiv);
      
      // Print with a small delay to ensure everything is ready
      setTimeout(() => {
        window.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(printDiv);
          document.head.removeChild(printStyles);
          showAlert('success', 'พิมพ์สำเร็จ', `พิมพ์ QR Code Label สำหรับ ${asset.name} เรียบร้อยแล้ว`);
        }, 1000);
      }, 100);
    } catch (error) {
      console.error('Error printing QR code:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการพิมพ์ QR Code กรุณาลองใหม่');
    }
  };

  const printAllQRCodes = async () => {
    if (filteredAssets.length === 0) {
      showAlert('warning', 'ไม่มีข้อมูล', 'ไม่มีทรัพย์สินให้พิมพ์');
      return;
    }

    // Show confirmation modal
    setConfirmData({
      message: `ต้องการพิมพ์ QR Code ทั้งหมด ${filteredAssets.length} รายการใช่หรือไม่?`,
      onConfirm: async () => {
        await executePrintAllQRCodes();
      }
    });
    setShowConfirmModal(true);
  };

  const executePrintAllQRCodes = async () => {

    try {
      // Generate QR codes for all filtered assets using QRCode library directly
      const QRCode = (await import('qrcode')).default;
      const qrCodes = [];
      
      for (const asset of filteredAssets) {
        try {
          // Generate report URL
          const reportUrl = `${window.location.origin}/public?code=${asset.code}`;
          
          // Generate QR code as canvas for custom label
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size for label (400x500px for good quality)
          canvas.width = 400;
          canvas.height = 500;
          
          // Fill white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Generate QR Code as Data URL
          const qrDataURL = await QRCode.toDataURL(reportUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
              dark: '#1E40AF',
              light: '#FFFFFF'
            },
            width: 250
          });
          
          // Load QR code image
          const qrImage = new Image();
          await new Promise((resolve, reject) => {
            qrImage.onload = resolve;
            qrImage.onerror = reject;
            qrImage.src = qrDataURL;
          });
          
          // Draw QR code in center
          const qrSize = 250;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = 120;
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
          
          // Draw border around QR code
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 1;
          ctx.strokeRect(qrX, qrY, qrSize, qrSize);
          
          // Set font styles
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          
          // Draw asset name (large)
          ctx.font = 'bold 24px Arial, sans-serif';
          ctx.fillText(asset.name, canvas.width / 2, 50);
          
          // Draw asset code
          ctx.font = '18px Arial, sans-serif';
          ctx.fillText(`รหัส: ${asset.code}`, canvas.width / 2, 75);
          
          // Draw category
          ctx.font = '16px Arial, sans-serif';
          ctx.fillText(`หมวดหมู่: ${asset.category}`, canvas.width / 2, 95);
          
          // Draw scan instruction
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText('แสกน QR Code เพื่อแจ้งปัญหาทรัพย์สิน', canvas.width / 2, 400);
          
          // Draw URL
          ctx.font = '12px Arial, sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText(`URL: ${reportUrl}`, canvas.width / 2, 420);
          
          // Convert canvas to data URL
          const labelDataURL = canvas.toDataURL('image/png', 0.95);
          qrCodes.push({ asset, qrDataURL: labelDataURL });
        } catch (error) {
          console.error(`Error generating QR code for ${asset.code}:`, error);
          // Continue with other assets even if one fails
        }
      }

      // Create a temporary div for printing all QR codes
      const printDiv = document.createElement('div');
      printDiv.innerHTML = `
        <div style="
          padding: 20px;
          font-family: Arial, sans-serif;
          background: white;
        ">
          <div style="
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          ">
            <h1 style="margin: 0; font-size: 24px; color: #333;">QR Codes สำหรับทรัพย์สิน</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; color: #666;">
              จำนวน: ${filteredAssets.length} รายการ | วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
          ">
            ${qrCodes.map(({ asset, qrDataURL }) => `
              <div style="
                text-align: center;
                border: 2px solid #ddd;
                padding: 15px;
                border-radius: 10px;
                background: white;
                page-break-inside: avoid;
              ">
                <img src="${qrDataURL}" alt="QR Code" style="
                  max-width: 200px;
                  height: auto;
                  display: block;
                  margin: 0 auto;
                " />
                <div style="
                  margin-top: 10px;
                  font-size: 12px;
                  color: #666;
                ">
                  <p style="margin: 2px 0; font-weight: bold;">${asset.name}</p>
                  <p style="margin: 2px 0;">รหัส: ${asset.code}</p>
                  <p style="margin: 2px 0;">หมวดหมู่: ${asset.category}</p>
                  <p style="margin: 2px 0;">สถานะ: ${asset.status}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add print styles
      const printStyles = document.createElement('style');
      printStyles.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-content .qr-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .print-content .qr-container {
            border: 1px solid #ccc !important;
          }
        }
      `;
      
      // Add classes and styles
      printDiv.className = 'print-content';
      document.head.appendChild(printStyles);
      document.body.appendChild(printDiv);
      
      // Print
      window.print();
      
      // Clean up
      document.body.removeChild(printDiv);
      document.head.removeChild(printStyles);
    } catch (error) {
      console.error('Error printing all QR codes:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการพิมพ์ QR Code ทั้งหมด กรุณาลองใหม่');
    }
  };

  const showQRCode = async (asset) => {
    try {
      console.log('Starting QR code generation for:', asset);
      setSelectedAsset(asset);
      setShowQRModal(true);
      setQrCodeData(null); // Clear previous QR code
      
      // Show loading state
      console.log('Generating QR code...');
      
      // Try to generate real QR code
      try {
        console.log('Importing QRCode library...');
        const QRCode = (await import('qrcode')).default;
        console.log('QRCode library imported successfully');
        
        // Generate report URL
        const reportUrl = `${window.location.origin}/public?code=${asset.code}`;
        console.log('Report URL:', reportUrl);
        
        // Generate QR Code as Data URL
        console.log('Generating real QR code...');
        const qrDataURL = await QRCode.toDataURL(reportUrl, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#1E40AF',
            light: '#FFFFFF'
          },
          width: 300
        });
        
        console.log('Real QR Code generated:', qrDataURL.substring(0, 100) + '...');
        setQrCodeData(qrDataURL);
        console.log('Real QR Code data set successfully');
      } catch (qrError) {
        console.error('Real QR code generation failed:', qrError);
        // Keep the test image
      }
    } catch (error) {
      console.error('Error in showQRCode:', error);
      showAlert('error', 'เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการสร้าง QR Code: ' + error.message);
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (filter.category && asset.category !== filter.category) return false;
    if (filter.villageId && asset.villageId !== parseInt(filter.villageId)) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = filteredAssets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ใช้งานได้': return 'bg-green-100 text-green-800';
      case 'ชำรุด': return 'bg-yellow-100 text-yellow-800';
      case 'กำลังซ่อม': return 'bg-blue-100 text-blue-800';
      case 'จำหน่าย': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Page Header - TailAdmin Style */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              จัดการทรัพย์สิน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              จัดการและติดตามทรัพย์สินทั้งหมดในระบบ
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setEditingAsset(null);
              setShowForm(true);
            }}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มทรัพย์สิน
          </button>
            {filteredAssets.length > 0 && (
              <button
                onClick={() => printAllQRCodes()}
                className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                พิมพ์ QR Code ทั้งหมด ({filteredAssets.length})
              </button>
            )}
            <button
              onClick={openVillageSelectModal}
              className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              สร้าง QR Code ทั่วไป
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 ค้นหา (ชื่อ หรือ รหัส)"
            value={filter.search}
            onChange={(e) => handleFilterChange({ ...filter, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.category}
            onChange={(e) => handleFilterChange({ ...filter, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกหมวดหมู่</option>
                   {categories.filter(cat => cat.isActive).map(category => (
                     <option key={category.id} value={category.name}>
                       {category.name}
                     </option>
                   ))}
          </select>
          <select
            value={filter.villageId}
            onChange={(e) => handleFilterChange({ ...filter, villageId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกหมู่บ้าน</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats - TailAdmin Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{assets.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ใช้งานได้</p>
          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {assets.filter(a => a.status === 'ใช้งานได้').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">ชำรุด</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {assets.filter(a => a.status === 'ชำรุด').length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">กำลังซ่อม</p>
          <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
            {assets.filter(a => a.status === 'กำลังซ่อม').length}
          </p>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัส</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อทรัพย์สิน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมวดหมู่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หมู่บ้าน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{asset.code}</td>
                  <td className="px-6 py-4 text-sm">{asset.name}</td>
                  <td className="px-6 py-4 text-sm">{asset.category}</td>
                  <td className="px-6 py-4 text-sm">
                    {villages.find(v => v.id === asset.villageId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showQRCode(asset)}
                        className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50 transition-colors"
                        title="ดู QR Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    <button
                      onClick={() => downloadQR(asset)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="ดาวน์โหลด QR Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => printQR(asset)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                        title="พิมพ์ QR Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingAsset(asset);
                          setShowForm(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="แก้ไข"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(asset)}
                        className="text-red-600 hover:text-red-800"
                        title="ลบ"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </>
              )}
              
              {/* Pages around current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(totalPages, currentPage + 2);
                  return page >= start && page <= end;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              
              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {filteredAssets.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              แสดง {startIndex + 1}-{Math.min(endIndex, filteredAssets.length)} จาก {filteredAssets.length} รายการ
              {totalPages > 1 && ` (หน้า ${currentPage} จาก ${totalPages})`}
            </p>
          </div>
        )}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ไม่พบข้อมูลทรัพย์สิน
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingAsset ? 'แก้ไขทรัพย์สิน' : 'เพิ่มทรัพย์สินใหม่'}
              </h2>
              <AssetForm
                asset={editingAsset}
                villages={villages}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAsset(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedAsset(null);
                    setQrCodeData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedAsset.name}</h3>
                  <p className="text-gray-600">รหัส: {selectedAsset.code}</p>
                  <p className="text-sm text-gray-500">หมวดหมู่: {selectedAsset.category}</p>
                </div>
                
                {qrCodeData ? (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <NextImage 
                      src={qrCodeData} 
                      alt="QR Code" 
                      width={256}
                      height={256}
                      className="w-64 h-64 mx-auto"
                      onLoad={() => console.log('QR Code image loaded successfully')}
                      onError={(e) => console.error('QR Code image failed to load:', e)}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 p-8 rounded-lg">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">กำลังสร้าง QR Code...</p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>📱 แสกน QR Code เพื่อแจ้งปัญหาทรัพย์สิน</p>
                  <p className="text-xs text-gray-500 mt-1">
                    URL: {typeof window !== 'undefined' ? window.location.origin : ''}/report/{selectedAsset.code}
                  </p>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => downloadQR(selectedAsset)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📥 ดาวน์โหลด
                  </button>
                  <button
                    onClick={() => printQR(selectedAsset)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🖨️ พิมพ์
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  alertData.type === 'success' ? 'bg-green-100' :
                  alertData.type === 'error' ? 'bg-red-100' :
                  alertData.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {alertData.type === 'success' && <span className="text-green-600 text-xl">✓</span>}
                  {alertData.type === 'error' && <span className="text-red-600 text-xl">✕</span>}
                  {alertData.type === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
                  {alertData.type === 'info' && <span className="text-blue-600 text-xl">ℹ</span>}
                </div>
                <h3 className={`text-lg font-semibold ${
                  alertData.type === 'success' ? 'text-green-800' :
                  alertData.type === 'error' ? 'text-red-800' :
                  alertData.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alertData.title}
                </h3>
              </div>
              
              {/* Message */}
              <p className={`text-sm ${
                alertData.type === 'success' ? 'text-green-700' :
                alertData.type === 'error' ? 'text-red-700' :
                alertData.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              } mb-6`}>
                {alertData.message}
              </p>
              
              {/* Button */}
              <div className="flex justify-end">
                <button
                  onClick={closeAlert}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                    alertData.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    alertData.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    alertData.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Village Selection Modal */}
      {showVillageSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">เลือกหมู่บ้าน</h3>
                <button
                  onClick={() => setShowVillageSelectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Village List */}
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {villages.map((village) => (
                    <button
                      key={village.id}
                      onClick={() => handleVillageSelect(village)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{village.name}</h4>
                          <p className="text-sm text-gray-500">จำนวนทรัพย์สิน: {assets.filter(a => a.villageId === village.id).length} รายการ</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  เลือกหมู่บ้านเพื่อสร้าง QR Code สำหรับแจ้งปัญหาทั่วไป
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General QR Code Modal */}
      {showGeneralQRModal && generalQRData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">QR Code ทั่วไป</h3>
                  <p className="text-sm text-purple-600 font-medium">{generalQRData.village.name}</p>
                </div>
                <button
                  onClick={() => setShowGeneralQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* QR Code Display */}
              <div className="text-center mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 inline-block">
                  <NextImage
                    src={generalQRData.imageData}
                    alt="General QR Code"
                    width={256}
                    height={320}
                    className="w-64 h-80 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  URL: {generalQRData.reportUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={printGeneralQRCode}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  พิมพ์
                </button>
                <button
                  onClick={() => setShowGeneralQRModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setAssetToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบ"
        message={`คุณต้องการลบทรัพย์สิน "${assetToDelete?.name}" ใช่หรือไม่?`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        type="danger"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
      />
    </div>
  );
}

