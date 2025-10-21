import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Thai font
Font.register({
  family: 'Sarabun',
  src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKkNZoYGcFhMvLk.woff2',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Sarabun',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #000000',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerInfo: {
    textAlign: 'right',
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 20,
  },
  underline: {
    borderBottom: '1 solid #000000',
    paddingBottom: 2,
    minWidth: 200,
    marginLeft: 10,
  },
  checkbox: {
    marginRight: 10,
    fontSize: 16,
  },
  descriptionBox: {
    border: '1 solid #000000',
    minHeight: 120,
    padding: 15,
    marginBottom: 20,
    lineHeight: 1.8,
    fontSize: 16,
  },
  signature: {
    marginTop: 50,
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 200,
    alignItems: 'center',
  },
  signatureLine: {
    borderBottom: '1 solid #000000',
    height: 40,
    marginBottom: 10,
    width: '100%',
  },
  signatureText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },
  signatureName: {
    fontSize: 12,
    marginTop: 5,
  },
});

const ReportPDF = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>คำร้องแจ้งซ่อม/ติดตั้งระบบไฟฟ้า</Text>
        <View style={styles.headerInfo}>
          <Text>เขียนที่ กองช่าง องค์การบริหารส่วนตำบลละหาร</Text>
          <Text>วันที่ {new Date().toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>
      </View>

      {/* Subject Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>เรื่อง</Text>
          <Text style={styles.checkbox}>
            {report.reportType === 'repair' ? '☑' : '☐'}
          </Text>
          <Text>ซ่อมแซมไฟฟ้าสาธารณะ</Text>
          <Text style={styles.checkbox}>☐</Text>
          <Text>เพิ่มจุดติดตั้งไฟฟ้าสาธารณะ</Text>
          <Text style={styles.checkbox}>☐</Text>
          <Text>อื่นๆ ........................</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>เรียน</Text>
          <Text>นายกองค์การบริหารส่วนตำบลละหาร</Text>
        </View>
      </View>

      {/* Personal Info Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>ข้าพเจ้า</Text>
          <View style={styles.underline}>
            <Text>{report.reportedBy || 'ไม่ระบุ'}</Text>
          </View>
          <Text>.อายุ</Text>
          <View style={styles.underline}>
            <Text>ไม่ระบุ</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>บ้านเลขที่</Text>
          <View style={styles.underline}>
            <Text>ไม่ระบุ</Text>
          </View>
          <Text>หมู่ที่</Text>
          <View style={styles.underline}>
            <Text>ไม่ระบุ</Text>
          </View>
          <Text>ตำบลละหาร</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>อำเภอปลวกแดง จังหวัดระยอง เบอร์โทรศัพท์</Text>
          <View style={styles.underline}>
            <Text>{report.reporterPhone || 'ไม่ระบุ'}</Text>
          </View>
        </View>
      </View>

      {/* Request Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ข้าพเจ้ามีความประสงค์ขอให้องค์การบริหารส่วนตำบลละหาร ดำเนินการดังนี้
        </Text>
        
        <View style={styles.row}>
          <Text style={styles.checkbox}>
            {report.reportType === 'repair' ? '☑' : '☐'}
          </Text>
          <Text>ซ่อมแซมไฟฟ้าสาธารณะ บริเวณ</Text>
          <View style={styles.underline}>
            <Text>{report.location || 'ไม่ระบุ'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.checkbox}>☐</Text>
          <Text>เพิ่มจุดติดตั้งไฟฟ้าสาธารณะ บริเวณ</Text>
          <View style={styles.underline}>
            <Text>........................</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.checkbox}>☐</Text>
          <Text>อื่นๆ</Text>
          <View style={styles.underline}>
            <Text>........................</Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          เนื่องจากได้เกิดการชำรุดโดยมีรายละเอียด ดังนี้
        </Text>
        <View style={styles.descriptionBox}>
          <Text>{report.description || 'ไม่ระบุรายละเอียด'}</Text>
        </View>
      </View>

      {/* Signature */}
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>(ลงชื่อ) ผู้แจ้ง</Text>
          <Text style={styles.signatureName}>{report.reportedBy || 'ไม่ระบุ'}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
