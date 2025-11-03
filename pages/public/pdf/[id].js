import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function PDFReport() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("🔍 Fetching report for ID:", id);
        const response = await fetch(`/api/reports?id=${id}`);
        console.log("📡 Response status:", response.status);

        const data = await response.json();
        console.log("📄 Response data:", data);

        if (data.success) {
          console.log("✅ Report data:", data.data);
          setReport(data.data);
        } else {
          console.error("❌ Error fetching report:", data.error);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  // Print with settings
  const handlePrint = () => {
    // ตั้งค่า print settings สำหรับ Chrome
    if (window.chrome && window.chrome.printing) {
      const printSettings = {
        pageRanges: "1-9999",
        headerFooterEnabled: false,
        shouldPrintHeaderFooter: false,
        shouldPrintBackgrounds: true,
        marginsType: 1, // 0=default, 1=none, 2=minimum
        scalingMode: 0,
      };

      // ใช้ Chrome printing API
      window.chrome.printing.print(printSettings);
      return;
    }

    // สำหรับ browser อื่นๆ ใช้ CSS และ window.print()
    const style = document.createElement("style");
    style.textContent = `
      @page { 
        margin: 0 !important;
        size: A4;
      }
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        #print-section {
          margin: 0 !important;
          padding: 10mm 20mm 20mm 20mm !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border: 1px solid #000 !important;
          width: 210mm !important;
          height: 297mm !important;
          box-sizing: border-box !important;
        }
      }
    `;
    document.head.appendChild(style);

    // เปิด print dialog
    window.print();
  };

  // ตั้งค่า title
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "รายงานแจ้งซ่อม";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดรายงาน...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">ไม่พบรายงาน</p>
          <p className="text-gray-500 text-sm mt-2">ID: {id}</p>
          <p className="text-gray-500 text-sm">
            Loading: {loading ? "true" : "false"}
          </p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <style>{`
          @page {
            size: A4;
            margin: 2cm;
          }

          /* ซ่อน browser UI elements */
          body {
            margin: 0;
            padding: 0;
          }

          /* CSS สำหรับหน้าจอปกติ */
          @media screen {
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              overflow: auto !important;
              height: auto !important;
              min-height: 100vh !important;
            }
            
            /* แสดง scrollbar */
            ::-webkit-scrollbar {
              width: 8px !important;
              height: 8px !important;
            }
            
            ::-webkit-scrollbar-track {
              background: #f1f1f1 !important;
            }
            
            ::-webkit-scrollbar-thumb {
              background: #888 !important;
              border-radius: 4px !important;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: #555 !important;
            }

            /* รักษา line-height ปกติสำหรับส่วนที่ต้องการ */
            .normal-line-height {
              line-height: 1.6 !important;
            }

            .normal-line-height p {
              line-height: 1.6 !important;
            }

            /* CSS สำหรับ checkbox */
            .checkbox input[type="checkbox"] {
              width: 18px;
              height: 18px;
              margin-right: 8px;
              cursor: pointer;
            }

            .checkbox label {
              font-size: 14px;
              display: flex;
              align-items: center;
              cursor: pointer;
              user-select: none;
            }

            .checkbox label:hover {
              color: #2563eb;
            }

            /* CSS สำหรับกรอบ approve */
            .approve {
              border: 2px solid #000;
              padding: 16px;
              margin: 16px 0;
              border-radius: 8px;
            }
          }

          /* CSS สำหรับ Print - A4 Format */
          #print-section {
            background: white;
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            padding: 10mm 20mm 20mm 20mm; /* top, right, bottom, left */
            margin: 0 auto;
            font-family: "Sarabun", "Tahoma", sans-serif;
            font-size: 14px;
            line-height: 0.8;
            color: #000;
            box-sizing: border-box;
            border: 1px solid #ccc !important; /* เพิ่ม border A4 */
          }


          /* A4 Layout สำหรับหน้าจอ */
          @media screen {
            #print-section {
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              margin: 20px auto;
              border: 1px solid #ccc !important;
            }
          }

          @media print {
            @page {
              margin: 0 !important;
              size: A4 !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-family: "Sarabun", "Tahoma", sans-serif !important;
              font-size: 14px !important;
              line-height: 0.8 !important;
              -webkit-print-color-adjust: exact !important;
            }

            /* ซ่อน header และปุ่ม */
            .no-print,
            .no-print * {
              display: none !important;
            }

            /* แสดงเฉพาะ #print-section */
            #print-section {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 20mm !important;
              box-shadow: none !important;
              background: white !important;
              color: black !important;
              position: static !important;
              box-sizing: border-box !important;
            }

            #print-section * {
              display: block !important;
            }

            #print-section span {
              display: inline !important;
            }

            #print-section div {
              display: block !important;
            }

            #print-section p {
              display: block !important;
            }

            /* รักษา flex layout สำหรับ print */
            #print-section .flex {
              display: flex !important;
            }

            #print-section .justify-end {
              justify-content: flex-end !important;
            }

            #print-section .justify-center {
              justify-content: center !important;
            }

            #print-section .items-center {
              align-items: center !important;
            }

            #print-section .text-center {
              text-align: center !important;
            }

            /* รักษา line-height ปกติสำหรับส่วนที่ต้องการ */
            #print-section .normal-line-height {
              line-height: 1.6 !important;
            }

            #print-section .normal-line-height p {
              line-height: 1.6 !important;
            }

            /* CSS สำหรับ checkbox ใน print */
            #print-section .checkbox input[type="checkbox"] {
              width: 16px !important;
              height: 16px !important;
              margin-right: 8px !important;
            }

            #print-section .checkbox label {
              font-size: 14px !important;
              display: flex !important;
              align-items: center !important;
            }

            /* CSS สำหรับกรอบ approve ใน print */
            #print-section .approve {
              border: 2px solid #000 !important;
              padding: 16px !important;
              margin: 16px 0 !important;
              border-radius: 8px !important;
            }

            /* CSS สำหรับ logo ใน print */
            #print-section img {
              display: block !important;
              margin: 0 auto !important;
              max-width: 96px !important;
              max-height: 96px !important;
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Header - Fixed Position */}
        <div className="no-print bg-white p-4 fixed top-0 left-0 right-0 z-50 shadow-md">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 no-print"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              พิมพ์รายงาน
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 no-print"
            >
              ← ปิดหน้าต่าง
            </button>
          </div>
        </div>
        {/* PDF Content - แสดงทั้งหน้าจอและ Export */}
        <div className="bg-white p-8 pt-20">
          <div className="max-w-4xl mx-auto">
            <div id="print-section" className="print">
              {/* Header */}
              <div className="mb-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <img 
                      src="/images/abt-logo.png" 
                      alt="Logo อบต.ละหาร" 
                      className="w-24 h-24 mx-auto mb-2"
                    />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-center mb-4">
                  คำร้องแจ้งซ่อม/ติดตั้งระบบไฟฟ้า
                </h1>

                <div className="text-right mb-4 normal-line-height">
                  <p>เขียนที่ กองช่าง องค์การบริหารส่วนตำบลละหาร</p>
                  <p>
                    วันที่{" "}
                    {new Date().toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {/* Content */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center">
                  <span className="font-bold mr-4">เรื่อง</span>
                  <span className="mr-4">
                    {report.reportType === "repair"
                      ? "ซ่อมแซมไฟฟ้าสาธารณะ"
                      : "เพิ่มจุดติดตั้งไฟฟ้าสาธารณะ"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-bold mr-4">เรียน</span>
                  <span>นายกองค์การบริหารส่วนตำบลละหาร</span>
                </div>

                <div className="flex items-center">
                  <span className="font-bold mr-4">ข้าพเจ้า</span>
                  <span className="border-b border-black border-dashed px-2 w-full">
                    {report.reportedBy || "ไม่ระบุ"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-bold mr-4">เบอร์โทรศัพท์</span>
                  <span className="border-b border-black border-dashed border-dashed px-2 min-w-[150px]">
                    {report.reporterPhone || "ไม่ระบุ"}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <p className="font-bold mb-4">
                  ข้าพเจ้ามีความประสงค์ขอให้องค์การบริหารส่วนตำบลละหาร
                  ดำเนินการดังนี้
                </p>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {report.reportType === "repair"
                        ? "ซ่อมแซมไฟฟ้าสาธารณะ บริเวณ"
                        : "เพิ่มจุดติดตั้งไฟฟ้าสาธารณะ บริเวณ"}
                    </span>
                    <span className="border-b border-black border-dashed px-2 ml-2 min-w-[400px]">
                      {report.assetCode && report.assetLocation 
                        ? report.assetLocation 
                        : (report.location && typeof report.location === 'string' && !report.location.includes('latitude')
                            ? report.location 
                            : 'ไม่ระบุ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <p className="font-bold mb-4">
                  เนื่องจากได้เกิดการชำรุดกับโดยมีรายละเอียด ดังนี้
                </p>
                <div className="border-b border-black border-dashed px-2 ml-2 w-full">
                {report.assetName || ""}  {report.description || "-"}
                </div>
              </div>
              <div className="mb-8 mt-4">
                <div className="flex justify-between items-start">
                  {/* ผู้แจ้ง - ซ้าย */}
                  <div className="text-center">
                    <p className="text-sm">
                      (ลงชื่อ)
                      <span className="border-b border-black border-dashed px-2" >
                        {" "}
                        {report.reportedBy}
                      </span>{" "}
                      ผู้แจ้ง
                    </p>
                    <p className="text-sm mt-1">
                      {" "}
                      ( {report.reportedBy || "ไม่ระบุ"} )
                    </p>
                  </div>
                  {/* ผู้รับคำร้อง - ขวา */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-sm">ลงชื่อ</p>
                      <div className="border-b border-black border-dashed h-6" style={{ width: '120px' }}></div>
                      <p className="text-sm">ผู้รับคำร้อง</p>
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <p className="text-sm">(</p>
                      <div className="border-b border-black border-dashed flex-1 h-6"></div>
                      <p className="text-sm">)</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm">ตำแหน่ง</p>
                      <div className="border-b border-black border-dashed flex-1 h-6"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-8 mt-4">
                <p className="font-bold mb-1">ความคิดเห็น ผู้อำนวยการกองช่าง</p>
                <div className="border-b border-black border-dashed px-2 ml-2 w-full h-6 mb-1"></div>
                <div className="border-b border-black border-dashed px-2 ml-2 w-full h-6"></div>
              </div>{" "}
              <div className="flex justify-end">
                <div className="text-center">
                  <p className="text-sm">
                    <span className="px-2">( นาย สาคร อินดี )</span>
                  </p>
                  <p className="text-sm mt-1">ผู้อำนวยการกองช่าง</p>
                </div>
              </div>
              <div className="mb-8 mt-4">
                <p className="font-bold mb-1">
                  ความคิดเห็น ปลัดองค์การบริหารส่วนตำบลละหาร
                </p>
                <div className="border-b border-black border-dashed px-2 ml-2 w-full h-6 mb-1"></div>
                <div className="border-b border-black border-dashed px-2 ml-2 w-full h-6"></div>
              </div>{" "}
              <div className="flex justify-end">
                <div className="text-center">
                  <p className="text-sm">
                    <span className="px-2">( นาง มานิสา เติมสายทอง )</span>
                  </p>
                  <p className="text-sm mt-1">ปลัดองค์การบริหารส่วนตำบลละหาร</p>
                </div>
              </div>
              <div className="approve">
                <div className="mb-8 mt-4">
                  <p className="font-bold mb-1">
                    คำสั่งการ นายกองค์การบริหารส่วนตำบลละหาร
                  </p>
                  <div className="checkbox flex items-center space-x-8 mt-5">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>อนุมัติ</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>ไม่อนุมัติ</span>
                    </label>
                  </div>
                </div>{" "}
                <div className="flex justify-end">
                  <div className="text-center">
                    <p className="text-sm">
                      <span className="px-2">( นาย สรยุทธ พฤทธิไพรฑูรย์ )</span>
                    </p>
                    <p className="text-sm mt-1">
                     นายกองค์การบริหารส่วนตำบลละหาร
                    </p>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* ปิด .print */}
          </div>{" "}
          {/* ปิด max-w-4xl */}
        </div>{" "}
        {/* ปิด bg-white p-8 */}
      </div>{" "}
      {/* ปิด min-h-screen */}
    </>
  );
}
