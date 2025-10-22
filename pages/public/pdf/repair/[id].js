import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { getRepairStatus, getPriority, getEnumColor } from '../../../../lib/masterData';
import { REPAIR_STATUS_LABELS, PRIORITY_LABELS } from '../../../../lib/constants';

export default function RepairPDF() {
  const router = useRouter();
  const { id } = router.query;
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportStatusList, setReportStatusList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [repairStatusList, setRepairStatusList] = useState([]);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        console.log("🔍 Fetching repair for ID:", id);
        const response = await fetch(`/api/repairs?id=${id}`);
        console.log("📡 Response status:", response.status);

        const data = await response.json();
        console.log("📄 Response data:", data);

        if (data.success) {
          console.log("✅ Repair data:", data.data);
          setRepair(data.data);
        } else {
          console.error("❌ Error fetching repair:", data.error);
          setError(data.error);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchMasterData = async () => {
      try {
        const [reportStatusRes, priorityRes, repairStatusRes] = await Promise.all([
          fetch('/api/enums?type=report_status'),
          fetch('/api/enums?type=priority'),
          fetch('/api/enums?type=repair_status')
        ]);

        const [reportStatusData, priorityData, repairStatusData] = await Promise.all([
          reportStatusRes.json(),
          priorityRes.json(),
          repairStatusRes.json()
        ]);

        if (reportStatusData.success) setReportStatusList(reportStatusData.data);
        if (priorityData.success) setPriorityList(priorityData.data);
        if (repairStatusData.success) setRepairStatusList(repairStatusData.data);
      } catch (error) {
        console.error("❌ Error fetching master data:", error);
      }
    };

    if (id) {
      fetchRepair();
      fetchMasterData();
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
    if (typeof window !== "undefined" && repair) {
      document.title = repair.reportType === "repair" ? "รายงานงานซ่อม" : "รายงานงานติดตั้ง";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
  }, [repair]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดรายงานการซ่อม...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>
          <p className="text-gray-500 text-sm mt-2">ID: {id}</p>
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

  if (!repair) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">ไม่พบข้อมูลการซ่อม</p>
          <p className="text-gray-500 text-sm mt-2">ID: {id}</p>
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
              padding: 10mm !important;
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

                <h1 className="text-2xl font-bold text-center mb-6">
                  บันทึกข้อความ
                </h1>

                <div className="mb-4 normal-line-height">
                  <p><span className="font-bold">ส่วนราชการ</span> กองช่าง องค์การบริหารส่วนตำบลละหาร</p>
                  <p><span className="font-bold">ที่</span> {repair.ticketId || "ไม่ระบุ"}</p>
                  <p><span className="font-bold">วันที่</span> {new Date().toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                  <p><span className="font-bold">เรื่อง</span> {repair.reportType === "repair" ? "รายงานผลการดำเนินงานซ่อมแซม" : "รายงานผลการดำเนินงานติดตั้งไฟฟ้าสาธารณะ"}</p>
                </div>

                <div className="mb-4 normal-line-height">
                  <p><span className="font-bold">เรียน</span> นายกองค์การบริหารส่วนตำบลละหาร</p>
                </div>

                <div className="mb-4 normal-line-height">
                  <p><span className="font-bold">สิ่งที่ส่งมาด้วย</span></p>
                  <p>{repair.reportType === "repair" ? "รายงานการดำเนินงานซ่อมแซม" : "รายงานการดำเนินงานติดตั้ง"} จำนวน 1 ชุด</p>
                </div>
              </div>
              
              {/* Content - แยกตาม reportType */}
              <div className="mb-6 normal-line-height">
                {repair.reportType === "repair" ? (
                  <>
                    <p className="mb-4">
                      ด้วยกองช่าง องค์การบริหารส่วนตำบลละหาร ได้รับการอนุมัติให้ดำเนินการซ่อมแซมทรัพย์สิน 
                      รหัส {repair.assetCode || "ไม่ระบุ"} ({repair.assetName || "ไม่ระบุ"}) 
                      ตามแผนการดำเนินงานประจำปี
                    </p>
                    
                    <p className="mb-4">
                      บัดนี้การปฏิบัติงานเสร็จสิ้นเป็นที่เรียบร้อยแล้ว จึงขอเสนอรายงานผลการดำเนินงานซ่อมแซมดังกล่าว 
                      ตามเอกสารดังแนบมาพร้อมนี้
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-4">
                      ด้วยกองช่าง องค์การบริหารส่วนตำบลละหาร ได้รับการอนุมัติให้ดำเนินการติดตั้งไฟฟ้าสาธารณะ 
                      รหัส {repair.assetCode || ""} {" "}
                      ณ บริเวณ {repair.location || repair.assetLocation || "ไม่ระบุ"} 
                      ตามแผนการดำเนินงานประจำปี
                    </p>
                    
                    <p className="mb-4">
                      บัดนี้การปฏิบัติงานเสร็จสิ้นเป็นที่เรียบร้อยแล้ว จึงขอเสนอรายงานผลการดำเนินงานติดตั้งดังกล่าว 
                      ตามเอกสารดังแนบมาพร้อมนี้
                    </p>
                  </>
                )}
                
                <p className="mb-4">
                  จึงเรียนมาเพื่อโปรดทราบ
                </p>
              </div>
              
              {/* รายละเอียดโครงการ */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">รายละเอียดโครงการ</h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-bold w-32">รหัสทรัพย์สิน:</span>
                    <span>{repair.assetCode || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ชื่อทรัพย์สิน:</span>
                    <span>{repair.assetName || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">หมู่บ้าน:</span>
                    <span>{repair.villageName || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">วันที่แจ้ง:</span>
                    <span>{repair.reportedAt ? new Date(repair.reportedAt).toLocaleDateString('th-TH') : "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ผู้แจ้ง:</span>
                    <span>{repair.reportedBy || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">รายละเอียดงาน:</span>
                    <span>{repair.description || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">สถานะงาน:</span>
                    <span>{REPAIR_STATUS_LABELS[repair.status] || repair.status || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ความสำคัญ:</span>
                    <span>{PRIORITY_LABELS[repair.priority] || repair.priority || "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ช่างผู้รับผิดชอบ:</span>
                    <span>{repair.technicianName || "ยังไม่ได้มอบหมาย"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">งบประมาณ (ประเมิน):</span>
                    <span>{repair.estimatedCost ? `฿${Number(repair.estimatedCost).toLocaleString()}` : "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ค่าใช้จ่ายจริง:</span>
                    <span>{repair.actualCost ? `฿${Number(repair.actualCost).toLocaleString()}` : "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">กำหนดเสร็จ:</span>
                    <span>{repair.dueDate ? new Date(repair.dueDate).toLocaleDateString('th-TH') : "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">วันที่เสร็จสิ้น:</span>
                    <span>{repair.completedDate ? new Date(repair.completedDate).toLocaleDateString('th-TH') : "-"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">สถานที่:</span>
                    <span>{repair.assetName || repair.location || "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">พิกัด:</span>
                    <span>{repair.latitude && repair.longitude 
                      ? `${Number(repair.latitude).toFixed(6)}, ${Number(repair.longitude).toFixed(6)}`
                      : "ไม่ระบุ"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-32">ผลการดำเนินงาน:</span>
                    <span>{repair.notes || "-"}</span>
                  </div>
                </div>
              </div>

              {/* ลายเซ็นผู้รับผิดชอบโครงการ */}
              <div className="mb-8 mt-8">
                <div className="flex justify-end">
                  <div className="text-center">
                    <div className="mb-4">
                      <p className="text-sm">ลงชื่อ</p>
                      <div className="border-b border-black border-dashed w-32 mx-auto h-8"></div>
                      <p className="text-sm mt-2">( นาย สาคร อินดี )</p>
                      <p className="text-sm">ผู้อำนวยการกองช่าง</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ส่วนการพิจารณา */}
              <div className="mb-8">
                <p className="mb-2">ผู้รับผิดชอบโครงการได้เสนอรายงานผลการดำเนินงานโครงการ</p>
                <p className="mb-4">จึงเรียนมาเพื่อโปรดพิจารณา</p>
                <div className="checkbox flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>ทราบ</span>
                </div>
              </div>

              {/* ลายเซ็นปลัด */}
              <div className="mb-8">
                <div className="flex justify-end">
                  <div className="text-center">
                    <div className="mb-4">
                      <p className="text-sm">ลงชื่อ</p>
                      <div className="border-b border-black border-dashed w-32 mx-auto h-8"></div>
                      <p className="text-sm mt-2">( นาง มานิสา เติมสายทอง )</p>
                      <p className="text-sm">ปลัดองค์การบริหารส่วนตำบลละหาร</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* คำสั่งการนายก */}
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
                </div>
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

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
